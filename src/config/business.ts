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
  logoPath: "/__l5e/assets-v1/ec3069a2-5ae7-4bce-80df-49dcbebb3de3/logo-stefany.png",
};

export const LOGO_URL = businessConfig.logoPath;

export const whatsappLink = (message: string) =>
  `https://wa.me/${businessConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
