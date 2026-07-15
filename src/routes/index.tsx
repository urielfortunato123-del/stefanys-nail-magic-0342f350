import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeIcon, HeartHandshake, Sparkles, Clock, Gem, Instagram, MessageCircle, MapPin, Info, CalendarHeart, ChevronRight } from "lucide-react";
import { businessConfig, whatsappLink } from "@/config/business";
import { gallery } from "@/data/gallery";
import { LOGO_URL as logo } from "@/config/business";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stefany Próspero — Nail Designer | Beleza até você" },
      { name: "description", content: "Agende seu atendimento de nail designer em domicílio com Stefany Próspero. Delicadeza, arte e sofisticação." },
    ],
  }),
  component: Home,
});

const benefits = [
  { icon: HomeIcon, title: "Atendimento em domicílio", text: "A Stefany leva beleza e cuidado até você." },
  { icon: Clock, title: "Agendamento rápido", text: "Escolha o serviço e envie pelo WhatsApp." },
  { icon: HeartHandshake, title: "Trabalhos personalizados", text: "Do delicado ao artístico, do seu jeito." },
  { icon: Gem, title: "Atendimento exclusivo", text: "Cada detalhe pensado para você." },
];

const quickLinks: { to: string; label: string; icon: typeof HomeIcon }[] = [
  { to: "/agendar", label: "Agendar", icon: CalendarHeart },
  { to: "/inspiracoes", label: "Inspirações", icon: Sparkles },
  { to: "/servicos", label: "Serviços", icon: Gem },
  { to: "/area-atendida", label: "Área atendida", icon: MapPin },
  { to: "/sobre", label: "Sobre a Stefany", icon: Info },
];

function Home() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="glass-card relative overflow-hidden rounded-3xl p-6 pt-8 text-center">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[color:var(--pink)]/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[color:var(--gold)]/10 blur-3xl" aria-hidden />
        <div className="mx-auto mb-4 h-52 w-52 overflow-hidden rounded-full sm:h-60 sm:w-60">
          <img src={logo} alt="Stefany Próspero" width={208} height={208} className="h-full w-full scale-[1.35] object-cover" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--pink)]">Nail Designer</p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight">
          <span className="shimmer-text">Beleza até você</span>
        </h1>
        <p className="mt-2 text-sm text-white/70">Atendimento personalizado em domicílio</p>
        <div className="mt-6 flex flex-col items-center gap-2">
          <Link
            to="/agendar"
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-[color:var(--pink)] px-6 py-3.5 text-sm font-semibold text-[color:var(--navy)] pink-glow transition active:scale-[0.98]"
          >
            <CalendarHeart className="h-4 w-4" />
            Agendar agora
          </Link>
          <Link
            to="/inspiracoes"
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white hover:bg-white/5"
          >
            <Sparkles className="h-4 w-4" />
            Ver inspirações
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section>
        <h2 className="mb-3 font-display text-lg text-white">Por que agendar com a Stefany</h2>
        <div className="grid grid-cols-2 gap-3">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="glass-card rounded-2xl p-4">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--pink)]/15 text-[color:var(--pink)]">
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-3 text-sm font-semibold text-white">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/60">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery preview */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-lg text-white">Alguns trabalhos</h2>
          <Link to="/inspiracoes" className="flex items-center gap-1 text-xs text-[color:var(--pink)]">
            Ver todos <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
          {gallery.slice(0, 6).map((g) => (
            <div key={g.id} className="relative w-36 shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-[#08213D]">
              <img src={g.imageUrl} alt={g.title} loading="lazy" className="aspect-[4/5] w-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/nails/placeholder.jpg"; }} />
              <div className="p-2.5">
                <p className="truncate text-xs font-medium text-white">{g.title}</p>
                <p className="text-[10px] text-white/50">{g.category}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="grid grid-cols-2 gap-3">
        {quickLinks.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to as never}
            className="glass-card flex items-center gap-3 rounded-2xl p-4 transition hover:bg-white/5"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 text-[color:var(--pink)]">
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-white">{label}</span>
          </Link>
        ))}
        <a
          href={businessConfig.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="glass-card flex items-center gap-3 rounded-2xl p-4 transition hover:bg-white/5"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 text-[color:var(--pink)]">
            <Instagram className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-white">Instagram</span>
        </a>
        <a
          href={whatsappLink("Olá, Stefany! Vim pelo aplicativo. 💅")}
          target="_blank"
          rel="noreferrer"
          className="glass-card flex items-center gap-3 rounded-2xl p-4 transition hover:bg-white/5"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 text-[color:var(--pink)]">
            <MessageCircle className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-white">WhatsApp</span>
        </a>
      </section>

      <footer className="pt-2 text-center text-[11px] text-white/40">
        © {new Date().getFullYear()} {businessConfig.professionalName} · {businessConfig.slogan}
      </footer>
    </div>
  );
}
