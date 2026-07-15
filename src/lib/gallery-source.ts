import { supabase } from "@/integrations/supabase/client";
import type { GalleryItem, NailShape, NailFinish } from "@/data/gallery";
import { gallery as staticGallery, categoryOrder } from "@/data/gallery";

export type DbNailModel = {
  id: string;
  title: string;
  category: string;
  shape: string;
  length: string;
  main_color: string;
  secondary_color: string | null;
  finish: string;
  style: string;
  keywords: string[];
  occasions: string[];
  description: string;
  image_url: string;
  duration: string;
  durability: string;
  featured: boolean;
  is_active: boolean;
  sort_order: number;
};

export function toGalleryItem(row: DbNailModel): GalleryItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    imageUrl: row.image_url,
    colors: [row.main_color, ...(row.secondary_color ? [row.secondary_color] : [])],
    mainColor: row.main_color,
    shape: row.shape as NailShape,
    finish: row.finish as NailFinish,
    duration: row.duration,
    durability: row.durability,
    featured: row.featured,
    length: row.length,
    secondaryColor: row.secondary_color,
    style: row.style,
    tags: row.keywords ?? [],
    occasions: row.occasions ?? [],
    description: row.description ?? "",
  };
}

export async function loadGallery(): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from("nail_models")
    .select(
      "id,title,category,shape,length,main_color,secondary_color,finish,style,keywords,occasions,description,image_url,duration,durability,featured,is_active,sort_order",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return [...staticGallery]
      .map((g) => ({
        ...g,
        length: g.length ?? "Médio",
        style: g.style ?? g.category,
        tags: g.tags ?? [],
        occasions: g.occasions ?? [],
        description: g.description ?? "",
      }))
      .sort(
        (a, b) => (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99),
      );
  }
  return (data as DbNailModel[])
    .map(toGalleryItem)
    .sort((a, b) => (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99));
}
