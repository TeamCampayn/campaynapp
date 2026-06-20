-- 1. Enable RLS on scheduled_refreshes and create policy
ALTER TABLE public.scheduled_refreshes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read for admin, associated creator, or associated brand" ON public.scheduled_refreshes;

CREATE POLICY "Enable read for admin, associated creator, or associated brand"
    ON public.scheduled_refreshes
    FOR SELECT
    TO authenticated
    USING (
        -- Admin check
        (EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
        ))
        OR
        -- Associated creator check
        (EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = scheduled_refreshes.application_id AND a.user_id = auth.uid()
        ))
        OR
        -- Associated brand check
        (EXISTS (
            SELECT 1 FROM public.applications a
            JOIN public.legacy_campaigns lc ON lc.id = a.campaign_id
            JOIN public.brands b ON b.user_id = lc.created_by
            WHERE a.id = scheduled_refreshes.application_id AND b.user_id = auth.uid()
        ))
    );

-- 2. Atomic creator disbursement function
CREATE OR REPLACE FUNCTION public.disburse_creator_payout(p_application_id UUID)
RETURNS VOID AS $$
DECLARE
    v_status public.application_status;
    v_final_earning INTEGER;
    v_user_id UUID;
    v_campaign_id UUID;
    v_brand_id UUID;
    v_campaign_title TEXT;
    v_brand_name TEXT;
    v_brand_wallet_id UUID;
    v_brand_balance NUMERIC;
    v_creator_wallet_id UUID;
BEGIN
    -- 1. Fetch details and lock the application row for update to prevent race conditions
    SELECT a.status, a.final_earning_inr, a.user_id, a.campaign_id, b.id, lc.title, b.brand_name
    INTO v_status, v_final_earning, v_user_id, v_campaign_id, v_brand_id, v_campaign_title, v_brand_name
    FROM public.applications a
    JOIN public.legacy_campaigns lc ON lc.id = a.campaign_id
    JOIN public.brands b ON b.user_id = lc.created_by
    WHERE a.id = p_application_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application not found';
    END IF;

    -- 2. Verify status is 'verified'
    IF v_status <> 'verified'::public.application_status THEN
        RAISE EXCEPTION 'Application must be in verified state to disburse. Current state: %', v_status;
    END IF;

    IF v_final_earning IS NULL OR v_final_earning <= 0 THEN
        RAISE EXCEPTION 'Application final earning must be greater than zero. Current: %', v_final_earning;
    END IF;

    -- 3. Check Brand Wallet
    SELECT id, balance INTO v_brand_wallet_id, v_brand_balance
    FROM public.brand_wallets
    WHERE brand_id = v_brand_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Brand wallet not found for brand %', v_brand_name;
    END IF;

    IF v_brand_balance < v_final_earning THEN
        RAISE EXCEPTION 'Insufficient brand wallet balance. Required: ₹%, Available: ₹%', v_final_earning, v_brand_balance;
    END IF;

    -- 4. Deduct from Brand Wallet
    UPDATE public.brand_wallets
    SET balance = balance - v_final_earning,
        updated_at = NOW()
    WHERE id = v_brand_wallet_id;

    -- 5. Insert Brand Transaction Log
    INSERT INTO public.brand_transactions (brand_id, amount, type, status, reference_id, description, created_at)
    VALUES (
        v_brand_id,
        v_final_earning,
        'payout',
        'completed',
        p_application_id::TEXT,
        'Escrow payout released to creator for campaign: ' || v_campaign_title,
        NOW()
    );

    -- 6. Fetch or Create Creator Wallet
    SELECT id INTO v_creator_wallet_id
    FROM public.wallets
    WHERE user_id = v_user_id AND wallet_type = 'creator'
    FOR UPDATE;

    IF NOT FOUND THEN
        INSERT INTO public.wallets (user_id, balance, wallet_type, created_at, updated_at)
        VALUES (v_user_id, v_final_earning, 'creator', NOW(), NOW())
        RETURNING id INTO v_creator_wallet_id;
    ELSE
        UPDATE public.wallets
        SET balance = balance + v_final_earning,
            updated_at = NOW()
        WHERE id = v_creator_wallet_id;
    END IF;

    -- 7. Insert Creator Wallet Transaction
    INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description, reference_id, created_at)
    VALUES (
        v_creator_wallet_id,
        v_final_earning,
        'credit',
        'Payout for campaign: ' || v_campaign_title,
        p_application_id,
        NOW()
    );

    -- 8. Insert legacy Transaction log
    INSERT INTO public.transactions (user_id, kind, amount_inr, status, description, application_id, created_at)
    VALUES (
        v_user_id,
        'earning',
        v_final_earning,
        'completed',
        v_brand_name || ' – ' || v_campaign_title,
        p_application_id,
        NOW()
    );

    -- 9. Update Creator profile coin balance
    UPDATE public.profiles
    SET coin_balance = COALESCE(coin_balance, 0) + v_final_earning,
        lifetime_earnings = COALESCE(lifetime_earnings, 0) + v_final_earning,
        updated_at = NOW()
    WHERE id = v_user_id;

    -- 10. Update application status to 'paid'
    UPDATE public.applications
    SET status = 'paid'::public.application_status,
        updated_at = NOW()
    WHERE id = p_application_id;

    -- 11. Insert Notification for creator
    INSERT INTO public.notifications (user_id, kind, title, body, created_at)
    VALUES (
        v_user_id,
        'wallet',
        '+' || v_final_earning || ' Coins credited 🎉',
        v_brand_name || ' paid out for "' || v_campaign_title || '".',
        NOW()
    );

    -- 12. Log Campaign Activity
    -- Check if campaign_activities table links to campaigns or legacy_campaigns.
    -- Wait, from schema we see public.campaign_activities.campaign_id points to public.campaigns.id.
    -- Since this is the new campaign table, we need to locate the corresponding campaigns table row if it exists.
    -- If there's no campaigns table row corresponding to this legacy_campaign, we skip campaign_activities log or use campaign_id if it exists.
    -- Let's query if campaign_id exists in campaigns table.
    IF EXISTS (SELECT 1 FROM public.campaigns WHERE id = v_campaign_id) THEN
        INSERT INTO public.campaign_activities (campaign_id, user_id, user_type, activity_type, description, created_at)
        VALUES (
            v_campaign_id,
            v_user_id,
            'admin',
            'payout_released',
            'Admin released payout of ₹' || v_final_earning || ' to creator for verified campaign deliverables.',
            NOW()
        );
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
