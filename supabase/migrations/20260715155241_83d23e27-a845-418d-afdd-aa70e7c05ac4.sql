ALTER TABLE public.nail_models
  ADD COLUMN length TEXT NOT NULL DEFAULT 'Médio',
  ADD COLUMN secondary_color TEXT,
  ADD COLUMN style TEXT NOT NULL DEFAULT 'Decorada',
  ADD COLUMN keywords TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN description TEXT NOT NULL DEFAULT '';