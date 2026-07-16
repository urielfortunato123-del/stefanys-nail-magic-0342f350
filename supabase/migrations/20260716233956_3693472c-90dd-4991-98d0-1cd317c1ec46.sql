
-- Tabela inspiracoes
CREATE TABLE public.inspiracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL DEFAULT 'Inspiração',
  tipo text NOT NULL CHECK (tipo IN ('Mãos','Pés')),
  formato text NOT NULL DEFAULT 'Não se aplica',
  estilo text NOT NULL DEFAULT 'Decorada',
  cor text NOT NULL DEFAULT 'Não informar',
  imagem_url text NOT NULL,
  storage_path text,
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  criado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

GRANT SELECT ON public.inspiracoes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inspiracoes TO authenticated;
GRANT ALL ON public.inspiracoes TO service_role;

ALTER TABLE public.inspiracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Publico ve inspiracoes ativas"
  ON public.inspiracoes FOR SELECT
  TO anon, authenticated
  USING (ativo = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Autenticadas podem inserir"
  ON public.inspiracoes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticadas podem atualizar"
  ON public.inspiracoes FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticadas podem excluir"
  ON public.inspiracoes FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Trigger para atualizado_em
CREATE TRIGGER trg_inspiracoes_updated
  BEFORE UPDATE ON public.inspiracoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices úteis
CREATE INDEX idx_inspiracoes_ativo ON public.inspiracoes(ativo);
CREATE INDEX idx_inspiracoes_tipo ON public.inspiracoes(tipo);

-- Storage: bucket 'inspiracoes' já criado. Políticas em storage.objects
CREATE POLICY "Qualquer um pode ler arquivos inspiracoes"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'inspiracoes');

CREATE POLICY "Autenticadas podem enviar em inspiracoes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'inspiracoes');

CREATE POLICY "Autenticadas podem atualizar arquivos inspiracoes"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'inspiracoes')
  WITH CHECK (bucket_id = 'inspiracoes');

CREATE POLICY "Autenticadas podem excluir arquivos inspiracoes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'inspiracoes');

-- Seed: 22 inspirações existentes (arquivos em /public/inspiracoes/)
-- Mãos
INSERT INTO public.inspiracoes (titulo, tipo, formato, estilo, cor, imagem_url, ativo, ordem) VALUES
('Inspiração','Mãos','Bailarina','Decorada','Não informar','/inspiracoes/maos/inspiracao-maos-04.jpg', true, 10),
('Inspiração','Mãos','Bailarina','Decorada','Não informar','/inspiracoes/maos/inspiracao-maos-09.jpg', true, 20),
('Inspiração','Mãos','Bailarina','Decorada','Não informar','/inspiracoes/maos/inspiracao-maos-12.jpg', true, 30),
('Inspiração','Mãos','Mandorla','Decorada','Não informar','/inspiracoes/maos/inspiracao-maos-14.jpg', true, 40),
('Inspiração','Mãos','Mandorla','Decorada','Não informar','/inspiracoes/maos/inspiracao-maos-17.jpg', true, 50),
('Inspiração','Mãos','Mandorla','Decorada','Não informar','/inspiracoes/maos/inspiracao-maos-02.jpg', true, 60),
('Inspiração','Mãos','Oval','Decorada','Não informar','/inspiracoes/maos/inspiracao-maos-07.jpg', true, 70),
('Inspiração','Mãos','Oval','Decorada','Não informar','/inspiracoes/maos/inspiracao-maos-11.jpg', true, 80),
('Inspiração','Mãos','Quadrada','Decorada','Não informar','/inspiracoes/maos/inspiracao-maos-03.jpg', true, 90),
('Inspiração','Mãos','Stiletto','Decorada','Não informar','/inspiracoes/maos/inspiracao-maos-01.jpg', true, 100),
('Inspiração','Mãos','Stiletto','Decorada','Não informar','/inspiracoes/maos/inspiracao-maos-05.jpg', true, 110),
('Inspiração','Mãos','Stiletto','Decorada','Não informar','/inspiracoes/maos/inspiracao-maos-06.jpg', true, 120),
('Inspiração','Mãos','Stiletto','Decorada','Não informar','/inspiracoes/maos/inspiracao-maos-08.jpg', true, 130),
('Inspiração','Mãos','Stiletto','Decorada','Não informar','/inspiracoes/maos/inspiracao-maos-10.jpg', true, 140),
('Inspiração','Mãos','Stiletto','Decorada','Não informar','/inspiracoes/maos/inspiracao-maos-13.jpg', true, 150),
('Inspiração','Mãos','Stiletto','Decorada','Não informar','/inspiracoes/maos/inspiracao-maos-15.jpg', true, 160),
('Inspiração','Mãos','Stiletto','Decorada','Não informar','/inspiracoes/maos/inspiracao-maos-16.jpg', true, 170),
-- Pés
('Inspiração','Pés','Quadrada','Decorada','Não informar','/inspiracoes/pes/inspiracao-pes-01.jpg', true, 200),
('Inspiração','Pés','Quadrada','Decorada','Não informar','/inspiracoes/pes/inspiracao-pes-02.jpg', true, 210),
('Inspiração','Pés','Quadrada','Decorada','Não informar','/inspiracoes/pes/inspiracao-pes-03.jpg', true, 220),
('Inspiração','Pés','Quadrada','Decorada','Não informar','/inspiracoes/pes/inspiracao-pes-04.jpg', true, 230),
('Inspiração','Pés','Quadrada','Decorada','Não informar','/inspiracoes/pes/inspiracao-pes-05.jpg', true, 240);
