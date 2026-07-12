// ⚠️ CONFIGURAÇÃO CENTRAL — altere aqui o número do WhatsApp e o Instagram
export const businessConfig = {
  businessName: "Stefany Nail Designer",
  shortName: "Stefany Nails",
  professionalName: "Stefany Próspero",
  profession: "Nail Designer",
  slogan: "Beleza até você.",
  subtitle: "Atendimento em domicílio.",
  serviceArea: "Atendimento em domicílio",
  // 🔁 Troque aqui o WhatsApp oficial (somente números, com DDI+DDD)
  whatsappNumber: "5511972268546",
  // 🔁 Troque aqui o Instagram
  instagramUrl: "https://instagram.com/USUARIO",
  description: "Agendamentos e serviços de nail designer em domicílio.",
};

export const whatsappLink = (message: string) =>
  `https://wa.me/${businessConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
