-- ENUM: app_role
CREATE TYPE public.app_role AS ENUM ('admin', 'creator');

-- ENUM: campaign_status
CREATE TYPE public.campaign_status AS ENUM ('draft', 'active', 'paused', 'closed');

-- ENUM: platform_type
CREATE TYPE public.platform_type AS ENUM ('instagram', 'youtube', 'both');

-- ENUM: creator_tier
CREATE TYPE public.creator_tier AS ENUM ('nano', 'micro', 'mid', 'macro');

-- ENUM: application_status
CREATE TYPE public.application_status AS ENUM ('applied', 'approved', 'rejected', 'script_submitted', 'script_approved', 'revision_requested', 'video_submitted', 'video_approved', 'posted', 'verified', 'paid', 'withdrawn');

-- ENUM: submission_kind
CREATE TYPE public.submission_kind AS ENUM ('script', 'video');

-- ENUM: transaction_kind
CREATE TYPE public.transaction_kind AS ENUM ('earning', 'withdrawal', 'bonus', 'referral', 'adjustment');

-- ENUM: transaction_status
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed');

-- ENUM: withdrawal_status
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'processing', 'paid', 'failed');

-- ENUM: kyc_status
CREATE TYPE public.kyc_status AS ENUM ('not_started', 'pending', 'verified', 'rejected');

-- ENUM: notification_kind
CREATE TYPE public.notification_kind AS ENUM ('campaign', 'application', 'wallet', 'system');

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'creator'
);


--
-- Name: application_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.application_status AS ENUM (
    'applied',
    'approved',
    'rejected',
    'script_submitted',
    'script_approved',
    'revision_requested',
    'video_submitted',
    'video_approved',
    'posted',
    'verified',
    'paid',
    'withdrawn'
);


--
-- Name: campaign_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.campaign_status AS ENUM (
    'draft',
    'active',
    'paused',
    'closed'
);


--
-- Name: creator_tier; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.creator_tier AS ENUM (
    'nano',
    'micro',
    'mid',
    'macro'
);


--
-- Name: kyc_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.kyc_status AS ENUM (
    'not_started',
    'pending',
    'verified',
    'rejected'
);


--
-- Name: notification_kind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_kind AS ENUM (
    'campaign',
    'application',
    'wallet',
    'system'
);


--
-- Name: platform_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.platform_type AS ENUM (
    'instagram',
    'youtube',
    'both'
);


--
-- Name: submission_kind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.submission_kind AS ENUM (
    'script',
    'video'
);


--
-- Name: transaction_kind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.transaction_kind AS ENUM (
    'earning',
    'withdrawal',
    'bonus',
    'referral',
    'adjustment'
);


--
-- Name: transaction_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.transaction_status AS ENUM (
    'pending',
    'completed',
    'failed'
);


