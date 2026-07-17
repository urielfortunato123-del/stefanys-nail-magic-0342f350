import { supabase } from "@/integrations/supabase/client";
import type { GalleryItem, NailShape, NailFinish } from "@/data/gallery";
import { compressImage } from "@/lib/upload-reference";

export type InspiracaoTipo = "Mãos" | "Pés";
export const FORMATOS = [
  "Almond",
  "Bailarina",
  "Mandorla",
  "Oval",
  "Quadrada",
  "Stiletto",
  "Não se aplica",
] as const;
export const ESTILOS = [
  "Francesinha",
  "Decorada",
  "Esmaltação",
  "Encapsulada",
  "Nail Art",
  "Pedraria",
  "Processo",
  "Lisa",
  "Outro",
] as const;

export interface InspiracaoRow {
  id: string;
  titulo: string;
  tipo: string;
  formato: string;
  estilo: string;
  cor: string;
  imagem_url: string;
  storage_path: string | null;
  ativo: boolean;
  ordem: number;
  criado_em: string;
  atualizado_em: string;
  criado_por: string | null;
}

const BUCKET = "inspiracoes";
const SIGNED_URL_TTL = 60 * 60 * 24 * 365; // 1 ano — atualizado quando necessário

// Cache de URLs assinadas por sessão
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

/**
 * Retorna a URL a exibir. Para itens legados (imagem_url em /public), retorna direto.
 * Para itens no Storage privado, usa imagem_url salvo (URL assinada de longa duração)
 * — só regenera sob demanda quando explicitamente forçado.
 */
export async function resolveImageUrl(
  row: Pick<InspiracaoRow, "imagem_url" | "storage_path">,
  { force = false }: { force?: boolean } = {},
): Promise<string> {
  if (!row.storage_path) return row.imagem_url;
  if (!force && row.imagem_url) return row.imagem_url;
  const cached = signedUrlCache.get(row.storage_path);
  const now = Date.now();
  if (cached && cached.expiresAt > now + 60_000) return cached.url;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(row.storage_path, SIGNED_URL_TTL);
  if (data?.signedUrl) {
    signedUrlCache.set(row.storage_path, { url: data.signedUrl, expiresAt: now + SIGNED_URL_TTL * 1000 });
    return data.signedUrl;
  }
  return row.imagem_url;
}

const FORMATO_ORDER = ["Almond", "Bailarina", "Mandorla", "Oval", "Quadrada", "Stiletto", "Não se aplica"];

function formatoRank(f: string): number {
  const i = FORMATO_ORDER.indexOf(f);
  return i === -1 ? 999 : i;
}

export function toGalleryItem(row: InspiracaoRow, imageUrl: string): GalleryItem {
  const isFeet = row.tipo === "Pés";
  const shape = (FORMATOS.includes(row.formato as (typeof FORMATOS)[number]) && row.formato !== "Não se aplica"
    ? row.formato
    : "Quadrada") as NailShape;
  return {
    id: row.id,
    title: row.titulo || "Inspiração",
    category: isFeet ? "Pés" : "Mãos",
    imageUrl,
    colors: row.cor && row.cor !== "Não informar" ? [row.cor] : [],
    mainColor: row.cor && row.cor !== "Não informar" ? row.cor : "",
    shape,
    finish: "Pintura Artística" as NailFinish,
    duration: isFeet ? "1h30" : "2h30",
    durability: isFeet ? "até 20 dias" : "até 25 dias",
    bodyPart: isFeet ? "feet" : "hands",
    style: row.estilo,
    tags: [row.formato, row.estilo, row.cor].filter(Boolean).map((s) => s.toLowerCase()),
    description: `Inspiração ${row.tipo} — ${row.formato} · ${row.estilo}.`,
  };
}

const LIST_FIELDS = "id,titulo,tipo,formato,estilo,cor,imagem_url,storage_path,ativo,ordem,criado_em,atualizado_em,criado_por";

