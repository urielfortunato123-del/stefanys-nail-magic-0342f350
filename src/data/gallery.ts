export type NailShape =
  | "Mandorla"
  | "Almond"
  | "Bailarina"
  | "Stiletto"
  | "Quadrada"
  | "Oval";
export type NailFinish =
  | "Glitter"
  | "Encapsulado"
  | "Pedrarias"
  | "3D"
  | "Pintura Artística"
  | "Francesinha";

export type BodyPart = "hands" | "feet";

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  colors: string[];
  mainColor: string;
  shape: NailShape;
  finish: NailFinish;
  duration: string;
  durability: string;
  featured?: boolean;
  bodyPart?: BodyPart; // default "hands" quando ausente
  isProcess?: boolean; // marca cartões de etapa/processo (não resultado final)
  // opcionais (populados via banco; itens estáticos ficam com defaults)
  length?: string;
  secondaryColor?: string | null;
  style?: string;
  tags?: string[];
  occasions?: string[];
  description?: string;
}

export const galleryCategories = [
  "Todas",
  "Inspirações",
  "Francesinha",
  "Decoradas",
  "Coloridas",
  "Luxo",
  "Minimalistas",
  "Nail Art",
] as const;

export const categoryDescriptions: Record<string, string> = {
  Inspirações: "Inspirações da Stefany, organizadas pelo formato da unha.",
  Francesinha: "Elegância atemporal para quem gosta de unhas sofisticadas e delicadas.",
  Decoradas: "Unhas personalizadas feitas à mão com riqueza de detalhes.",
  Coloridas: "Modelos modernos com cores vibrantes e acabamento premium.",
  Luxo: "Modelos exclusivos para quem procura um acabamento sofisticado.",
  Minimalistas: "Beleza natural com acabamento impecável.",
  "Nail Art": "Arte feita à mão para quem ama exclusividade.",
};

// Ordem visual das categorias na página de inspirações.
export const categoryOrder: Record<string, number> = {
  Inspirações: 0,
  Luxo: 1,
  Francesinha: 2,
  Decoradas: 3,
  Coloridas: 4,
  "Nail Art": 5,
  Minimalistas: 6,
};

// Formatos disponíveis nos filtros de inspiração (mãos) — ordem alfabética.
export const inspirationShapes = [
  "Bailarina",
  "Mandorla",
  "Oval",
  "Quadrada",
  "Stiletto",
] as const;
export type InspirationShape = (typeof inspirationShapes)[number];

// Inspirações de mãos — cada cartão é identificado somente pelo formato.
// Imagens ficam em public/inspiracoes/maos/ como caminhos relativos estáveis.
// Ordenadas alfabeticamente pelo formato para facilitar a navegação.
const handInspirations: Array<{ url: string; shape: InspirationShape }> = [
  { url: "/inspiracoes/maos/inspiracao-maos-04.jpg", shape: "Bailarina" },
  { url: "/inspiracoes/maos/inspiracao-maos-09.jpg", shape: "Bailarina" },
  { url: "/inspiracoes/maos/inspiracao-maos-12.jpg", shape: "Bailarina" },
  { url: "/inspiracoes/maos/inspiracao-maos-01.jpg", shape: "Mandorla" },
  { url: "/inspiracoes/maos/inspiracao-maos-02.jpg", shape: "Mandorla" },
  { url: "/inspiracoes/maos/inspiracao-maos-05.jpg", shape: "Mandorla" },
  { url: "/inspiracoes/maos/inspiracao-maos-06.jpg", shape: "Mandorla" },
  { url: "/inspiracoes/maos/inspiracao-maos-10.jpg", shape: "Mandorla" },
  { url: "/inspiracoes/maos/inspiracao-maos-07.jpg", shape: "Oval" },
  { url: "/inspiracoes/maos/inspiracao-maos-11.jpg", shape: "Oval" },
  { url: "/inspiracoes/maos/inspiracao-maos-03.jpg", shape: "Quadrada" },
  { url: "/inspiracoes/maos/inspiracao-maos-08.jpg", shape: "Stiletto" },
  { url: "/inspiracoes/maos/inspiracao-maos-13.jpg", shape: "Stiletto" },
  { url: "/inspiracoes/maos/inspiracao-maos-14.jpg", shape: "Stiletto" },
  { url: "/inspiracoes/maos/inspiracao-maos-15.jpg", shape: "Stiletto" },
  { url: "/inspiracoes/maos/inspiracao-maos-16.jpg", shape: "Stiletto" },
  { url: "/inspiracoes/maos/inspiracao-maos-17.jpg", shape: "Stiletto" },
];

export const gallery: GalleryItem[] = [
  ...handInspirations.map<GalleryItem>((it, i) => ({
    id: `maos-${String(i + 1).padStart(2, "0")}`,
    title: `Inspiração ${String(i + 1).padStart(2, "0")}`,
    category: "Mãos",
    imageUrl: it.url,
    colors: [],
    mainColor: "",
    shape: it.shape,
    finish: "Pintura Artística",
    duration: "2h30",
    durability: "até 25 dias",
    bodyPart: "hands",
    style: "Inspiração para as mãos",
    tags: [it.shape.toLowerCase()],
    description: `Inspiração para as mãos no formato ${it.shape}.`,
  })),
  // Pedicure — inspirações para os pés (public/inspiracoes/pes/)
  ...Array.from({ length: 5 }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return {
      id: `pes-${n}`,
      title: `Inspiração ${n}`,
      category: "Pés",
      imageUrl: `/inspiracoes/pes/inspiracao-pes-${n}.jpg`,
      colors: [],
      mainColor: "",
      shape: "Quadrada" as NailShape,
      finish: "Pintura Artística" as NailFinish,
      duration: "1h30",
      durability: "até 20 dias",
      bodyPart: "feet" as BodyPart,
      style: "Inspiração para os pés",
      tags: ["pés"],
      description: "Inspiração para os pés.",
    };
  }),
];
