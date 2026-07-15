CREATE POLICY "Anyone can view galeria objects"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'galeria');

CREATE POLICY "Anyone can upload galeria objects"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'galeria');

CREATE POLICY "Anyone can update galeria objects"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'galeria');

CREATE POLICY "Anyone can delete galeria objects"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'galeria');

CREATE POLICY "Anon can insert nail models"
ON public.nail_models FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anon can update nail models"
ON public.nail_models FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Anon can delete nail models"
ON public.nail_models FOR DELETE
TO anon, authenticated
USING (true);

GRANT INSERT, UPDATE, DELETE ON public.nail_models TO anon;