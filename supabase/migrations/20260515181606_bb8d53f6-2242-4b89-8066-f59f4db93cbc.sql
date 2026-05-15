
REVOKE EXECUTE ON FUNCTION public.recompute_campayn_score(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_recompute_score() FROM PUBLIC, anon, authenticated;
