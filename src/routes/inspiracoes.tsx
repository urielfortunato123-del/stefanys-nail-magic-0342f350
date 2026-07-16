import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { X, Sparkles, ImageOff, Heart, Share2, Maximize2, MessageCircle, Loader2, Search } from "lucide-react";
import {
  galleryCategories,
  categoryDescriptions,
  type GalleryItem,
} from "@/data/gallery";
import { loadGallery } from "@/lib/gallery-source";
import { useBooking } from "@/lib/booking-context";
import { shareModel, shouldShowShareTip, setHideShareTip } from "@/lib/share-model";
import { matchesQuery, scoreSuggestion } from "@/lib/gallery-search";

export const Route = createFileRoute("/inspiracoes")({
  head: () => ({
    meta: [
      { title: "Inspirações — Stefany Próspero Nail Designer" },
      {
        name: "description",
        content:
          "Galeria premium de trabalhos: francesinha, decoradas, coloridas, luxo, minimalistas e nail art.",
      },
    ],
  }),
  component: Inspiracoes,
});

const FAV_KEY = "gallery:favorites";

function useFavorites() {
  const [favs, setFavs] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
    } catch {
      return new Set();
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
    } catch {}
  }, [favs]);
  const toggle = (id: string) =>
    setFavs((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  return { favs, toggle };
}

function NailImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div
        className={`flex aspect-[4/5] w-full flex-col items-center justify-center gap-1 bg-white text-black/40 ${className}`}
      >
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
      decoding="async"
      onError={() => setErrored(true)}
      className={`w-full bg-white object-cover ${className}`}
    />
  );
}

const PAGE_SIZE = 6;

