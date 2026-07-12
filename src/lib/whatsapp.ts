import type { BookingState } from "./booking-context";
import { services } from "@/data/services";

const nameOf = (id: string) => services.find((s) => s.id === id)?.name ?? id;

export function buildWhatsAppMessage(d: BookingState): string {
  const geoLink = d.geo ? `https://www.google.com/maps?q=${d.geo.lat},${d.geo.lng}` : "";
  const addr = d.address;
  const enderecoTxt = [
    addr.street && `${addr.street}, ${addr.number || "s/n"}`,
    addr.complement,
    addr.neighborhood,
    addr.city && addr.state ? `${addr.city}/${addr.state}` : addr.city || addr.state,
    addr.cep && `CEP ${addr.cep}`,
  ]
    .filter(Boolean)
    .join(" - ");

  const servicos = d.services.map(nameOf).join(", ") + (d.otherService ? ` (Outro: ${d.otherService})` : "");

  return `Olá, Stefany! Gostaria de solicitar um agendamento. 💅

👤 DADOS DA CLIENTE
Nome: ${d.name}
Telefone: ${d.phone}
Tipo de cliente: ${d.clientType === "existente" ? "Cliente atual" : "Primeira vez"}
${d.discoveredVia ? `Como conheceu: ${d.discoveredVia}${d.referredBy ? ` (${d.referredBy})` : ""}` : ""}

💅 SERVIÇO
Serviço escolhido: ${servicos || "-"}
Área: ${d.area || "-"}
Tamanho: ${d.size || "-"}
Formato: ${d.shape || "-"}
${d.nailsToMaintain ? `Manutenção: ${d.nailsToMaintain} unhas` : ""}
${d.brokenNails ? `Unhas quebradas: ${d.brokenNails}` : ""}
${d.needsRemoval ? `Precisa de remoção: ${d.needsRemoval}` : ""}

🎨 ESTILO
Estilo desejado: ${d.styles.join(", ") || "-"}
Cor escolhida: ${d.colors.join(", ") || "-"}
Francesinha: ${d.frenchTip || "-"}
Decoração: ${d.decorations.join(", ") || "-"}
Foto de referência: ${d.referenceImage ? "Sim (enviarei em seguida no WhatsApp)" : "Não"}
${d.referenceModel ? `Modelo escolhido: ${d.referenceModel.title} (${d.referenceModel.category})` : ""}

📅 DATA E HORÁRIO
Data desejada: ${d.date || "-"}
Período: ${d.period || "-"}
Horário preferido: ${d.time || "-"}

📍 LOCAL DO ATENDIMENTO
Endereço: ${enderecoTxt || "-"}
Ponto de referência: ${addr.reference || "-"}
Localização: ${geoLink || "-"}

⚠️ INFORMAÇÕES IMPORTANTES
Alergias: ${d.allergies === "Sim" ? `Sim — ${d.allergiesDetail}` : d.allergies || "-"}
Sensibilidade ou machucado: ${d.injuries === "Sim" ? `Sim — ${d.injuriesDetail}` : d.injuries || "-"}
Unha quebrada: ${d.hasBrokenNail || "-"}
Observações: ${d.notes || "-"}

Entendo que o horário, o valor e a disponibilidade ainda serão confirmados pelo WhatsApp.`;
}
