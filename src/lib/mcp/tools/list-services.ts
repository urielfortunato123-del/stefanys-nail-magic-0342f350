import { defineTool } from "@lovable.dev/mcp-js";
import { services } from "@/data/services";

export default defineTool({
  name: "list_services",
  title: "Listar serviços",
  description:
    "Lista os serviços oferecidos pela Stefany Próspero (alongamento, manutenção, esmaltação, nail art, etc.) com duração estimada.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(services, null, 2) }],
    structuredContent: { services },
  }),
});