--
-- Name: withdrawal_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.withdrawal_status AS ENUM (
    'pending',
    'processing',
    'paid',
    'failed'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
END $$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;


--
-- Name: recompute_campayn_score(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.recompute_campayn_score(_user_id uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_done int := 0;
  v_total int := 0;
  v_paid int := 0;
  v_revisions int := 0;
  v_avg_views int := 0;
  v_eng numeric := 0;
  v_score int := 0;
  v_rel numeric := 0;
  v_quality numeric := 0;
  v_views_tier int := 0;
  v_breakdown jsonb;
BEGIN
  SELECT count(*), count(*) FILTER (WHERE status IN ('paid','verified','posted','withdrawn'))
    INTO v_total, v_done FROM public.applications WHERE user_id = _user_id;
  SELECT count(*) INTO v_paid FROM public.applications WHERE user_id = _user_id AND status = 'paid';
  SELECT count(*) INTO v_revisions FROM public.applications WHERE user_id = _user_id AND status = 'revision_requested';

  SELECT COALESCE(avg(avg_views),0)::int, COALESCE(avg(engagement_rate),0)
    INTO v_avg_views, v_eng FROM public.social_connections WHERE user_id = _user_id;

  v_rel := CASE WHEN v_total = 0 THEN 0 ELSE LEAST(100, (v_done::numeric / v_total) * 100) END;
  v_quality := CASE WHEN (v_done + v_revisions) = 0 THEN 0.5 ELSE v_done::numeric / (v_done + v_revisions) END;
  v_views_tier := CASE
    WHEN v_avg_views >= 250000 THEN 200
    WHEN v_avg_views >= 50000  THEN 120
    WHEN v_avg_views >= 5000   THEN 50
    ELSE 0 END;

  v_score := LEAST(200, v_done * 8)
           + LEAST(200, (v_rel * 2)::int)
           + LEAST(200, (v_eng * 10)::int)
           + v_views_tier
           + (v_quality * 200)::int;

  v_breakdown := jsonb_build_object(
    'campaigns_done', v_done,
    'campaigns_total', v_total,
    'reliability_pct', round(v_rel,1),
    'engagement_rate_pct', round(v_eng,2),
    'avg_views', v_avg_views,
    'avg_views_tier_pts', v_views_tier,
    'content_quality_pts', (v_quality * 200)::int,
    'final_score', v_score
  );

  UPDATE public.profiles
    SET campayn_score = v_score, score_breakdown = v_breakdown, updated_at = now()
    WHERE id = _user_id;

  RETURN v_score;
END;
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;


--
-- Name: trg_recompute_score(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_recompute_score() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  PERFORM public.recompute_campayn_score(COALESCE(NEW.user_id, OLD.user_id));
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    campaign_id uuid NOT NULL,
    status public.application_status DEFAULT 'applied'::public.application_status NOT NULL,
    estimated_earning_inr integer DEFAULT 0 NOT NULL,
    post_url text,
    verified_views integer,
    final_earning_inr integer,
    brand_feedback text,
    applied_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    posted_at timestamp with time zone,
    payout_due_at timestamp with time zone,
    is_flagged boolean DEFAULT false NOT NULL,
    flag_reason text
);

ALTER TABLE ONLY public.applications REPLICA IDENTITY FULL;


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brand_name text NOT NULL,
    brand_logo_url text,
    cover_image_url text,
    title text NOT NULL,
    tagline text,
    brief text NOT NULL,
    deliverables text[] DEFAULT '{}'::text[] NOT NULL,
    do_dont jsonb DEFAULT '{"do": [], "dont": []}'::jsonb NOT NULL,
    platform public.platform_type DEFAULT 'both'::public.platform_type NOT NULL,
    target_niches text[] DEFAULT '{}'::text[] NOT NULL,
    target_tiers public.creator_tier[] DEFAULT '{nano,micro,mid,macro}'::public.creator_tier[] NOT NULL,
    cpv_paise integer DEFAULT 50 NOT NULL,
    budget_inr integer DEFAULT 0 NOT NULL,
    slots_total integer DEFAULT 10 NOT NULL,
    slots_filled integer DEFAULT 0 NOT NULL,
    requires_script boolean DEFAULT false NOT NULL,
    deadline timestamp with time zone,
    status public.campaign_status DEFAULT 'active'::public.campaign_status NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    payout_window_days integer DEFAULT 7 NOT NULL,
    key_messages text[] DEFAULT '{}'::text[] NOT NULL,
    hashtags text[] DEFAULT '{}'::text[] NOT NULL
);


--
-- Name: kyc; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kyc (
    user_id uuid NOT NULL,
    status public.kyc_status DEFAULT 'not_started'::public.kyc_status NOT NULL,
    pan_number text,
    pan_name text,
    aadhaar_last4 text,
    notes text,
    submitted_at timestamp with time zone,
    verified_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    kind public.notification_kind NOT NULL,
    title text NOT NULL,
    body text,
    deep_link text,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.notifications REPLICA IDENTITY FULL;


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    display_name text,
    bio text,
    avatar_url text,
    dob date,
    city text,
    state text,
    languages text[] DEFAULT '{}'::text[],
    niches text[] DEFAULT '{}'::text[],
    gender text,
    phone text,
    coin_balance integer DEFAULT 0 NOT NULL,
    lifetime_earnings integer DEFAULT 0 NOT NULL,
    profile_completion integer DEFAULT 20 NOT NULL,
    referral_code text,
    onboarding_complete boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    campayn_score integer DEFAULT 0 NOT NULL,
    score_breakdown jsonb DEFAULT '{}'::jsonb NOT NULL,
    instagram_bio text,
    youtube_about text
);


--
-- Name: social_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    platform public.platform_type NOT NULL,
    handle text NOT NULL,
    followers integer DEFAULT 0 NOT NULL,
    avg_views integer DEFAULT 0 NOT NULL,
    engagement_rate numeric(5,2) DEFAULT 0 NOT NULL,
    tier public.creator_tier DEFAULT 'nano'::public.creator_tier NOT NULL,
    connected_at timestamp with time zone DEFAULT now() NOT NULL,
    is_stub boolean DEFAULT true NOT NULL
);


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    application_id uuid NOT NULL,
    kind public.submission_kind NOT NULL,
    content text,
    asset_url text,
    feedback text,
    approved boolean,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    kind public.transaction_kind NOT NULL,
    amount_inr integer NOT NULL,
    status public.transaction_status DEFAULT 'completed'::public.transaction_status NOT NULL,
    description text,
    application_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: view_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.view_snapshots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    application_id uuid NOT NULL,
    captured_at timestamp with time zone DEFAULT now() NOT NULL,
    views integer DEFAULT 0 NOT NULL
);


