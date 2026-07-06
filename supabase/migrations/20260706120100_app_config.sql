-- Single-row config table. Currently just holds the kids' "magic picture
-- password" (an array of icon indexes, see src/data/gateIcons.ts) so it can
-- be changed from the Parent Dashboard without a redeploy.
CREATE TABLE IF NOT EXISTS public.app_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  family_code JSONB NOT NULL DEFAULT '[3,4,5]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO public.app_config (id, family_code) VALUES (1, '[3,4,5]'::jsonb)
  ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read of app_config"
  ON public.app_config FOR SELECT
  USING (true);

CREATE POLICY "Allow update of app_config"
  ON public.app_config FOR UPDATE
  USING (true);
