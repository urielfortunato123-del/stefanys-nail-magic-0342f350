
-- Allow anyone (anon + authenticated) to upload to referencias-clientes bucket
CREATE POLICY "Anyone can upload references"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'referencias-clientes');

-- Allow anyone to read (needed so createSignedUrl works from anon client)
CREATE POLICY "Anyone can read references"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'referencias-clientes');
