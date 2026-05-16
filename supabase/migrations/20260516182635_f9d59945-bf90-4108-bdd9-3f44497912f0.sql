
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS key_messages text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS hashtags text[] NOT NULL DEFAULT '{}'::text[];
