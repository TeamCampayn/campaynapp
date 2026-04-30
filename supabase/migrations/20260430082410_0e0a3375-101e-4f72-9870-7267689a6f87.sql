
-- ============== ENUMS ==============
CREATE TYPE public.app_role AS ENUM ('admin', 'creator');
CREATE TYPE public.campaign_status AS ENUM ('draft', 'active', 'paused', 'closed');
CREATE TYPE public.platform_type AS ENUM ('instagram', 'youtube', 'both');
CREATE TYPE public.creator_tier AS ENUM ('nano', 'micro', 'mid', 'macro');
CREATE TYPE public.application_status AS ENUM (
  'applied','approved','rejected','script_submitted','script_approved',
  'revision_requested','video_submitted','video_approved','posted','verified','paid','withdrawn'
);
CREATE TYPE public.submission_kind AS ENUM ('script','video');
CREATE TYPE public.transaction_kind AS ENUM ('earning','withdrawal','bonus','referral','adjustment');
CREATE TYPE public.transaction_status AS ENUM ('pending','completed','failed');
CREATE TYPE public.withdrawal_status AS ENUM ('pending','processing','paid','failed');
CREATE TYPE public.kyc_status AS ENUM ('not_started','pending','verified','rejected');
CREATE TYPE public.notification_kind AS ENUM ('campaign','application','wallet','system');

-- ============== PROFILES ==============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  dob DATE,
  city TEXT,
  state TEXT,
  languages TEXT[] DEFAULT '{}',
  niches TEXT[] DEFAULT '{}',
  gender TEXT,
  phone TEXT,
  coin_balance INTEGER NOT NULL DEFAULT 0,
  lifetime_earnings INTEGER NOT NULL DEFAULT 0,
  profile_completion INTEGER NOT NULL DEFAULT 20,
  referral_code TEXT UNIQUE,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============== USER ROLES (separate table for security) ==============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============== SOCIAL CONNECTIONS ==============
CREATE TABLE public.social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,
  handle TEXT NOT NULL,
  followers INTEGER NOT NULL DEFAULT 0,
  avg_views INTEGER NOT NULL DEFAULT 0,
  engagement_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  tier creator_tier NOT NULL DEFAULT 'nano',
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_stub BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(user_id, platform)
);

-- ============== CAMPAIGNS ==============
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name TEXT NOT NULL,
  brand_logo_url TEXT,
  cover_image_url TEXT,
  title TEXT NOT NULL,
  tagline TEXT,
  brief TEXT NOT NULL,
  deliverables TEXT[] NOT NULL DEFAULT '{}',
  do_dont JSONB NOT NULL DEFAULT '{"do":[],"dont":[]}'::jsonb,
  platform platform_type NOT NULL DEFAULT 'both',
  target_niches TEXT[] NOT NULL DEFAULT '{}',
  target_tiers creator_tier[] NOT NULL DEFAULT '{nano,micro,mid,macro}',
  cpv_paise INTEGER NOT NULL DEFAULT 50, -- ₹ per 1000 verified views (in paise)
  budget_inr INTEGER NOT NULL DEFAULT 0,
  slots_total INTEGER NOT NULL DEFAULT 10,
  slots_filled INTEGER NOT NULL DEFAULT 0,
  requires_script BOOLEAN NOT NULL DEFAULT FALSE,
  deadline TIMESTAMPTZ,
  status campaign_status NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX campaigns_status_deadline_idx ON public.campaigns(status, deadline);

-- ============== APPLICATIONS ==============
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'applied',
  estimated_earning_inr INTEGER NOT NULL DEFAULT 0,
  post_url TEXT,
  verified_views INTEGER,
  final_earning_inr INTEGER,
  brand_feedback TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, campaign_id)
);
CREATE INDEX applications_user_status_idx ON public.applications(user_id, status);

-- ============== SUBMISSIONS ==============
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  kind submission_kind NOT NULL,
  content TEXT,           -- script text
  asset_url TEXT,         -- video url
  feedback TEXT,
  approved BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============== TRANSACTIONS ==============
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind transaction_kind NOT NULL,
  amount_inr INTEGER NOT NULL, -- positive = credit, negative = debit
  status transaction_status NOT NULL DEFAULT 'completed',
  description TEXT,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX transactions_user_created_idx ON public.transactions(user_id, created_at DESC);

-- ============== WITHDRAWALS ==============
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_inr INTEGER NOT NULL,
  destination_kind TEXT NOT NULL, -- 'upi' | 'bank'
  destination_value TEXT NOT NULL, -- vpa or masked acct
  status withdrawal_status NOT NULL DEFAULT 'pending',
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============== KYC ==============
CREATE TABLE public.kyc (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status kyc_status NOT NULL DEFAULT 'not_started',
  pan_number TEXT,
  pan_name TEXT,
  aadhaar_last4 TEXT,
  notes TEXT,
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============== NOTIFICATIONS ==============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind notification_kind NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  deep_link TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_read_idx ON public.notifications(user_id, read, created_at DESC);

-- ============== UPDATED_AT TRIGGER ==============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_campaigns_updated BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_applications_updated BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_withdrawals_updated BEFORE UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_kyc_updated BEFORE UPDATE ON public.kyc FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============== AUTO-CREATE PROFILE + ROLE ON SIGNUP ==============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref TEXT;
BEGIN
  ref := upper(substr(replace(NEW.id::text, '-', ''), 1, 6));
  INSERT INTO public.profiles (id, display_name, referral_code)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), 'CMP' || ref);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'creator');
  INSERT INTO public.kyc (user_id) VALUES (NEW.id);
  INSERT INTO public.notifications (user_id, kind, title, body)
  VALUES (NEW.id, 'system', 'Welcome to Campayn 🎉', 'Connect your Instagram or YouTube to unlock personalised earnings.');
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============== ENABLE RLS ==============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============== POLICIES ==============
-- profiles
CREATE POLICY "profiles self select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- user_roles
CREATE POLICY "roles self read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "roles admin manage" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- social_connections
CREATE POLICY "social self all" ON public.social_connections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- campaigns
CREATE POLICY "campaigns read all auth" ON public.campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "campaigns admin write" ON public.campaigns FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- applications
CREATE POLICY "apps self read" ON public.applications FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "apps self insert" ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "apps self update" ON public.applications FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "apps admin delete" ON public.applications FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- submissions
CREATE POLICY "subs read self" ON public.submissions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.applications a WHERE a.id = application_id AND (a.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "subs insert self" ON public.submissions FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.applications a WHERE a.id = application_id AND a.user_id = auth.uid())
);
CREATE POLICY "subs update admin" ON public.submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- transactions
CREATE POLICY "tx read self" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "tx admin write" ON public.transactions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- withdrawals
CREATE POLICY "wd self read" ON public.withdrawals FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "wd self insert" ON public.withdrawals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wd admin update" ON public.withdrawals FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- kyc
CREATE POLICY "kyc self all" ON public.kyc FOR ALL TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- notifications
CREATE POLICY "notif self read" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notif self update" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notif admin insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);
