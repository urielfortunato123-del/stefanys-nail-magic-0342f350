import type { GalleryItem } from "@/data/gallery";

export interface ChatOption {
  id: string;
  label: string;
  next?: string; // node id
  action?:
    | { type: "whatsapp"; message: string }
    | { type: "route"; to: string }
    | { type: "upload-broken-nail" }
    | { type: "start-model-quiz" };
}

export interface ChatNode {
  id: string;
  text: string; // markdown-ish (linhas separadas por \n)
  options: ChatOption[];
}

const MENU_OPT: ChatOption = { id: "menu", label: "Voltar ao menu", next: "menu" };
const WHATS_OPT: ChatOption = {
  id: "whats",
  label: "Falar com a Stefany",
  action: { type: "whatsapp", message: "Olá, Stefany! Estava usando o aplicativo e gostaria de tirar uma dúvida." },
};

export const chatNodes: Record<string, ChatNode> = {
  menu: {
    id: "menu",
    text: `Olá! Eu sou a assistente virtual da Stefany 💅✨

Posso ajudar você a escolher um modelo, cuidar das suas unhas ou preparar seu agendamento.

Sobre o que você gostaria de conversar?`,
    options: [
      { id: "1", label: "Quero agendar", action: { type: "route", to: "/agendar" } },
      { id: "2", label: "Quero escolher um modelo", action: { type: "start-model-quiz" } },
      { id: "3", label: "Como cuidar da unha em gel?", next: "cuidados_gel" },
      { id: "4", label: "Como fazer a unha durar mais?", next: "durar_mais" },
      { id: "5", label: "Como hidratar a cutícula?", next: "cuticula" },
      { id: "6", label: "Minha unha quebrou", next: "quebrou" },
      { id: "7", label: "Preciso fazer manutenção?", next: "manutencao" },
      { id: "8", label: "Quero remover a unha", next: "remover" },
      { id: "9", label: "Perguntas frequentes", next: "faq" },
      WHATS_OPT,
    ],
  },

  cuidados_gel: {
    id: "cuidados_gel",
    text: `Para manter suas unhas em gel bonitas e protegidas:

• Não use as unhas para abrir embalagens, latas ou objetos.
• Evite contato prolongado com produtos de limpeza.
• Utilize luvas para lavar louça e fazer limpeza.
• Hidrate as cutículas diariamente.
• Não lixe, corte ou arranque o gel em casa.
• Faça a manutenção no período indicado pela profissional.
• Caso perceba descolamento, não tente colar.

Deseja receber dicas para aumentar a durabilidade?`,
    options: [
      { id: "sim", label: "Sim, quero", next: "durar_mais" },
      {
        id: "manut",
        label: "Quero agendar manutenção",
        action: { type: "route", to: "/agendar" },
      },
      MENU_OPT,
    ],
  },

  durar_mais: {
    id: "durar_mais",
    text: `Alguns cuidados fazem uma diferença enorme na durabilidade:

✨ Use óleo de cutícula todos os dias.
✨ Não coloque as unhas na boca.
✨ Evite impactos fortes.
✨ Use luvas durante atividades domésticas.
✨ Não deixe produtos químicos entrarem por baixo da unha.
✨ Não retire partes descoladas com os dentes ou objetos.
✨ Respeite o prazo da manutenção.

A duração varia conforme o crescimento natural, rotina e cuidados de cada pessoa.

Há quanto tempo você fez suas unhas?`,
    options: [
      { id: "1", label: "Menos de 7 dias", next: "durar_mais_ok" },
      { id: "2", label: "Entre 7 e 15 dias", next: "durar_mais_ok" },
      { id: "3", label: "Entre 15 e 21 dias", next: "manutencao_sugerir" },
      { id: "4", label: "Mais de 21 dias", next: "manutencao_sugerir" },
      { id: "5", label: "Não me lembro", next: "manutencao_sugerir" },
    ],
  },

  durar_mais_ok: {
    id: "durar_mais_ok",
    text: `Que ótimo! Ainda dentro do prazo ideal. Continue com os cuidados e sua unha vai durar linda até a próxima manutenção. 💅`,
    options: [MENU_OPT, WHATS_OPT],
  },

  cuticula: {
    id: "cuticula",
    text: `Para hidratar as cutículas:

1. Aplique óleo de cutícula ao redor das unhas.
2. Massageie suavemente por alguns segundos.
3. Repita de uma a duas vezes ao dia.
4. Antes de dormir, use um hidratante para mãos.
5. Evite retirar peles com os dentes.
6. Não corte profundamente a cutícula em casa.

Óleo de jojoba, amêndoas ou produtos próprios para cutícula costumam ser boas opções.`,
    options: [
      {
        id: "rotina",
        label: "Quero criar uma rotina",
        action: {
          type: "whatsapp",
          message: "Olá, Stefany! Gostaria de ajuda para criar uma rotina de hidratação de cutícula.",
        },
      },
      WHATS_OPT,
      MENU_OPT,
    ],
  },

  quebrou: {
    id: "quebrou",
    text: `Que pena! Vamos entender melhor. Como aconteceu?`,
    options: [
      { id: "1", label: "Quebrou somente a ponta", next: "quebrou_leve" },
      { id: "2", label: "O gel descolou", next: "quebrou_leve" },
      { id: "3", label: "A unha natural rachou", next: "quebrou_grave" },
      { id: "4", label: "Está dolorida", next: "quebrou_grave" },
      { id: "5", label: "Houve sangramento", next: "quebrou_grave" },
      { id: "6", label: "Não tenho certeza", next: "quebrou_leve" },
    ],
  },

  quebrou_leve: {
    id: "quebrou_leve",
    text: `Nesses casos, o ideal é agendar uma manutenção o quanto antes para reparar sem prejudicar a unha natural.

Enquanto isso, evite mexer com objetos ou tentar colar em casa.`,
    options: [
      {
        id: "foto",
        label: "Enviar foto para Stefany",
        action: { type: "upload-broken-nail" },
      },
      {
        id: "agendar",
        label: "Agendar manutenção",
        action: { type: "route", to: "/agendar" },
      },
      WHATS_OPT,
      MENU_OPT,
    ],
  },

  quebrou_grave: {
    id: "quebrou_grave",
    text: `Não tente puxar, colar ou remover a unha sozinha.

Proteja o local e entre em contato com a Stefany para receber orientação. Caso exista dor forte, sangramento persistente ou sinais de infecção, procure atendimento de saúde.`,
    options: [
      {
        id: "foto",
        label: "Enviar foto para Stefany",
        action: { type: "upload-broken-nail" },
      },
      WHATS_OPT,
      MENU_OPT,
    ],
  },

  manutencao: {
    id: "manutencao",
    text: `Vou te ajudar a avaliar. Responda rapidinho:

• Passaram mais de 15 dias?
• Existe crescimento visível?
• Há descolamento?
• Alguma unha quebrou?
• Sente dor ou incômodo?

Se você respondeu SIM para duas ou mais dessas perguntas, é uma boa hora para agendar sua manutenção.`,
    options: [
      { id: "sim", label: "Sim, é hora", next: "manutencao_sugerir" },
      { id: "nao", label: "Ainda não", next: "durar_mais" },
      MENU_OPT,
    ],
  },

  manutencao_sugerir: {
    id: "manutencao_sugerir",
    text: `Pelas suas respostas, pode ser uma boa hora para conversar com a Stefany e verificar a manutenção. 💅`,
    options: [
      {
        id: "ver",
        label: "Ver horários disponíveis",
        action: { type: "route", to: "/agendar" },
      },
      WHATS_OPT,
      MENU_OPT,
    ],
  },

  remover: {
    id: "remover",
    text: `A remoção deve ser feita por uma profissional, para não danificar a unha natural.

Não use acetona pura nem force a saída do gel em casa. Isso pode arrancar camadas da unha.

Posso te ajudar a agendar uma remoção com a Stefany?`,
    options: [
      { id: "sim", label: "Sim, agendar remoção", action: { type: "route", to: "/agendar" } },
      WHATS_OPT,
      MENU_OPT,
    ],
  },

  faq: {
    id: "faq",
    text: `Escolha uma pergunta:`,
    options: [
      { id: "q1", label: "Quanto tempo dura a unha em gel?", next: "faq_duracao" },
      { id: "q2", label: "Quando devo fazer manutenção?", next: "faq_manut" },
      { id: "q3", label: "Posso lavar louça / entrar na piscina?", next: "faq_rotina" },
      { id: "q4", label: "A unha em gel estraga a unha natural?", next: "faq_estraga" },
      { id: "q5", label: "O que fazer quando descola?", next: "faq_descola" },
      { id: "q6", label: "Quais formas de pagamento?", next: "faq_pagamento" },
      { id: "q7", label: "Você atende em domicílio?", next: "faq_domicilio" },
      { id: "q8", label: "Como preparar as unhas antes?", next: "faq_preparar" },
      { id: "q9", label: "Como remarcar ou cancelar?", next: "faq_remarcar" },
      MENU_OPT,
    ],
  },

  faq_duracao: {
    id: "faq_duracao",
    text: `Em média, a unha em gel dura entre 20 e 30 dias, dependendo do crescimento natural e dos cuidados diários.`,
    options: [{ id: "back", label: "Voltar às perguntas", next: "faq" }, MENU_OPT],
  },
  faq_manut: {
    id: "faq_manut",
    text: `O ideal é fazer manutenção a cada 15 a 21 dias, para manter a saúde da unha e a beleza do trabalho.`,
    options: [{ id: "back", label: "Voltar às perguntas", next: "faq" }, MENU_OPT],
  },
  faq_rotina: {
    id: "faq_rotina",
    text: `Pode lavar louça e entrar na piscina, sim! O ideal é usar luvas para lavar louça e enxaguar bem as mãos após a piscina — o cloro pode ressecar.`,
    options: [{ id: "back", label: "Voltar às perguntas", next: "faq" }, MENU_OPT],
  },
  faq_estraga: {
    id: "faq_estraga",
    text: `Quando feita e removida corretamente por profissional, a unha em gel não estraga a unha natural. O que danifica é a remoção incorreta em casa.`,
    options: [{ id: "back", label: "Voltar às perguntas", next: "faq" }, MENU_OPT],
  },
  faq_descola: {
    id: "faq_descola",
    text: `Não tente colar em casa. Agende uma manutenção para que a Stefany faça o reparo corretamente e evite fungos ou lesões.`,
    options: [{ id: "back", label: "Voltar às perguntas", next: "faq" }, MENU_OPT],
  },
  faq_pagamento: {
    id: "faq_pagamento",
    text: `Aceito dinheiro, pix e cartão. Combine diretamente com a Stefany no WhatsApp.`,
    options: [{ id: "back", label: "Voltar às perguntas", next: "faq" }, WHATS_OPT, MENU_OPT],
  },
  faq_domicilio: {
    id: "faq_domicilio",
    text: `Sim! A Stefany atende em domicílio. Você pode consultar a área atendida no app.`,
    options: [
      { id: "area", label: "Ver área atendida", action: { type: "route", to: "/area-atendida" } },
      { id: "back", label: "Voltar às perguntas", next: "faq" },
      MENU_OPT,
    ],
  },
  faq_preparar: {
    id: "faq_preparar",
    text: `Deixe as unhas limpas, sem esmalte, e evite hidratar as mãos logo antes do atendimento. Se possível, higienize a região onde o atendimento vai acontecer.`,
    options: [{ id: "back", label: "Voltar às perguntas", next: "faq" }, MENU_OPT],
  },
  faq_remarcar: {
    id: "faq_remarcar",
    text: `Para remarcar ou cancelar, entre em contato direto com a Stefany pelo WhatsApp com pelo menos 24h de antecedência sempre que possível.`,
    options: [{ id: "back", label: "Voltar às perguntas", next: "faq" }, WHATS_OPT, MENU_OPT],
  },
};

