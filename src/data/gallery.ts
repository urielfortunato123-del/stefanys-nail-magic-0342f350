export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
  // Imagem provisória — troque pelas fotos reais da Stefany
  color: string;
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
  "Alongamento",
  "Curtas",
  "Longas",
] as const;

// Placeholders — cada card representa uma foto real a ser inserida
export const gallery: GalleryItem[] = [
  { id: "g1", title: "Nude delicada", category: "Delicadas", tags: ["Delicadas", "Curtas"], color: "#FFD4DF" },
  { id: "g2", title: "Francesinha clássica", category: "Francesinha", tags: ["Francesinha", "Delicadas"], color: "#FFFFFF" },
  { id: "g3", title: "Rosa glitter", category: "Glitter", tags: ["Glitter", "Rosa"], color: "#F7A8BD" },
  { id: "g4", title: "Preto poderoso", category: "Coloridas", tags: ["Preto", "Longas"], color: "#0b0b0b" },
  { id: "g5", title: "Arte floral", category: "Artísticas", tags: ["Artísticas", "Alongamento"], color: "#D8BE8B" },
  { id: "g6", title: "Vermelho intenso", category: "Coloridas", tags: ["Coloridas", "Longas"], color: "#B4213A" },
  { id: "g7", title: "Nude alongada", category: "Alongamento", tags: ["Alongamento", "Delicadas"], color: "#EBD3C6" },
  { id: "g8", title: "Francesinha rosa", category: "Francesinha", tags: ["Francesinha", "Rosa"], color: "#FFD4DF" },
  { id: "g9", title: "Glitter dourado", category: "Glitter", tags: ["Glitter", "Artísticas"], color: "#D8BE8B" },
];