--
-- Name: withdrawals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.withdrawals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    amount_inr integer NOT NULL,
    destination_kind text NOT NULL,
    destination_value text NOT NULL,
    status public.withdrawal_status DEFAULT 'pending'::public.withdrawal_status NOT NULL,
    reference text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: applications applications_user_id_campaign_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_user_id_campaign_id_key UNIQUE (user_id, campaign_id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: kyc kyc_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kyc
    ADD CONSTRAINT kyc_pkey PRIMARY KEY (user_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_referral_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_referral_code_key UNIQUE (referral_code);


--
-- Name: social_connections social_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_connections
    ADD CONSTRAINT social_connections_pkey PRIMARY KEY (id);


--
-- Name: social_connections social_connections_user_id_platform_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_connections
    ADD CONSTRAINT social_connections_user_id_platform_key UNIQUE (user_id, platform);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: view_snapshots view_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.view_snapshots
    ADD CONSTRAINT view_snapshots_pkey PRIMARY KEY (id);


--
-- Name: withdrawals withdrawals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_pkey PRIMARY KEY (id);


--
-- Name: applications_user_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX applications_user_status_idx ON public.applications USING btree (user_id, status);


--
-- Name: campaigns_status_deadline_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX campaigns_status_deadline_idx ON public.campaigns USING btree (status, deadline);


--
-- Name: idx_view_snapshots_app; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_view_snapshots_app ON public.view_snapshots USING btree (application_id, captured_at);


--
-- Name: notifications_user_read_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_read_idx ON public.notifications USING btree (user_id, read, created_at DESC);


--
-- Name: transactions_user_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_user_created_idx ON public.transactions USING btree (user_id, created_at DESC);


--
-- Name: applications app_status_recompute; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER app_status_recompute AFTER INSERT OR UPDATE OF status ON public.applications FOR EACH ROW EXECUTE FUNCTION public.trg_recompute_score();


--
-- Name: applications trg_applications_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_applications_updated BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: campaigns trg_campaigns_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_campaigns_updated BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: kyc trg_kyc_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_kyc_updated BEFORE UPDATE ON public.kyc FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: profiles trg_profiles_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: withdrawals trg_withdrawals_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_withdrawals_updated BEFORE UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: applications applications_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: applications applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: campaigns campaigns_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: kyc kyc_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kyc
    ADD CONSTRAINT kyc_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: social_connections social_connections_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_connections
    ADD CONSTRAINT social_connections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE SET NULL;


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: view_snapshots view_snapshots_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.view_snapshots
    ADD CONSTRAINT view_snapshots_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: withdrawals withdrawals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: applications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

--
-- Name: applications apps admin delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "apps admin delete" ON public.applications FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: applications apps self insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "apps self insert" ON public.applications FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: applications apps self read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "apps self read" ON public.applications FOR SELECT TO authenticated USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: applications apps self update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "apps self update" ON public.applications FOR UPDATE TO authenticated USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: campaigns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: campaigns campaigns admin write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "campaigns admin write" ON public.campaigns TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: campaigns campaigns read all auth; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "campaigns read all auth" ON public.campaigns FOR SELECT TO authenticated USING (true);


--
-- Name: kyc; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.kyc ENABLE ROW LEVEL SECURITY;

--
-- Name: kyc kyc self all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "kyc self all" ON public.kyc TO authenticated USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role))) WITH CHECK (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: notifications notif admin insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "notif admin insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR (auth.uid() = user_id)));


--
-- Name: notifications notif self read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "notif self read" ON public.notifications FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: notifications notif self update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "notif self update" ON public.notifications FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles self insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = id));


--
-- Name: profiles profiles self select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "profiles self select" ON public.profiles FOR SELECT TO authenticated USING (((auth.uid() = id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: profiles profiles self update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = id));


--
-- Name: user_roles roles admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "roles admin manage" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles roles self read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "roles self read" ON public.user_roles FOR SELECT TO authenticated USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: social_connections social self all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "social self all" ON public.social_connections TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: social_connections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

--
-- Name: submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: submissions subs insert self; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "subs insert self" ON public.submissions FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.applications a
  WHERE ((a.id = submissions.application_id) AND (a.user_id = auth.uid())))));


--
-- Name: submissions subs read self; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "subs read self" ON public.submissions FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.applications a
  WHERE ((a.id = submissions.application_id) AND ((a.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role))))));


--
-- Name: submissions subs update admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "subs update admin" ON public.submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: transactions tx admin write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "tx admin write" ON public.transactions TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: transactions tx read self; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "tx read self" ON public.transactions FOR SELECT TO authenticated USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: view_snapshots; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.view_snapshots ENABLE ROW LEVEL SECURITY;

--
-- Name: view_snapshots vs admin write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "vs admin write" ON public.view_snapshots TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: view_snapshots vs self read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "vs self read" ON public.view_snapshots FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.applications a
  WHERE ((a.id = view_snapshots.application_id) AND ((a.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role))))));


--
-- Name: withdrawals wd admin update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "wd admin update" ON public.withdrawals FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: withdrawals wd self insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "wd self insert" ON public.withdrawals FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: withdrawals wd self read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "wd self read" ON public.withdrawals FOR SELECT TO authenticated USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: withdrawals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


