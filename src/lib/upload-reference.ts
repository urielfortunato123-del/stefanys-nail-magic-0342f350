import { supabase } from "@/integrations/supabase/client";

const BUCKET = "referencias-clientes";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 dias

export interface UploadResult {
  path: string;
  signedUrl: string;
}

export async function compressImage(file: File, maxSize = 1600, quality = 0.85): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
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
    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob(res, "image/jpeg", quality),
    );
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function uploadReferenceImage(file: File): Promise<UploadResult> {
  const compressed = await compressImage(file);
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const ext = compressed.name.split(".").pop() || "jpg";
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${year}/${month}/${id}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed, {
      cacheControl: "3600",
      upsert: false,
      contentType: compressed.type || "image/jpeg",
    });
  if (uploadError) throw uploadError;

  const { data, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (signError || !data?.signedUrl) {
    throw signError ?? new Error("Não foi possível gerar o link da imagem.");
  }

  return { path, signedUrl: data.signedUrl };
}

/**
 * Tenta compartilhar uma imagem hospedada (via signed URL) através do Web Share API.
 * Fallback: retorna false para que o chamador use `wa.me` com o link.
 */
export async function tryShareRemoteImage(
  url: string,
  filename: string,
  text: string,
  title: string,
): Promise<boolean> {
  try {
    if (
      typeof navigator === "undefined" ||
      typeof navigator.share !== "function" ||
      typeof navigator.canShare !== "function"
    ) {
      return false;
    }
    const res = await fetch(url);
    if (!res.ok) return false;
    const blob = await res.blob();
    const ext = blob.type.includes("png") ? "png" : "jpg";
    const file = new File([blob], `${filename}.${ext}`, {
      type: blob.type || "image/jpeg",
    });
    if (!navigator.canShare({ files: [file] })) return false;
    await navigator.share({ title, text, files: [file] });
    return true;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return true; // usuário cancelou
    return false;
  }
}
