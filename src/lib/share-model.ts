import type { GalleryItem } from "@/data/gallery";
import { whatsappLink } from "@/config/business";

const HIDE_SHARE_TIP_KEY = "share:hide-tip";

export function shouldShowShareTip() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(HIDE_SHARE_TIP_KEY) !== "1";
  } catch {
    return true;
  }
}

export function setHideShareTip(hide: boolean) {
  try {
    if (hide) localStorage.setItem(HIDE_SHARE_TIP_KEY, "1");
    else localStorage.removeItem(HIDE_SHARE_TIP_KEY);
  } catch {}
}

export function buildModelMessage(item: GalleryItem, observacoes?: string) {
  return `Olá, Stefany! 💅

Gostaria de fazer este modelo:

✨ Modelo: ${item.title}
📂 Categoria: ${item.category}
💅 Formato: ${item.shape}
🎨 Cor principal: ${item.mainColor}
✨ Acabamento: ${item.finish}

Observações:
${observacoes?.trim() ? observacoes.trim() : "Nenhuma observação."}`;
}

export function openWhatsAppWithImageLink(item: GalleryItem, message: string) {
  const texto = `${message}

🖼️ Foto do modelo:
${item.imageUrl}`;
  const url = whatsappLink(texto);
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Tenta compartilhar o modelo com imagem via Web Share API (menu nativo).
 * Fallback: abre o WhatsApp com link público da imagem.
 */
export async function shareModel(item: GalleryItem, observacoes?: string) {
  const message = buildModelMessage(item, observacoes);

  // Tenta com arquivo (imagem) via Web Share API
  try {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function"
    ) {
      const response = await fetch(item.imageUrl, { mode: "cors" });
      if (response.ok) {
        const blob = await response.blob();
        const ext = blob.type.includes("png") ? "png" : "jpg";
        const file = new File([blob], `modelo-${item.id}.${ext}`, {
          type: blob.type || "image/jpeg",
        });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: item.title,
            text: message,
            files: [file],
          });
          return { ok: true, method: "share-files" as const };
        }
      }
    }
  } catch (err) {
    // Se o usuário cancelar, não caímos no fallback
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, cancelled: true, method: "share-files" as const };
    }
    console.warn("Web Share API falhou, usando fallback WhatsApp:", err);
  }

  // Fallback: abrir WhatsApp com o link público da imagem
  openWhatsAppWithImageLink(item, message);
  return { ok: true, method: "whatsapp-link" as const };
}