// ---- Modelo Quiz ----
export interface ModelQuizAnswers {
  size?: "Curta" | "Média" | "Longa";
  shape?: string;
  vibe?: "Delicada" | "Chamativa" | "Clássica";
  color?: string;
  extra?: "Pedrarias" | "Glitter" | "Desenho" | "Nenhum";
}

export function filterModelsByQuiz(models: GalleryItem[], a: ModelQuizAnswers): GalleryItem[] {
  return models
    .map((m) => {
      let score = 0;
      if (a.shape && m.shape === a.shape) score += 3;
      if (a.color) {
        if (m.mainColor.toLowerCase().includes(a.color.toLowerCase())) score += 3;
        else if (m.colors.some((c) => c.toLowerCase().includes(a.color!.toLowerCase()))) score += 2;
      }
      if (a.vibe === "Chamativa" && ["Luxo", "Nail Art", "Decoradas"].includes(m.category)) score += 2;
      if (a.vibe === "Delicada" && ["Minimalistas", "Francesinha"].includes(m.category)) score += 2;
      if (a.vibe === "Clássica" && m.category === "Francesinha") score += 2;
      if (a.extra === "Pedrarias" && m.finish === "Pedrarias") score += 2;
      if (a.extra === "Glitter" && m.finish === "Glitter") score += 2;
      if (a.extra === "Desenho" && m.finish === "Pintura Artística") score += 2;
      return { m, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.m);
}
