export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  colors: string[];
  featured?: boolean;
}

export const galleryCategories = [
  "Todas",
  "Delicadas",
  "Francesinha",
  "Coloridas",
  "Rosa",
  "Preto",
  "Glitter",
  "Artísticas",
] as const;

export const gallery: GalleryItem[] = [
  {
    id: "nude-delicada",
    title: "Nude delicada",
    category: "Delicadas",
    imageUrl: "/images/nails/nail1.png",
    colors: ["Nude", "Rosa"],
    featured: true,
  },
  {
    id: "francesinha-classica",
    title: "Francesinha clássica",
    category: "Francesinha",
    imageUrl: "/images/nails/nail2.png",
    colors: ["Branco", "Nude"],
  },
  {
    id: "rosa-glitter",
    title: "Rosa glitter",
    category: "Glitter",
    imageUrl: "/images/nails/nail3.png",
    colors: ["Rosa", "Prata"],
  },
  {
    id: "arte-detalhada",
    title: "Arte detalhada",
    category: "Artísticas",
    imageUrl: "/images/nails/nail4.png",
    colors: ["Nude", "Dourado"],
  },
  {
    id: "rosa-clean",
    title: "Rosa clean",
    category: "Rosa",
    imageUrl: "/images/nails/nail1.png",
    colors: ["Rosa"],
  },
  {
    id: "francesinha-rosa",
    title: "Francesinha rosa",
    category: "Francesinha",
    imageUrl: "/images/nails/nail2.png",
    colors: ["Rosa", "Branco"],
  },
];
