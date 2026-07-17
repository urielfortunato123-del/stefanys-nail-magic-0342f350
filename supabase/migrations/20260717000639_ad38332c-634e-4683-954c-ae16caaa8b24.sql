
DROP TRIGGER IF EXISTS trg_inspiracoes_updated ON public.inspiracoes;

CREATE OR REPLACE FUNCTION public.update_inspiracoes_atualizado_em()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_inspiracoes_atualizado
BEFORE UPDATE ON public.inspiracoes
FOR EACH ROW EXECUTE FUNCTION public.update_inspiracoes_atualizado_em();

UPDATE public.inspiracoes SET formato='Stiletto', titulo='Stiletto'
  WHERE id IN ('d522a76a-88d1-44ee-910b-c960a004e410','6af952fc-9d75-4cd6-a873-159cad0830df');

UPDATE public.inspiracoes SET formato='Mandorla', titulo='Mandorla'
  WHERE id='f7103773-d336-494b-938f-9975fa7830d2';
