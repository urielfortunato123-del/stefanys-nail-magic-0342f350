import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { whatsappLink, businessConfig } from "@/config/business";

export default defineTool({
  name: "create_whatsapp_link",
  title: "Gerar link do WhatsApp",
  description:
    "Gera um link pré-preenchido do WhatsApp da Stefany com a mensagem informada. Não envia mensagem — apenas devolve a URL.",
  inputSchema: {
    message: z
      .string()
      .min(1)
      .describe("Texto da mensagem a ser pré-preenchida no WhatsApp."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: ({ message }) => {
    const url = whatsappLink(message);
    return {
      content: [{ type: "text", text: url }],
      structuredContent: { url, whatsappNumber: businessConfig.whatsappNumber },
    };
  },
});
