-- 1. Create trigger function to automatically initialize virtual wallet on brand signup
CREATE OR REPLACE FUNCTION public.handle_new_brand_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.brand_wallets (id, brand_id, balance, currency, updated_at)
    VALUES (gen_random_uuid(), NEW.id, 0.00, 'INR', NOW())
    ON CONFLICT (brand_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger on brands table
DROP TRIGGER IF EXISTS on_brand_created ON public.brands;
CREATE TRIGGER on_brand_created
    AFTER INSERT ON public.brands
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_brand_wallet();

-- 3. Backfill brand wallets for any existing brands that might not have one
INSERT INTO public.brand_wallets (id, brand_id, balance, currency, updated_at)
SELECT gen_random_uuid(), id, 0.00, 'INR', NOW()
FROM public.brands b
WHERE NOT EXISTS (
    SELECT 1 FROM public.brand_wallets bw WHERE bw.brand_id = b.id
)
ON CONFLICT (brand_id) DO NOTHING;

-- 4. Re-declare disburse_creator_payout function to fetch and log creator display name
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
    v_creator_name TEXT;
    v_brand_wallet_id UUID;
    v_brand_balance NUMERIC;
    v_creator_wallet_id UUID;
BEGIN
    -- 1. Fetch details and lock the application row for update to prevent race conditions
    SELECT a.status, a.final_earning_inr, a.user_id, a.campaign_id, b.id, lc.title, b.brand_name, COALESCE(p.display_name, 'Creator')
    INTO v_status, v_final_earning, v_user_id, v_campaign_id, v_brand_id, v_campaign_title, v_brand_name, v_creator_name
    FROM public.applications a
    JOIN public.legacy_campaigns lc ON lc.id = a.campaign_id
    JOIN public.brands b ON b.user_id = lc.created_by
    LEFT JOIN public.profiles p ON p.id = a.user_id
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

    -- 5. Insert Brand Transaction Log (Including creator display name)
    INSERT INTO public.brand_transactions (brand_id, amount, type, status, reference_id, description, created_at)
    VALUES (
        v_brand_id,
        v_final_earning,
        'payout',
        'completed',
        p_application_id::TEXT,
        'Payout to ' || v_creator_name || ' for campaign: ' || v_campaign_title,
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
    IF EXISTS (SELECT 1 FROM public.campaigns WHERE id = v_campaign_id) THEN
        INSERT INTO public.campaign_activities (campaign_id, user_id, user_type, activity_type, description, created_at)
        VALUES (
            v_campaign_id,
            v_user_id,
            'admin',
            'payout_released',
            'Admin released payout of ₹' || v_final_earning || ' to creator ' || v_creator_name || ' for verified campaign deliverables.',
            NOW()
        );
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
