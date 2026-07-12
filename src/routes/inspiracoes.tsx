import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { X, Sparkles } from "lucide-react";
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

function Inspiracoes() {
  const [filter, setFilter] = useState<string>("Todas");
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const { update } = useBooking();
  const navigate = useNavigate();

  const filtered = filter === "Todas" ? gallery : gallery.filter((g) => g.tags.includes(filter));

  const chooseAsReference = (g: GalleryItem) => {
    update({ styles: Array.from(new Set([g.category])) });
    setSelected(null);
    navigate({ to: "/agendar" });
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--pink)]">Galeria</p>
        <h1 className="font-display text-3xl text-white">Inspirações</h1>
        <p className="mt-1 text-sm text-white/60">Escolha um modelo e comece seu agendamento.</p>
      </div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {galleryCategories.map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium ${filter === c ? "border-[color:var(--pink)] bg-[color:var(--pink)] text-[color:var(--navy)]" : "border-white/15 bg-white/[0.03] text-white/80"}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {filtered.map((g) => (
          <button key={g.id} onClick={() => setSelected(g)} className="glass-card overflow-hidden rounded-2xl text-left">
            <div className="aspect-square w-full" style={{ background: `linear-gradient(135deg, ${g.color}, #092747)` }} aria-label={g.title} />
            <div className="p-2.5">
              <p className="truncate text-xs font-medium text-white">{g.title}</p>
              <p className="text-[10px] text-white/50">{g.category}</p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelected(null)}>
          <div className="glass-card w-full max-w-md overflow-hidden rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-square w-full" style={{ background: `linear-gradient(135deg, ${selected.color}, #092747)` }} />
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[color:var(--pink)]">{selected.category}</p>
                  <h2 className="font-display text-xl text-white">{selected.title}</h2>
                </div>
                <button onClick={() => setSelected(null)} aria-label="Fechar" className="text-white/60"><X className="h-5 w-5" /></button>
              </div>
              <button onClick={() => chooseAsReference(selected)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--pink)] py-3 text-sm font-semibold text-[color:var(--navy)] pink-glow">
                <Sparkles className="h-4 w-4" /> Quero este modelo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
