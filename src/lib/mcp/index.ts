import { defineMcp } from "@lovable.dev/mcp-js";
import getBusinessInfo from "./tools/get-business-info";
import listServices from "./tools/list-services";
import listGallery from "./tools/list-gallery";
import listAvailableTimes from "./tools/list-available-times";
import createWhatsappLink from "./tools/create-whatsapp-link";

export default defineMcp({
  name: "stefany-nails-mcp",
  title: "Stefany Nails MCP",
  version: "0.1.0",
  instructions:
    "Ferramentas públicas do aplicativo da Stefany Próspero — Nail Designer. Use para consultar informações do negócio, lista de serviços, galeria de inspirações, horários disponíveis e gerar links pré-preenchidos do WhatsApp para agendamentos.",
  tools: [getBusinessInfo, listServices, listGallery, listAvailableTimes, createWhatsappLink],
});
