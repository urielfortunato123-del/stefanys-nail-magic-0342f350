ALTER TABLE public.nail_models
ADD COLUMN IF NOT EXISTS occasions text[] NOT NULL DEFAULT '{}';