import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import { HomeIcon, HeartHandshake, Sparkles, Clock, Gem, Instagram, MessageCircle, MapPin, Info, CalendarHeart, ChevronRight, ChevronLeft, X } from "lucide-react";
import { businessConfig, whatsappLink } from "@/config/business";
import { gallery, inspirationShapes, type GalleryItem } from "@/data/gallery";
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
type InspirationFilter = "Todas" | (typeof inspirationShapes)[number] | "Pés";
const inspirationFilters: InspirationFilter[] = ["Todas", ...inspirationShapes, "Pés"];
const inspirationShapeOrder: Record<string, number> = {
  Almond: 0,
  Bailarina: 1,
  Mandorla: 2,
  Oval: 3,
  Quadrada: 4,
  Stiletto: 5,
};

function openInspirationOnWhatsApp(g: GalleryItem) {
  const categoria = g.bodyPart === "feet" ? "Pés" : "Mãos";
  const imageUrl = new URL(g.imageUrl, window.location.origin).href;
  const msg = `Olá, Stefany! Gostei desta inspiração e quero fazer algo parecido.

Categoria: ${categoria}
Inspiração: ${g.title}

Foto escolhida:
${imageUrl}`;
  window.open(whatsappLink(msg), "_blank", "noopener,noreferrer");
}

function Home() {
  const [filter, setFilter] = useState<InspirationFilter>("Todas");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const filteredWorks = useMemo(() => {
    const isFeet = (g: GalleryItem) => g.bodyPart === "feet";
    if (filter === "Pés") return gallery.filter(isFeet);
    if (filter === "Todas") {
      return gallery
        .map((g, index) => ({ g, index }))
        .filter(({ g }) => !isFeet(g))
        .sort(
          (a, b) =>
            (inspirationShapeOrder[a.g.shape] ?? 99) - (inspirationShapeOrder[b.g.shape] ?? 99) ||
            a.index - b.index,
        )
        .map(({ g }) => g);
    }
    return gallery.filter((g) => !isFeet(g) && g.shape === filter);
  }, [filter]);

  const preview = filteredWorks;
  const current = lightboxIdx != null ? preview[lightboxIdx] : null;

  const next = () => setLightboxIdx((i) => (i == null ? i : (i + 1) % preview.length));
  const prev = () => setLightboxIdx((i) => (i == null ? i : (i - 1 + preview.length) % preview.length));

  useEffect(() => {
    if (lightboxIdx == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, preview.length]);

  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
    touchX.current = null;
  };

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

      {/* Inspirações preview */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-lg text-white">Inspirações</h2>
          <Link to="/inspiracoes" className="flex items-center gap-1 text-xs text-[color:var(--pink)]">
            Ver todas <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 no-scrollbar" role="tablist" aria-label="Filtrar por formato">
          {inspirationFilters.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-[color:var(--pink)] text-[color:var(--navy)] shadow-sm"
                    : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {preview.map((g, i) => (
            <div
              key={g.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#08213D] shadow-[0_8px_20px_-12px_rgba(0,0,0,0.6)]"
            >
              <button
                onClick={() => setLightboxIdx(i)}
                className="relative block w-full text-left"
                aria-label={`Ampliar ${g.title}`}
              >
                <img
                  src={g.imageUrl}
                  alt={g.title}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/nails/placeholder.jpg"; }}
                />
                {g.isProcess && (
                  <span className="absolute left-2 top-2 rounded-full bg-[color:var(--pink)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#08213D] shadow">
                    Processo
                  </span>
                )}
              </button>
              {!g.isProcess && (
                <div className="flex flex-col gap-1.5 p-2.5">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {g.bodyPart === "feet" ? g.title : g.shape}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-white/50">
                      {g.bodyPart === "feet" ? "Inspiração para os pés" : "Inspiração"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openInspirationOnWhatsApp(g)}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] py-1.5 text-[11px] font-semibold text-white shadow-sm"
                  >
                    <MessageCircle className="h-3 w-3" /> Quero esta inspiração
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        {preview.length === 0 && (
          <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/70">
            Sem inspirações nesta categoria ainda.
          </p>
        )}
      </section>


      {/* Lightbox */}
      {current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-in fade-in"
          onClick={() => setLightboxIdx(null)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
            aria-label="Próxima"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="relative max-h-[85vh] max-w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={current.imageUrl}
              alt={current.title}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            {current.isProcess && (
              <div className="mt-3 rounded-xl bg-black/50 px-3 py-2 text-center text-white backdrop-blur">
                <span className="mr-2 inline-block rounded-full bg-[color:var(--pink)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#08213D]">Processo</span>
                <span className="text-sm font-medium">{current.title}</span>
                {current.description && <p className="mt-1 text-xs text-white/80">{current.description}</p>}
              </div>
            )}
          </div>
        </div>
      )}

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
