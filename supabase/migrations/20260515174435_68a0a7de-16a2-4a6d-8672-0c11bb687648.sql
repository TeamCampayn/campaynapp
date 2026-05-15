-- Profile additions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS campayn_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS instagram_bio text,
  ADD COLUMN IF NOT EXISTS youtube_about text;

-- Campaign additions
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS payout_window_days integer NOT NULL DEFAULT 7;

-- Application additions
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS posted_at timestamptz,
  ADD COLUMN IF NOT EXISTS payout_due_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_flagged boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS flag_reason text;

-- view_snapshots table
CREATE TABLE IF NOT EXISTS public.view_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  captured_at timestamptz NOT NULL DEFAULT now(),
  views integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_view_snapshots_app ON public.view_snapshots(application_id, captured_at);

ALTER TABLE public.view_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vs self read" ON public.view_snapshots;
CREATE POLICY "vs self read" ON public.view_snapshots
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.applications a WHERE a.id = view_snapshots.application_id AND (a.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));

DROP POLICY IF EXISTS "vs admin write" ON public.view_snapshots;
CREATE POLICY "vs admin write" ON public.view_snapshots
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Storage bucket for brand assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets','brand-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "brand assets public read" ON storage.objects;
CREATE POLICY "brand assets public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "brand assets admin write" ON storage.objects;
CREATE POLICY "brand assets admin write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'brand-assets' AND public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "brand assets admin update" ON storage.objects;
CREATE POLICY "brand assets admin update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'brand-assets' AND public.has_role(auth.uid(),'admin'));

-- Recompute Campayn Score (0..1000)
CREATE OR REPLACE FUNCTION public.recompute_campayn_score(_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Trigger to recompute on application status change
CREATE OR REPLACE FUNCTION public.trg_recompute_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.recompute_campayn_score(COALESCE(NEW.user_id, OLD.user_id));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS app_status_recompute ON public.applications;
CREATE TRIGGER app_status_recompute
AFTER INSERT OR UPDATE OF status ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.trg_recompute_score();