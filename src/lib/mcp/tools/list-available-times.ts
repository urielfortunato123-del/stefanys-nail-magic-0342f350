import { defineTool } from "@lovable.dev/mcp-js";
import { availableTimes, periods } from "@/data/availableTimes";

export default defineTool({
  name: "list_available_times",
  title: "Listar horários disponíveis",
  description:
    "Retorna a lista de horários provisórios oferecidos para agendamento e os períodos do dia (manhã, tarde, noite).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify({ times: availableTimes, periods }, null, 2) }],
    structuredContent: { times: availableTimes, periods },
  }),
});
