export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
}

export const services: ServiceItem[] = [
  { id: "alongamento", name: "Alongamento", description: "Alongamento em fibra ou gel.", duration: "2h30 – 3h30", price: "Consulte pelo WhatsApp." },
  { id: "manutencao", name: "Manutenção", description: "Retoque das unhas alongadas.", duration: "1h30 – 2h30", price: "Consulte pelo WhatsApp." },
  { id: "banho-gel", name: "Banho em gel", description: "Fortalecimento com gel na unha natural.", duration: "1h30", price: "Consulte pelo WhatsApp." },
  { id: "esmaltacao-gel", name: "Esmaltação em gel", description: "Cor duradoura em gel.", duration: "1h", price: "Consulte pelo WhatsApp." },
  { id: "esmaltacao-comum", name: "Esmaltação comum", description: "Esmalte tradicional.", duration: "45min", price: "Consulte pelo WhatsApp." },
  { id: "mao", name: "Mão", description: "Atendimento apenas nas mãos.", duration: "1h", price: "Consulte pelo WhatsApp." },
  { id: "pe", name: "Pé", description: "Atendimento apenas nos pés.", duration: "1h", price: "Consulte pelo WhatsApp." },
  { id: "mao-pe", name: "Mão e pé", description: "Combo mãos e pés.", duration: "2h – 2h30", price: "Consulte pelo WhatsApp." },
  { id: "remocao", name: "Remoção", description: "Remoção segura do alongamento anterior.", duration: "40min", price: "Consulte pelo WhatsApp." },
  { id: "troca-cor", name: "Troca de cor", description: "Trocar apenas a cor do esmalte em gel.", duration: "45min", price: "Consulte pelo WhatsApp." },
  { id: "francesinha", name: "Francesinha", description: "Francesinha clássica ou colorida.", duration: "1h15", price: "Consulte pelo WhatsApp." },
  { id: "decoracao", name: "Decoração", description: "Detalhes decorativos nas unhas.", duration: "+30min", price: "Consulte pelo WhatsApp." },
  { id: "nail-art", name: "Nail art personalizada", description: "Arte à mão livre exclusiva.", duration: "+1h", price: "Consulte pelo WhatsApp." },
  { id: "reparo", name: "Reparo de unha quebrada", description: "Reparo pontual.", duration: "20min", price: "Consulte pelo WhatsApp." },
  { id: "avaliacao", name: "Avaliação", description: "Avaliação das unhas e recomendação.", duration: "20min", price: "Consulte pelo WhatsApp." },
  { id: "outro", name: "Outro", description: "Descreva na próxima etapa.", duration: "A combinar", price: "Consulte pelo WhatsApp." },
];
