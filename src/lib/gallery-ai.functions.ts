import { createServerFn } from "@tanstack/react-start";

type AnalyzeInput = { imageUrl: string };

export type AnalyzeResult = {
  title: string;
  category: string;
  shape: string;
  length: string;
  mainColor: string;
  secondaryColor: string;
  finish: string;
  style: string;
  tags: string[];
  occasions: string[];
  description: string;
  duration: string;
  durability: string;
};

export type TagsResult = {
  tags: string[];
  occasions: string[];
};

const CATEGORIES = ["Francesinha", "Decoradas", "Coloridas", "Luxo", "Minimalistas", "Nail Art"];
const SHAPES = ["Almond", "Bailarina", "Stiletto", "Quadrada"];
const LENGTHS = ["Curto", "Médio", "Longo", "Extra longo"];
const FINISHES = ["Glitter", "Encapsulado", "Pedrarias", "3D", "Pintura Artística", "Francesinha"];
const STYLES = ["Minimalista", "Luxo", "Decorada", "Nail Art", "Francesinha", "Colorida"];
const COLORS = [
  "Nude", "Branco", "Preto", "Rosa", "Rosa claro", "Rosa pink", "Vermelho", "Vinho",
  "Nude com cristais", "Dourado", "Prata", "Azul", "Azul marinho", "Verde", "Roxo",
  "Marrom", "Bege", "Glitter", "Cristal", "Pérola", "Multicolorido",
];
const OCCASIONS = [
  "Dia a dia", "Trabalho", "Casamento", "Festa", "Formatura", "Aniversário",
  "Balada", "Praia", "Noivado", "Madrinha", "Réveillon",
];
const TAG_HINTS = [
  "rosa", "azul", "branco", "nude", "delicada", "chamativa", "casamento", "festa",
  "dia a dia", "francesinha", "glitter", "pedraria", "encapsulada", "flor",
  "borboleta", "laço", "stiletto", "almond", "bailarina", "quadrada", "curta",
  "média", "longa", "luxo", "minimalista", "nail art",
];

async function callGateway(key: string, body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Muitas requisições. Tente novamente em alguns segundos.");
    if (res.status === 402) throw new Error("Créditos de IA esgotados no workspace.");
    throw new Error(`Falha na análise (${res.status}): ${txt.slice(0, 200)}`);
  }
  const json = await res.json();
  const call = json?.choices?.[0]?.message?.tool_calls?.[0];
  const args = call?.function?.arguments ? JSON.parse(call.function.arguments) : null;
  if (!args) throw new Error("Resposta da IA sem metadados");
  return args;
}

export const analyzeNailImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): AnalyzeInput => {
    const v = input as AnalyzeInput;
    if (!v?.imageUrl || typeof v.imageUrl !== "string") throw new Error("imageUrl required");
    return { imageUrl: v.imageUrl };
  })
  .handler(async ({ data }): Promise<AnalyzeResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY não configurado");

    const systemPrompt = `Você analisa fotos de unhas da nail designer Stefany e devolve metadados em português brasileiro.

Listas fechadas (escolha exatamente UM valor):
- Categoria: ${CATEGORIES.join(", ")}
- Formato: ${SHAPES.join(", ")}
- Comprimento: ${LENGTHS.join(", ")}
- Acabamento: ${FINISHES.join(", ")}
- Estilo: ${STYLES.join(", ")}
- Cores (principal e secundária): ${COLORS.join(", ")}

Regras:
- Título: nome curto e comercial (máx 40 caracteres).
- Cor secundária: "" quando só uma cor dominante.
- Tags: 5 a 12 termos curtos em minúsculo, sem acento, úteis para busca. Inspire-se em: ${TAG_HINTS.join(", ")}. Pode criar novas.
- Ocasiões: 1 a 4 valores desta lista quando fizerem sentido: ${OCCASIONS.join(", ")}. Vazio se nada se aplicar.
- Descrição: 1 a 2 frases comerciais.
- Tempo médio: "1h30", "2h", "2h30", "3h".
- Durabilidade: "2 semanas", "3 semanas", "até 20 dias", "até 25 dias".`;

    const body = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Analise esta unha e preencha os metadados." },
            { type: "image_url", image_url: { url: data.imageUrl } },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "set_metadata",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                category: { type: "string", enum: CATEGORIES },
                shape: { type: "string", enum: SHAPES },
                length: { type: "string", enum: LENGTHS },
                mainColor: { type: "string", enum: COLORS },
                secondaryColor: { type: "string" },
                finish: { type: "string", enum: FINISHES },
                style: { type: "string", enum: STYLES },
                tags: { type: "array", items: { type: "string" } },
                occasions: { type: "array", items: { type: "string" } },
                description: { type: "string" },
                duration: { type: "string" },
                durability: { type: "string" },
              },
              required: [
                "title", "category", "shape", "length", "mainColor", "secondaryColor",
                "finish", "style", "tags", "occasions", "description", "duration", "durability",
              ],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "set_metadata" } },
    };

    const args = await callGateway(key, body);
    return args as unknown as AnalyzeResult;
  });

/** Chamada leve: só gera tags + ocasiões (economiza créditos). */
export const generateTagsFromImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): AnalyzeInput => {
    const v = input as AnalyzeInput;
    if (!v?.imageUrl || typeof v.imageUrl !== "string") throw new Error("imageUrl required");
    return { imageUrl: v.imageUrl };
  })
  .handler(async ({ data }): Promise<TagsResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY não configurado");

    const systemPrompt = `Você gera tags e ocasiões para uma foto de unhas.
- Tags: 5 a 12 termos curtos em minúsculo, sem acento, úteis para busca (cor, formato, estilo, ocasião, elemento decorativo). Inspire-se em: ${TAG_HINTS.join(", ")}. Pode criar novas.
- Ocasiões: 1 a 4 valores desta lista quando fizerem sentido: ${OCCASIONS.join(", ")}. Retorne array vazio se nada se aplicar.`;

    const body = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Gere tags e ocasiões para esta foto." },
            { type: "image_url", image_url: { url: data.imageUrl } },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "set_tags",
            parameters: {
              type: "object",
              properties: {
                tags: { type: "array", items: { type: "string" } },
                occasions: { type: "array", items: { type: "string" } },
              },
              required: ["tags", "occasions"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "set_tags" } },
    };

    const args = await callGateway(key, body);
    return args as unknown as TagsResult;
  });

export const OCCASION_OPTIONS = OCCASIONS;

