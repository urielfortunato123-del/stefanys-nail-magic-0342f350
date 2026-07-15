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
  keywords: string[];
  description: string;
  duration: string;
  durability: string;
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

export const analyzeNailImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): AnalyzeInput => {
    const v = input as AnalyzeInput;
    if (!v?.imageUrl || typeof v.imageUrl !== "string") throw new Error("imageUrl required");
    return { imageUrl: v.imageUrl };
  })
  .handler(async ({ data }): Promise<AnalyzeResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY não configurado");

    const systemPrompt = `Você analisa fotos de unhas trabalhadas pela nail designer Stefany e devolve metadados em português brasileiro.

Listas fechadas (escolha exatamente UM valor de cada):
- Categoria: ${CATEGORIES.join(", ")}
- Formato: ${SHAPES.join(", ")}
- Comprimento: ${LENGTHS.join(", ")}
- Acabamento: ${FINISHES.join(", ")}
- Estilo: ${STYLES.join(", ")}
- Cores (para cor principal e secundária): ${COLORS.join(", ")}

Regras:
- Título: nome curto e comercial (máx 40 caracteres).
- Cor secundária: use "" (string vazia) quando a unha tem uma cor dominante só.
- Palavras-chave: 3 a 6 termos curtos em minúsculo para busca (ex: "francesinha", "casamento", "delicada", "cristais").
- Descrição: 1 a 2 frases descrevendo o modelo de forma comercial.
- Tempo médio: "1h30", "2h", "2h30", "3h".
- Durabilidade: "2 semanas", "3 semanas", "até 20 dias", "até 25 dias".
Nunca invente valores fora das listas fechadas.`;

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
            description: "Registra os metadados da foto de unha",
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
                keywords: { type: "array", items: { type: "string" } },
                description: { type: "string" },
                duration: { type: "string" },
                durability: { type: "string" },
              },
              required: [
                "title", "category", "shape", "length", "mainColor", "secondaryColor",
                "finish", "style", "keywords", "description", "duration", "durability",
              ],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "set_metadata" } },
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
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
    return args as AnalyzeResult;
  });
