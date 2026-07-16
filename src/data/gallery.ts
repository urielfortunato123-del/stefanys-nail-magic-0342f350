export type NailShape =
  | "Amendoada"
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

// Formatos disponíveis nos filtros de inspiração (mãos).
export const inspirationShapes = [
  "Amendoada",
  "Quadrada",
  "Bailarina",
  "Oval",
  "Stiletto",
] as const;
export type InspirationShape = (typeof inspirationShapes)[number];

// Inspirações de mãos — cada cartão é identificado somente pelo formato.
const handInspirations: Array<{ url: string; shape: InspirationShape }> = [
  { url: "https://res.cloudinary.com/dcii6r5op/image/upload/v1784230618/promaxx/ke7mcmwkq5bdeq3gulnw.jpg", shape: "Amendoada" },
  { url: "https://res.cloudinary.com/dcii6r5op/image/upload/v1784230619/promaxx/wpbjpgaydr2zxjiza3sd.jpg", shape: "Amendoada" },
  { url: "https://res.cloudinary.com/dcii6r5op/image/upload/v1784230620/promaxx/i8ntvl6jeaw2mhkfidwv.jpg", shape: "Quadrada" },
  { url: "https://res.cloudinary.com/dcii6r5op/image/upload/v1784230621/promaxx/a4gblkinnttoiixyy7bj.jpg", shape: "Bailarina" },
  { url: "https://res.cloudinary.com/dcii6r5op/image/upload/v1784230622/promaxx/wb67udzysmyq1cu649j5.jpg", shape: "Amendoada" },
  { url: "https://res.cloudinary.com/dcii6r5op/image/upload/v1784230623/promaxx/evtrhk3lxciy8qrphcjv.jpg", shape: "Amendoada" },
  { url: "https://res.cloudinary.com/dcii6r5op/image/upload/v1784230625/promaxx/amwebzwsac5yyt8hdjj7.jpg", shape: "Oval" },
  { url: "https://res.cloudinary.com/dcii6r5op/image/upload/v1784230626/promaxx/yr28wamdwsayupzqthjk.jpg", shape: "Stiletto" },
  { url: "https://res.cloudinary.com/dcii6r5op/image/upload/v1784230627/promaxx/y6tibniyaeekz0yyxdbz.jpg", shape: "Bailarina" },
  { url: "https://res.cloudinary.com/dcii6r5op/image/upload/v1784230629/promaxx/iesu4yshpubnpatkwkjw.jpg", shape: "Amendoada" },
  { url: "https://res.cloudinary.com/dcii6r5op/image/upload/v1784230630/promaxx/wtcw0tia1dbd5gph4wec.jpg", shape: "Oval" },
  { url: "https://res.cloudinary.com/dcii6r5op/image/upload/v1784230632/promaxx/kabfm8hifd7s3gmamwsx.jpg", shape: "Bailarina" },
  { url: "https://res.cloudinary.com/dcii6r5op/image/upload/v1784230633/promaxx/od1bxqvioij9spwdze14.jpg", shape: "Stiletto" },
  { url: "https://res.cloudinary.com/dcii6r5op/image/upload/v1784230634/promaxx/xofk5jg89w0pwejg9xfa.jpg", shape: "Stiletto" },
];

export const gallery: GalleryItem[] = [
  ...handInspirations.map<GalleryItem>((it, i) => ({
    id: `insp-${i + 1}`,
    title: it.shape,
    category: "Inspirações",
    imageUrl: it.url,
    colors: [],
    mainColor: "",
    shape: it.shape,
    finish: "Pintura Artística",
    duration: "2h30",
    durability: "até 25 dias",
    bodyPart: "hands",
    style: "Inspiração",
    tags: [it.shape.toLowerCase()],
    description: `Inspiração no formato ${it.shape}.`,
  })),
  // Pedicure
  ...[
    { url: "/__l5e/assets-v1/3035256d-b0c5-4f7c-a9a7-f67b230459cc/pes-1.jpg", title: "Pedicure 1" },
    {
      url: "/__l5e/assets-v1/69ba3883-20f9-4a4f-97fa-ab357af501ac/pes-2.jpg",
      title: "Preparação para Francesinha",
      category: "Processo de atendimento",
      description:
        "Etapa de preparação, limpeza e cuidado das unhas antes da aplicação da francesinha.",
      isProcess: true,
    },
    { url: "/__l5e/assets-v1/683b025f-318f-44d1-8f61-1a8ce930e683/pes-3.jpg", title: "Pedicure 3" },
    { url: "/__l5e/assets-v1/dd611551-4f3a-46d1-a935-5131c86f57a8/pes-4.jpg", title: "Pedicure 4" },
    { url: "/__l5e/assets-v1/806400f4-6a6b-4c21-a82f-f266237553c9/pes-5.jpg", title: "Pedicure 5" },
  ].map<GalleryItem>((it, i) => ({
    id: `pes-${i + 1}`,
    title: it.title,
    category: (it as { category?: string }).category ?? "Decoradas",
    imageUrl: it.url,
    colors: ["Variado"],
    mainColor: "Variado",
    shape: "Quadrada",
    finish: "Pintura Artística",
    duration: "1h30",
    durability: "até 20 dias",
    bodyPart: "feet",
    isProcess: (it as { isProcess?: boolean }).isProcess,
    description: (it as { description?: string }).description,
  })),
];