function Inspiracoes() {
  const [bodyFilter, setBodyFilter] = useState<"Mãos" | "Pés">("Mãos");
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [fullscreen, setFullscreen] = useState<GalleryItem | null>(null);
  const [wantModel, setWantModel] = useState<GalleryItem | null>(null);
  const [obs, setObs] = useState("");
  const [sharing, setSharing] = useState(false);
  const [hideTip, setHideTipState] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [visible, setVisible] = useState<Record<"Mãos" | "Pés", number>>({ Mãos: PAGE_SIZE, Pés: PAGE_SIZE });
  const { favs, toggle } = useFavorites();
  const { data: booking, update } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    let ok = true;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    loadGallery(controller.signal)
      .then((g) => {
        if (!ok) return;
        setGallery(g);
        if (g.length === 0) setError(true);
      })
      .catch((e) => {
        console.error("Erro ao carregar inspirações:", e);
        if (ok) setError(true);
      })
      .finally(() => {
        if (ok) setLoading(false);
      });
    return () => {
      ok = false;
      controller.abort();
    };
  }, [reloadKey]);

  useEffect(() => {
    if (wantModel) {
      setObs("");
      setShowTip(shouldShowShareTip());
      setHideTipState(false);
    }
  }, [wantModel]);

  const filteredAll = useMemo(
    () =>
      gallery.filter((g) =>
        bodyFilter === "Pés" ? g.bodyPart === "feet" : g.bodyPart !== "feet",
      ),
    [gallery, bodyFilter],
  );
  const filtered = useMemo(
    () => filteredAll.slice(0, visible[bodyFilter]),
    [filteredAll, visible, bodyFilter],
  );
  const hasMore = filtered.length < filteredAll.length;

  const loadMore = () =>
    setVisible((v) => ({ ...v, [bodyFilter]: v[bodyFilter] + PAGE_SIZE }));


  const chooseAsReference = (g: GalleryItem) => {
    update({
      styles: Array.from(new Set([g.category])),
      referenceModel: { id: g.id, title: g.title, imageUrl: g.imageUrl, category: g.category },
    });
    setSelected(null);
    setWantModel(null);
    navigate({ to: "/agendar" });
  };

  const handleSendModel = async () => {
    if (!wantModel || sharing) return;
    setSharing(true);
    try {
      if (hideTip) setHideShareTip(true);
      await shareModel(wantModel, obs);
      setWantModel(null);
    } finally {
      setSharing(false);
    }
  };

  const shareItem = async (g: GalleryItem) => {
    const url = new URL(g.imageUrl, window.location.origin).href;
    const categoria = g.bodyPart === "feet" ? "Pés" : "Mãos";
    const text = `Inspiração ${categoria} — ${g.title} por Stefany Próspero`;
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title: g.title, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="px-1 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--pink)]">Galeria</p>
        <h1 className="font-display text-3xl text-white">Inspirações</h1>
        <p className="mt-1 text-sm text-white/60">
          Trabalhos reais da Stefany. Toque em uma imagem para ver os detalhes.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-3">
          {(["Mãos", "Pés"] as const).map((b) => {
            const active = bodyFilter === b;
            return (
              <button
                key={b}
                onClick={() => setBodyFilter(b)}
                aria-pressed={active}
                className={`min-w-[120px] rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "bg-[#F7A8BD] text-[#061A33] shadow-sm"
                    : "border border-[#F7A8BD]/40 bg-white/10 text-white/90 hover:bg-white/15"
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
        <p className="text-center text-[11px] text-white/50">
          {loading
            ? "Carregando inspirações…"
            : `${filteredAll.length} ${filteredAll.length === 1 ? "inspiração disponível" : "inspirações disponíveis"}`}
        </p>
      </div>

      {loading && (
        <div className="[column-fill:_balance] columns-2 gap-4 sm:columns-3 lg:columns-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="mb-4 aspect-[4/5] w-full animate-pulse break-inside-avoid rounded-3xl bg-white/10"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/70">
          <p>Não foi possível carregar as inspirações.</p>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-3 rounded-full bg-[#F7A8BD] px-4 py-2 text-xs font-semibold text-[#061A33]"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && filteredAll.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/70">
          Nenhuma inspiração disponível nesta categoria.
        </div>
      )}

      {/* Masonry via CSS columns */}
      <div
        key={bodyFilter}
        className="animate-in fade-in [column-fill:_balance] columns-2 gap-4 sm:columns-3 lg:columns-4"
      >
        {filtered.map((g) => {
          const isFav = favs.has(g.id);
          return (
            <div
              key={g.id}
              className="mb-4 break-inside-avoid overflow-hidden rounded-3xl bg-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              <button
                onClick={() => setSelected(g)}
                className="group relative block w-full text-left"
                aria-label={`Abrir ${g.title}`}
              >
                <NailImage
                  src={g.imageUrl}
                  alt={g.title}
                  className="transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/40 p-1.5 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                  <Maximize2 className="h-3.5 w-3.5" />
                </span>
              </button>
              <div className="px-3 pb-3 pt-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-[#061A33]">{g.title}</h3>
                    <p className="mt-0.5 truncate text-[11px] text-black/50">{g.category}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(g.id);
                      }}
                      aria-label="Favoritar"
                      className="rounded-full p-1.5 text-[#F7A8BD] hover:bg-black/5"
                    >
                      <Heart
                        className={`h-4 w-4 ${isFav ? "fill-[#F7A8BD]" : ""}`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullscreen(g);
                      }}
                      aria-label="Ver em tela cheia"
                      className="rounded-full p-1.5 text-black/60 hover:bg-black/5"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        shareItem(g);
                      }}
                      aria-label="Compartilhar"
                      className="rounded-full p-1.5 text-black/60 hover:bg-black/5"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setWantModel(g);
                  }}
                  className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#25D366] py-2 text-xs font-semibold text-white shadow-sm"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Quero esta inspiração
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && !loading && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            className="rounded-full border border-[#F7A8BD]/50 bg-white/10 px-6 py-2 text-sm font-semibold text-white hover:bg-white/15"
          >
            Carregar mais
          </button>
        </div>
      )}



      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-4 animate-in fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-t-3xl bg-white sm:rounded-3xl animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setFullscreen(selected)}
              className="block w-full"
              aria-label="Ampliar imagem"
            >
              <NailImage src={selected.imageUrl} alt={selected.title} />
            </button>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-[color:var(--pink)]">
                    {selected.category}
                  </p>
                  <h2 className="truncate font-display text-xl text-[#061A33]">
                    {selected.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  aria-label="Fechar"
                  className="shrink-0 rounded-full bg-black/5 p-2 text-black/60"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-black/40">Formato</dt>
                  <dd className="text-[#061A33]">{selected.shape}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-black/40">
                    Cor principal
                  </dt>
                  <dd className="text-[#061A33]">{selected.mainColor}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-black/40">
                    Acabamento
                  </dt>
                  <dd className="text-[#061A33]">{selected.finish}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-black/40">
                    Tempo médio
                  </dt>
                  <dd className="text-[#061A33]">{selected.duration}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[10px] uppercase tracking-widest text-black/40">
                    Durabilidade
                  </dt>
                  <dd className="text-[#061A33]">{selected.durability}</dd>
                </div>
              </dl>

              <div className="mt-5 grid gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setWantModel(selected);
                    setSelected(null);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-semibold text-white shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" /> Quero esta inspiração
                </button>
                <button
                  onClick={() => chooseAsReference(selected)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#F7A8BD] py-3 text-sm font-semibold text-[#061A33] pink-glow"
                >
                  <Sparkles className="h-4 w-4" /> Usar como referência no agendamento
                </button>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => toggle(selected.id)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs text-black/60 hover:bg-black/5"
                  >
                    <Heart
                      className={`h-4 w-4 ${favs.has(selected.id) ? "fill-[#F7A8BD] text-[#F7A8BD]" : ""}`}
                    />
                    {favs.has(selected.id) ? "Favoritado" : "Favoritar"}
                  </button>
                  <button
                    onClick={() => shareItem(selected)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs text-black/60 hover:bg-black/5"
                  >
                    <Share2 className="h-4 w-4" /> Compartilhar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen zoom */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black animate-in fade-in"
          onClick={() => setFullscreen(null)}
        >
          <button
            onClick={() => setFullscreen(null)}
            aria-label="Fechar"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white backdrop-blur"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={fullscreen.imageUrl}
            alt={fullscreen.title}
            className="max-h-[92vh] max-w-[96vw] object-contain"
          />
        </div>
      )}

      {/* "Quero esta inspiração" confirmation modal */}
      {wantModel && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-4 animate-in fade-in"
          onClick={() => !sharing && setWantModel(null)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-t-3xl bg-white sm:rounded-3xl animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <NailImage src={wantModel.imageUrl} alt={wantModel.title} />
              <button
                onClick={() => !sharing && setWantModel(null)}
                aria-label="Fechar"
                disabled={sharing}
                className="absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white backdrop-blur"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <h2 className="font-display text-xl text-[#061A33]">
                Você escolheu este modelo 💅
              </h2>
              <div className="mt-3 space-y-1 text-sm text-[#061A33]">
                <p><span className="text-black/50">Modelo:</span> <strong>{wantModel.title}</strong></p>
                <p><span className="text-black/50">Categoria:</span> {wantModel.category}</p>
                <p><span className="text-black/50">Formato:</span> {wantModel.shape}</p>
                <p><span className="text-black/50">Cor principal:</span> {wantModel.mainColor}</p>
              </div>

              <label className="mt-4 block">
                <span className="text-[10px] uppercase tracking-widest text-black/40">
                  Observações (opcional)
                </span>
                <textarea
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  rows={3}
                  placeholder="Ex: gostaria em cor mais clara, formato menor..."
                  className="mt-1 w-full resize-none rounded-2xl border border-black/10 bg-white p-3 text-sm text-[#061A33] outline-none focus:border-[#F7A8BD]"
                />
              </label>

              {showTip && (
                <div className="mt-3 rounded-2xl bg-[#F7A8BD]/15 p-3 text-xs text-[#061A33]">
                  <p>
                    Na próxima tela, escolha o <strong>WhatsApp</strong> e selecione a
                    conversa da Stefany.
                  </p>
                  <label className="mt-2 flex items-center gap-2 text-[11px] text-black/60">
                    <input
                      type="checkbox"
                      checked={hideTip}
                      onChange={(e) => setHideTipState(e.target.checked)}
                      className="h-3.5 w-3.5 accent-[#F7A8BD]"
                    />
                    Não mostrar novamente
                  </label>
                </div>
              )}

              <button
                type="button"
                onClick={handleSendModel}
                disabled={sharing}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-70"
              >
                {sharing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Preparando...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4" /> Enviar modelo para Stefany
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => !sharing && setWantModel(null)}
                disabled={sharing}
                className="mt-2 w-full rounded-full py-2 text-xs text-black/60"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
