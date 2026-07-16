// ⚠️ CONFIGURAÇÃO CENTRAL — altere aqui o número do WhatsApp, Instagram e a logo.
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
  // Caminho único da logo — troque aqui para atualizar em todo o app.
  logoPath: "/__l5e/assets-v1/729c6d7b-0a9e-485e-9d92-6526a55f78bb/logo-stefany.jpg",
};

export const LOGO_URL = businessConfig.logoPath;

export const whatsappLink = (message: string) =>
  `https://wa.me/${businessConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
