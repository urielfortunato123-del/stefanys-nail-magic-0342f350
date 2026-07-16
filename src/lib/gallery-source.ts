import { supabase } from "@/integrations/supabase/client";
import type { GalleryItem } from "@/data/gallery";
import { gallery as staticGallery, categoryOrder } from "@/data/gallery";
import { loadGalleryFromInspiracoes } from "@/lib/inspiracoes";

export async function loadGallery(): Promise<GalleryItem[]> {
  try {
    const items = await loadGalleryFromInspiracoes();
    if (items.length > 0) return items;
  } catch {
    // ignora e cai no fallback
  }
  // Fallback: usa o catálogo estático empacotado no build.
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