export async function listInspiracoesActive(signal?: AbortSignal): Promise<InspiracaoRow[]> {
  const q = supabase
    .from("inspiracoes")
    .select(LIST_FIELDS)
    .eq("ativo", true);
  if (signal) q.abortSignal(signal);
  const { data, error } = await q;
  if (error || !data) return [];
  return sortInspiracoes(data as unknown as InspiracaoRow[]);
}

export async function listInspiracoesAll(): Promise<InspiracaoRow[]> {
  const { data, error } = await supabase
    .from("inspiracoes")
    .select("*");
  if (error || !data) return [];
  return sortInspiracoes(data as InspiracaoRow[]);
}

export function sortInspiracoes(rows: InspiracaoRow[]): InspiracaoRow[] {
  return [...rows].sort((a, b) => {
    // 1) Tipo: Mãos antes de Pés
    if (a.tipo !== b.tipo) return a.tipo === "Mãos" ? -1 : 1;
    // 2) Formato alfabético (via ordem definida)
    const fr = formatoRank(a.formato) - formatoRank(b.formato);
    if (fr !== 0) return fr;
    // 3) Estilo alfabético
    const er = a.estilo.localeCompare(b.estilo, "pt-BR");
    if (er !== 0) return er;
    // 4) Mais recente primeiro
    return b.criado_em.localeCompare(a.criado_em);
  });
}

export async function loadGalleryFromInspiracoes(signal?: AbortSignal): Promise<GalleryItem[]> {
  const rows = await listInspiracoesActive(signal);
  // imagem_url já é utilizável (URL pública/legada ou URL assinada persistida).
  // Não geramos signed URLs em massa — evita cascata de N requisições.
  return rows.map((r) => toGalleryItem(r, r.imagem_url));
}

// ---- Upload / criação ----
async function toWebp(file: File, maxSize = 1600, quality = 0.86): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/webp", quality));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" });
  } catch {
    return compressImage(file, maxSize, quality);
  }
}

export interface CreateInspiracaoInput {
  file: File;
  tipo: InspiracaoTipo;
  formato: string;
  estilo: string;
  cor: string;
  titulo?: string;
  ativo: boolean;
}

export async function createInspiracao(input: CreateInspiracaoInput): Promise<InspiracaoRow> {
  const file = await toWebp(input.file);
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const folder = input.tipo === "Pés" ? "pes" : "maos";
  const storage_path = `${folder}/${uuid}.webp`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(storage_path, file, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });
  if (upErr) throw upErr;

  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storage_path, SIGNED_URL_TTL);
  const imagem_url = signed?.signedUrl ?? "";

  const { data: user } = await supabase.auth.getUser();
  const { data: inserted, error: insErr } = await supabase
    .from("inspiracoes")
    .insert({
      titulo: input.titulo?.trim() || "Inspiração",
      tipo: input.tipo,
      formato: input.formato,
      estilo: input.estilo,
      cor: input.cor?.trim() || "Não informar",
      imagem_url,
      storage_path,
      ativo: input.ativo,
      criado_por: user.user?.id ?? null,
    })
    .select("*")
    .single();

  if (insErr || !inserted) {
    // rollback: remove arquivo
    await supabase.storage.from(BUCKET).remove([storage_path]);
    throw insErr ?? new Error("Falha ao salvar inspiração.");
  }
  return inserted as InspiracaoRow;
}

export async function updateInspiracao(id: string, patch: Partial<Pick<InspiracaoRow, "titulo" | "tipo" | "formato" | "estilo" | "cor" | "ativo" | "ordem">>) {
  const { error } = await supabase.from("inspiracoes").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteInspiracao(row: InspiracaoRow) {
  if (row.storage_path) {
    await supabase.storage.from(BUCKET).remove([row.storage_path]);
  }
  const { error } = await supabase.from("inspiracoes").delete().eq("id", row.id);
  if (error) throw error;
}
