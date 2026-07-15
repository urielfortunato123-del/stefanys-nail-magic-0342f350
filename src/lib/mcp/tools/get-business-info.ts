import { defineTool } from "@lovable.dev/mcp-js";
import { businessConfig } from "@/config/business";

export default defineTool({
  name: "get_business_info",
  title: "Obter informações do negócio",
  description:
    "Retorna informações públicas da nail designer Stefany Próspero: nome, profissão, slogan, área de atendimento, WhatsApp e Instagram.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(businessConfig, null, 2) }],
    structuredContent: { business: businessConfig },
  }),
});
