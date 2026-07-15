import { createServerFn } from "@tanstack/react-start";

type AnalyzeInput = { imageUrl: string };

type AnalyzeResult = {
  title: string;
  category: string;
  shape: string;
  mainColor: string;
  finish: string;
  duration: string;
  durability: string;
};

const CATEGORIES = ["Francesinha", "Decoradas", "Coloridas", "Luxo", "Minimalistas", "Nail Art"];
const SHAPES = ["Almond", "Bailarina", "Stiletto", "Quadrada"];
const FINISHES = ["Glitter", "Encapsulado", "Pedrarias", "3D", "Pintura Artística", "Francesinha"];

export const analyzeNailImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): AnalyzeInput => {
    const v = input as AnalyzeInput;
    if (!v?.imageUrl || typeof v.imageUrl !== "string") throw new Error("imageUrl required");
    return { imageUrl: v.imageUrl };
  })
  .handler(async ({ data }): Promise<AnalyzeResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY não configurado");

    const systemPrompt = `Você analisa fotos de unhas trabalhadas pela nail designer Stefany e devolve os metadados em português.
Categorias válidas: ${CATEGORIES.join(", ")}.
Formatos válidos: ${SHAPES.join(", ")}.
Acabamentos válidos: ${FINISHES.join(", ")}.
Título: nome curto e comercial (máx 40 caracteres).
Cor principal: descrição curta (ex: "Nude com cristais", "Vermelho cereja").
Tempo médio: uma string como "2h", "2h30", "3h".
Durabilidade: uma string como "até 20 dias", "3 semanas".
Escolha exatamente um valor de cada lista fechada. Nunca invente categorias fora das listas.`;

    const body = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Analise esta unha e devolva os metadados." },
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
                mainColor: { type: "string" },
                finish: { type: "string", enum: FINISHES },
                duration: { type: "string" },
                durability: { type: "string" },
              },
              required: ["title", "category", "shape", "mainColor", "finish", "duration", "durability"],
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
