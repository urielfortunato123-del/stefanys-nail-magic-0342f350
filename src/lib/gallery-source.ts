import type { GalleryItem } from "@/data/gallery";
import { gallery as staticGallery, categoryOrder } from "@/data/gallery";
import { loadGalleryFromInspiracoes } from "@/lib/inspiracoes";

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

function fallbackStatic(): GalleryItem[] {
  return [...staticGallery]
    .map((g) => ({
      ...g,
      length: g.length ?? "Médio",
      style: g.style ?? g.category,
      tags: g.tags ?? [],
      occasions: g.occasions ?? [],
      description: g.description ?? "",
    }))
    .sort((a, b) => (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99));
}

export async function loadGallery(signal?: AbortSignal): Promise<GalleryItem[]> {
  try {
    const items = await withTimeout(loadGalleryFromInspiracoes(signal), 8000);
    if (items.length > 0) return items;
  } catch (e) {
    console.error("Erro ao carregar inspirações:", e);
  }
  return fallbackStatic();
}
