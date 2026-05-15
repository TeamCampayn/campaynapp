REVOKE EXECUTE ON FUNCTION public.recompute_campayn_score(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_recompute_score() FROM PUBLIC, anon, authenticated;

-- Tighten brand-assets: still publicly readable by direct URL, but no listing.
DROP POLICY IF EXISTS "brand assets public read" ON storage.objects;
CREATE POLICY "brand assets public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'brand-assets' AND name IS NOT NULL);