import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Instagram, MapPin, CalendarHeart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { businessConfig, whatsappLink } from "@/config/business";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Stefany Próspero Nail Designer" },
      { name: "description", content: "Fale com a Stefany pelo WhatsApp ou Instagram." },
    ],
  }),
  component: Contato,
});

function Contato() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--pink)]">Contato</p>
        <h1 className="font-display text-3xl text-white">Vamos conversar</h1>
        <p className="mt-1 text-sm text-white/60">Retorno rápido pelo WhatsApp.</p>
      </div>
      <a href={whatsappLink("Olá, Stefany! 💅")} target="_blank" rel="noreferrer"
        className="glass-card flex items-center gap-4 rounded-2xl p-4 pink-glow">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--pink)] text-[color:var(--navy)]">
          <MessageCircle className="h-6 w-6" />
        </div>
        <div>
          <p className="font-semibold text-white">WhatsApp Business</p>
          <p className="text-xs text-white/60">{businessConfig.whatsappNumber}</p>
        </div>
      </a>
      <a href={businessConfig.instagramUrl} target="_blank" rel="noreferrer" className="glass-card flex items-center gap-4 rounded-2xl p-4">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--gold)]/20 text-[color:var(--gold)]"><Instagram className="h-6 w-6" /></div>
        <div>
          <p className="font-semibold text-white">Instagram</p>
          <p className="text-xs text-white/60">Veja trabalhos recentes</p>
        </div>
      </a>
      <div className="glass-card flex items-center gap-4 rounded-2xl p-4">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-white/5 text-[color:var(--pink)]"><MapPin className="h-6 w-6" /></div>
        <div>
          <p className="font-semibold text-white">Atendimento em domicílio</p>
          <p className="text-xs text-white/60">Consulte a área atendida</p>
        </div>
      </div>
      <Link to="/agendar" className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[color:var(--pink)] py-3.5 text-sm font-semibold text-[color:var(--navy)] pink-glow">
        <CalendarHeart className="h-4 w-4" /> Agendar agora
      </Link>
    </div>
  );
}
