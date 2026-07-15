import { createFileRoute, Link } from "@tanstack/react-router";
import { Instagram, MessageCircle, CalendarHeart } from "lucide-react";
import { businessConfig, whatsappLink, LOGO_URL } from "@/config/business";
import { InstallHereButton } from "@/components/install-pwa";
const logo = LOGO_URL;

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a Stefany Próspero — Nail Designer" },
      { name: "description", content: "Conheça a Stefany Próspero, nail designer com atendimento em domicílio." },
    ],
  }),
  component: Sobre,
});

function Sobre() {
  return (
    <div className="space-y-6">
      <div className="glass-card overflow-hidden rounded-3xl p-6 text-center">
        <img src={logo} alt="Stefany Próspero" width={192} height={192} className="mx-auto h-48 w-48 rounded-full object-cover ring-1 ring-white/10" />
        <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-[color:var(--pink)]">Nail Designer</p>
        <h1 className="mt-1 font-display text-3xl text-white">Stefany Próspero</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70">
          Cada atendimento é feito com cuidado, dedicação e atenção aos detalhes. Meu objetivo é levar beleza, praticidade e uma experiência personalizada até você.
        </p>
      </div>

      <div className="grid gap-3">
        {["Atendimento em domicílio", "Trabalhos personalizados", "Higienização rigorosa dos materiais", "Experiência sofisticada e acolhedora"].map((t) => (
          <div key={t} className="glass-card flex items-center gap-3 rounded-2xl p-3.5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[color:var(--pink)]" aria-hidden />
            <span className="text-sm text-white">{t}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-2">
        <Link to="/agendar" className="flex items-center justify-center gap-2 rounded-full bg-[color:var(--pink)] py-3.5 text-sm font-semibold text-[color:var(--navy)] pink-glow">
          <CalendarHeart className="h-4 w-4" /> Agendar atendimento
        </Link>
        <a href={businessConfig.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full border border-white/20 py-3 text-sm font-medium text-white">
          <Instagram className="h-4 w-4" /> Instagram
        </a>
        <a href={whatsappLink("Olá, Stefany! 💅")} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full border border-white/20 py-3 text-sm font-medium text-white">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        <InstallHereButton className="justify-center" />
      </div>
    </div>
  );
}
