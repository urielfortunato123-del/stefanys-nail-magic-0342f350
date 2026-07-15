import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { gallery, galleryCategories } from "@/data/gallery";

export default defineTool({
  name: "list_gallery",
  title: "Listar galeria de inspirações",
  description:
    "Retorna a galeria pública de trabalhos e inspirações da Stefany, opcionalmente filtrada por categoria.",
  inputSchema: {
    category: z
      .enum(galleryCategories as unknown as [string, ...string[]])
      .optional()
      .describe("Categoria para filtrar (opcional). Ex.: 'Delicadas', 'Francesinha'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ category }) => {
    const items =
      !category || category === "Todas"
        ? gallery
        : gallery.filter((g) => g.category === category);
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { items, count: items.length },
    };
  },
});
