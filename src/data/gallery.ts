export type NailShape = "Almond" | "Bailarina" | "Stiletto" | "Quadrada";
export type NailFinish =
  | "Glitter"
  | "Encapsulado"
  | "Pedrarias"
  | "3D"
  | "Pintura Artística"
  | "Francesinha";

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
}

export const galleryCategories = [
  "Todas",
  "Francesinha",
  "Decoradas",
  "Coloridas",
  "Luxo",
  "Minimalistas",
  "Nail Art",
] as const;

export const categoryDescriptions: Record<string, string> = {
  Francesinha: "Elegância atemporal para quem gosta de unhas sofisticadas e delicadas.",
  Decoradas: "Unhas personalizadas feitas à mão com riqueza de detalhes.",
  Coloridas: "Modelos modernos com cores vibrantes e acabamento premium.",
  Luxo: "Modelos exclusivos para quem procura um acabamento sofisticado.",
  Minimalistas: "Beleza natural com acabamento impecável.",
  "Nail Art": "Arte feita à mão para quem ama exclusividade.",
};

// Ordem visual: primeiro Luxo (mais sofisticado), depois Francesinhas, Decoradas, Coloridas, Nail Art, Minimalistas.
export const categoryOrder: Record<string, number> = {
  Luxo: 1,
  Francesinha: 2,
  Decoradas: 3,
  Coloridas: 4,
  "Nail Art": 5,
  Minimalistas: 6,
};

const img = (n: string) => `https://res.cloudinary.com/dcii6r5op/image/upload/v1784128${n}/promaxx/`;

export const gallery: GalleryItem[] = [
  // Luxo
  {
    id: "luxo-pedrarias",
    title: "Pedrarias",
    category: "Luxo",
    imageUrl: img("443") + "c0xfyjjjs44toab3ctpv.jpg",
    colors: ["Nude", "Cristal"],
    mainColor: "Nude com cristais",
    shape: "Almond",
    finish: "Pedrarias",
    duration: "3h",
    durability: "até 25 dias",
    featured: true,
  },
  {
    id: "luxo-3d",
    title: "Aplicações 3D",
    category: "Luxo",
    imageUrl: img("444") + "nayorqcze5ztckgdlhtq.jpg",
    colors: ["Branco", "Dourado"],
    mainColor: "Branco Pérola",
    shape: "Bailarina",
    finish: "3D",
    duration: "3h",
    durability: "até 25 dias",
    featured: true,
  },

  // Francesinha
  {
    id: "francesinha-quadrada",
    title: "Francesinha tradicional quadrada",
    category: "Francesinha",
    imageUrl: img("433") + "dgkrjr6iyz6v2b5ghga2.jpg",
    colors: ["Branco", "Nude"],
    mainColor: "Branco Clássico",
    shape: "Quadrada",
    finish: "Francesinha",
    duration: "2h30",
    durability: "até 25 dias",
  },
  {
    id: "francesinha-almond",
    title: "Francesinha almond",
    category: "Francesinha",
    imageUrl: img("434") + "sd58c1w48zc5mxjzta2p.jpg",
    colors: ["Branco", "Nude"],
    mainColor: "Nude Rosé",
    shape: "Almond",
    finish: "Francesinha",
    duration: "2h30",
    durability: "até 25 dias",
  },
  {
    id: "francesinha-branca-classica",
    title: "Francesinha branca clássica",
    category: "Francesinha",
    imageUrl: img("435") + "ywosybiovaxxoo1ex6af.jpg",
    colors: ["Branco"],
    mainColor: "Branco Leitoso",
    shape: "Almond",
    finish: "Francesinha",
    duration: "2h30",
    durability: "até 25 dias",
  },

  // Decoradas
  {
    id: "decorada-flores-roxas",
    title: "Flores roxas",
    category: "Decoradas",
    imageUrl: img("438") + "bsin53xsexhuudackkhl.jpg",
    colors: ["Roxo", "Branco"],
    mainColor: "Roxo Lavanda",
    shape: "Almond",
    finish: "Pintura Artística",
    duration: "3h",
    durability: "até 25 dias",
  },
  {
    id: "decorada-glitter-rosa",
    title: "Glitter rosa",
    category: "Decoradas",
    imageUrl: img("439") + "q2roq9gq3c2jbcayi0kn.jpg",
    colors: ["Rosa", "Prata"],
    mainColor: "Rosa Glitter",
    shape: "Almond",
    finish: "Glitter",
    duration: "2h30",
    durability: "até 25 dias",
  },

  // Coloridas
  {
    id: "colorida-rosa-neon",
    title: "Rosa Neon",
    category: "Coloridas",
    imageUrl: img("440") + "h56dynag30tbwumyayhz.jpg",
    colors: ["Rosa"],
    mainColor: "Pink Neon",
    shape: "Bailarina",
    finish: "Encapsulado",
    duration: "2h30",
    durability: "até 25 dias",
  },
  {
    id: "colorida-branco-rose",
    title: "Branco Rosé",
    category: "Coloridas",
    imageUrl: img("449") + "a7ckoxuafylbfg4pbnp9.jpg",
    colors: ["Branco", "Rosa"],
    mainColor: "Branco Rosé",
    shape: "Almond",
    finish: "Encapsulado",
    duration: "2h30",
    durability: "até 25 dias",
  },

  // Nail Art
  {
    id: "nailart-borboletas-azuis",
    title: "Borboletas Azuis",
    category: "Nail Art",
    imageUrl: img("436") + "ll7vv76dm9raij4ps2ir.jpg",
    colors: ["Azul Royal", "Branco"],
    mainColor: "Azul Royal",
    shape: "Almond",
    finish: "Pintura Artística",
    duration: "3h",
    durability: "até 25 dias",
  },
  {
    id: "nailart-stitch",
    title: "Azul Stitch",
    category: "Nail Art",
    imageUrl: img("442") + "oj1fzhab8dn4m36kufnz.jpg",
    colors: ["Azul", "Branco"],
    mainColor: "Azul Stitch",
    shape: "Almond",
    finish: "Pintura Artística",
    duration: "3h",
    durability: "até 25 dias",
  },
  {
    id: "nailart-lacos",
    title: "Laços",
    category: "Nail Art",
    imageUrl: img("448") + "qn0nsx4hdz6kx1oxdmap.jpg",
    colors: ["Rosa", "Branco"],
    mainColor: "Rosa Bebê",
    shape: "Almond",
    finish: "Pintura Artística",
    duration: "3h",
    durability: "até 25 dias",
  },

  // Minimalistas
  {
    id: "minimalista-nude",
    title: "Nude",
    category: "Minimalistas",
    imageUrl: img("445") + "mnmpqyfnnzlsx9svklgs.jpg",
    colors: ["Nude"],
    mainColor: "Nude",
    shape: "Almond",
    finish: "Encapsulado",
    duration: "2h",
    durability: "até 25 dias",
  },
  {
    id: "minimalista-branco-leitoso",
    title: "Branco Leitoso",
    category: "Minimalistas",
    imageUrl: img("446") + "ks4syuhuttkvdtjkvecg.jpg",
    colors: ["Branco"],
    mainColor: "Branco Leitoso",
    shape: "Quadrada",
    finish: "Encapsulado",
    duration: "2h",
    durability: "até 25 dias",
  },
];

// Ordenação: featured primeiro, depois pela ordem de categoria.
gallery.sort((a, b) => {
  if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
  return (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99);
});
