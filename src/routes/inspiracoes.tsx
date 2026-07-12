import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { X, Sparkles, ImageOff } from "lucide-react";
import { gallery, galleryCategories, type GalleryItem } from "@/data/gallery";
import { useBooking } from "@/lib/booking-context";

export const Route = createFileRoute("/inspiracoes")({
  head: () => ({
    meta: [
      { title: "Inspirações — Stefany Próspero Nail Designer" },
      { name: "description", content: "Galeria de inspirações de nail art, francesinha, glitter e mais." },
    ],
  }),
  component: Inspiracoes,
});

function NailImage({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-1 bg-[#08213D] text-white/50">
        <ImageOff className="h-6 w-6" />
        <span className="text-[10px]">Imagem em breve</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = "/images/nails/placeholder.jpg";
        setErrored(false);
      }}
      className="aspect-[4/5] w-full bg-[#08213D] object-cover"
    />
  );
}

function Inspiracoes() {
  const [filter, setFilter] = useState<string>("Todas");
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const { update } = useBooking();
  const navigate = useNavigate();

  const filtered = useMemo(
    () => (filter === "Todas" ? gallery : gallery.filter((g) => g.category === filter)),
    [filter],
  );

  const chooseAsReference = (g: GalleryItem) => {
    update({
      styles: Array.from(new Set([g.category])),
      referenceModel: { id: g.id, title: g.title, imageUrl: g.imageUrl, category: g.category },
    });
    setSelected(null);
    navigate({ to: "/agendar" });
  };

  return (
    <div className="space-y-5">
      <div className="px-1">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--pink)]">Galeria</p>
        <h1 className="font-display text-3xl text-white">Inspirações</h1>
        <p className="mt-1 text-sm text-white/60">Escolha um modelo e comece seu agendamento.</p>
      </div>

      <div className="-mx-4 flex snap-x gap-2 overflow-x-auto scroll-smooth whitespace-nowrap px-4 pb-2 no-scrollbar">
        {galleryCategories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`shrink-0 snap-start rounded-full px-4 py-2 text-sm font-medium transition-all ${
              filter === c
                ? "bg-[#F7A8BD] text-[#061A33]"
                : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div key={filter} className="grid animate-in fade-in grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelected(g)}
            className="overflow-hidden rounded-2xl border border-white/10 bg-[#08213D] text-left shadow-sm transition-transform active:scale-[0.98]"
          >
            <NailImage src={g.imageUrl} alt={g.title} />
            <div className="p-3">
              <h3 className="truncate text-sm font-semibold text-white">{g.title}</h3>
              <p className="mt-1 text-xs text-white/60">{g.category}</p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md overflow-hidden rounded-t-3xl border border-white/10 bg-[#061A33] sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <NailImage src={selected.imageUrl} alt={selected.title} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-[color:var(--pink)]">{selected.category}</p>
                  <h2 className="truncate font-display text-xl text-white">{selected.title}</h2>
                  <p className="mt-1 text-xs text-white/60">Cores: {selected.colors.join(", ")}</p>
                </div>
                <button onClick={() => setSelected(null)} aria-label="Fechar" className="shrink-0 rounded-full bg-white/5 p-2 text-white/70">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 grid gap-2">
                <button onClick={() => chooseAsReference(selected)} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#F7A8BD] py-3 text-sm font-semibold text-[#061A33] pink-glow">
                  <Sparkles className="h-4 w-4" /> Quero este modelo
                </button>
                <button onClick={() => setSelected(null)} className="w-full rounded-full border border-white/15 py-2.5 text-sm text-white/80">
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
