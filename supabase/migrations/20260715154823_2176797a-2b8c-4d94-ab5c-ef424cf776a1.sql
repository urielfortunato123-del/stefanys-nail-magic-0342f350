CREATE TABLE public.nail_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  shape TEXT NOT NULL,
  main_color TEXT NOT NULL,
  finish TEXT NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  duration TEXT NOT NULL DEFAULT '2h',
  durability TEXT NOT NULL DEFAULT '3 a 4 semanas',
  featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.nail_models TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nail_models TO authenticated;
GRANT ALL ON public.nail_models TO service_role;

ALTER TABLE public.nail_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active models"
ON public.nail_models
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_nail_models_updated_at
BEFORE UPDATE ON public.nail_models
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_nail_models_active_sort ON public.nail_models (is_active, sort_order DESC, created_at DESC);