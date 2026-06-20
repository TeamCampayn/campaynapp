-- Create a function to check that new withdrawal requests do not exceed the user's available balance
CREATE OR REPLACE FUNCTION public.check_withdrawal_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_coin_balance INTEGER;
    v_pending_withdrawals INTEGER;
BEGIN
    -- Get current wallet balance from profile
    SELECT COALESCE(coin_balance, 0) INTO v_coin_balance
    FROM public.profiles
    WHERE id = NEW.user_id;

    -- Get sum of all pending/processing withdrawals for this user
    SELECT COALESCE(SUM(amount_inr), 0) INTO v_pending_withdrawals
    FROM public.withdrawals
    WHERE user_id = NEW.user_id AND status IN ('pending'::public.withdrawal_status, 'processing'::public.withdrawal_status);

    -- Enforce limit
    IF NEW.amount_inr > (v_coin_balance - v_pending_withdrawals) THEN
        RAISE EXCEPTION 'Insufficient balance. You have ₹% pending withdrawal(s) from a total balance of ₹%', 
            v_pending_withdrawals, v_coin_balance;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger BEFORE INSERT on public.withdrawals
DROP TRIGGER IF EXISTS trg_check_withdrawal_limit ON public.withdrawals;
CREATE TRIGGER trg_check_withdrawal_limit
BEFORE INSERT ON public.withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.check_withdrawal_limit();

-- Create secure function to process withdrawals (paid, processing, failed) atomically
CREATE OR REPLACE FUNCTION public.process_creator_withdrawal(
    p_withdrawal_id UUID,
    p_status TEXT,
    p_reference TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
    v_amount INTEGER;
    v_current_status public.withdrawal_status;
    v_destination TEXT;
    v_wallet_id UUID;
    v_wallet_balance NUMERIC;
    v_coin_balance INTEGER;
BEGIN
    -- 1. Fetch details and lock row to prevent race conditions
    SELECT user_id, amount_inr, status, destination_value
    INTO v_user_id, v_amount, v_current_status, v_destination
    FROM public.withdrawals
    WHERE id = p_withdrawal_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Withdrawal request not found';
    END IF;

    -- Prevent modifying already finalized requests
    IF v_current_status = 'paid'::public.withdrawal_status OR v_current_status = 'failed'::public.withdrawal_status THEN
        RAISE EXCEPTION 'Withdrawal request is already processed and marked as %', v_current_status;
    END IF;

    -- 2. Transition to Paid
    IF p_status = 'paid' THEN
        -- Double-check balance in profiles table
        SELECT coin_balance INTO v_coin_balance
        FROM public.profiles
        WHERE id = v_user_id
        FOR UPDATE;

        IF v_coin_balance < v_amount THEN
            RAISE EXCEPTION 'Insufficient balance in profile. Required: ₹%, Available: ₹%', v_amount, v_coin_balance;
        END IF;

        -- Check wallets table
        SELECT id, balance INTO v_wallet_id, v_wallet_balance
        FROM public.wallets
        WHERE user_id = v_user_id AND wallet_type = 'creator'
        FOR UPDATE;

        -- A. Update profile coin balance
        UPDATE public.profiles
        SET coin_balance = coin_balance - v_amount,
            updated_at = NOW()
        WHERE id = v_user_id;

        -- B. Update wallets table if present
        IF v_wallet_id IS NOT NULL THEN
            UPDATE public.wallets
            SET balance = balance - v_amount,
                updated_at = NOW()
            WHERE id = v_wallet_id;
        END IF;

        -- C. Insert legacy transaction log
        INSERT INTO public.transactions (user_id, kind, amount_inr, status, description, created_at)
        VALUES (
            v_user_id,
            'withdrawal',
            -v_amount,
            'completed',
            'Withdrawal to ' || v_destination,
            NOW()
        );

        -- D. Insert new wallet transaction log
        IF v_wallet_id IS NOT NULL THEN
            INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description, reference_id, created_at)
            VALUES (
                v_wallet_id,
                v_amount,
                'debit',
                'Withdrawal to ' || v_destination,
                p_withdrawal_id,
                NOW()
            );
        END IF;

        -- E. Create Notification for creator
        INSERT INTO public.notifications (user_id, kind, title, body, created_at)
        VALUES (
            v_user_id,
            'wallet',
            'Withdrawal Paid 🎉',
            '₹' || v_amount || ' has been successfully transferred to ' || v_destination,
            NOW()
        );

        -- F. Update withdrawals status
        UPDATE public.withdrawals
        SET status = 'paid'::public.withdrawal_status,
            reference = COALESCE(p_reference, 'TXN' || extract(epoch from now())::bigint::text),
            updated_at = NOW()
        WHERE id = p_withdrawal_id;

    -- 3. Transition to Processing
    ELSIF p_status = 'processing' THEN
        UPDATE public.withdrawals
        SET status = 'processing'::public.withdrawal_status,
            updated_at = NOW()
        WHERE id = p_withdrawal_id;

    -- 4. Transition to Failed (Rejected)
    ELSIF p_status = 'failed' THEN
        UPDATE public.withdrawals
        SET status = 'failed'::public.withdrawal_status,
            updated_at = NOW()
        WHERE id = p_withdrawal_id;

        -- Send failure notification
        INSERT INTO public.notifications (user_id, kind, title, body, created_at)
        VALUES (
            v_user_id,
            'wallet',
            'Withdrawal Request Failed ❌',
            'Your request of ₹' || v_amount || ' to ' || v_destination || ' was rejected or failed.',
            NOW()
        );

    ELSE
        RAISE EXCEPTION 'Invalid status transition: %', p_status;
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
