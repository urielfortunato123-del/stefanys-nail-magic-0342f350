// ⚠️ CONFIGURAÇÃO CENTRAL — altere aqui o número do WhatsApp e o Instagram
export const businessConfig = {
  businessName: "Stefany Nail Designer",
  shortName: "Stefany Nails",
  professionalName: "Stefany Próspero",
  profession: "Nail Designer",
  slogan: "Beleza até você.",
  subtitle: "Atendimento em domicílio.",
  serviceArea: "Atendimento em domicílio",
  whatsappNumber: "5511972268546",
  instagramHandle: "stefany_prospero.nails",
  instagramUrl: "https://instagram.com/stefany_prospero.nails",
  description: "Agendamentos e serviços de nail designer em domicílio.",
};

export const whatsappLink = (message: string) =>
  `https://wa.me/${businessConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
