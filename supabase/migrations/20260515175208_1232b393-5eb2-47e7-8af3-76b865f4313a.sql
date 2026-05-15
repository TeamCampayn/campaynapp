CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  ref TEXT;
BEGIN
  ref := upper(substr(replace(NEW.id::text, '-', ''), 1, 6));
  INSERT INTO public.profiles (id, display_name, referral_code, coin_balance, lifetime_earnings)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), 'CMP' || ref, 100, 100);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'creator');
  INSERT INTO public.kyc (user_id) VALUES (NEW.id);
  INSERT INTO public.transactions (user_id, kind, amount_inr, description)
  VALUES (NEW.id, 'bonus', 100, 'Welcome bonus');
  INSERT INTO public.notifications (user_id, kind, title, body)
  VALUES (NEW.id, 'system', 'Welcome to Campayn! You got 100 coins', 'Connect your Instagram or YouTube to unlock personalised earnings.');
  RETURN NEW;
END $function$;