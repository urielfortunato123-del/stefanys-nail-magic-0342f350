import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Trash2, Upload, X, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { analyzeNailImage } from "@/lib/gallery-ai.functions";
import type { DbNailModel } from "@/lib/gallery-source";

export const Route = createFileRoute("/admin/galeria")({
  head: () => ({
    meta: [{ title: "Admin — Galeria" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminGaleria,
});

const CATEGORIES = ["Francesinha", "Decoradas", "Coloridas", "Luxo", "Minimalistas", "Nail Art"];
const SHAPES = ["Almond", "Bailarina", "Stiletto", "Quadrada"];
const FINISHES = ["Glitter", "Encapsulado", "Pedrarias", "3D", "Pintura Artística", "Francesinha"];
const SIGNED_URL_TTL = 60 * 60 * 24 * 365; // 1 ano

type Draft = {
  localId: string;
  file: File;
  previewUrl: string;
  uploading: boolean;
  uploadedPath?: string;
  imageUrl?: string;
  analyzing: boolean;
  saving: boolean;
  error?: string;
  title: string;
  category: string;
  shape: string;
  mainColor: string;
  finish: string;
  duration: string;
  durability: string;
  featured: boolean;
};

function emptyDraft(file: File): Draft {
  const base = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
  return {
    localId: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    uploading: true,
    analyzing: false,
    saving: false,
    title: base.slice(0, 40),
    category: "Decoradas",
    shape: "Almond",
    mainColor: "",
    finish: "Pintura Artística",
    duration: "2h",
    durability: "3 semanas",
    featured: false,
  };
}

function AdminGaleria() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [items, setItems] = useState<DbNailModel[]>([]);
  const [loading, setLoading] = useState(true);
  const analyzeFn = useServerFn(analyzeNailImage);

  const loadItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("nail_models")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as DbNailModel[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const uploadDraft = async (draft: Draft) => {
    const ext = draft.file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("galeria").upload(path, draft.file, {
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) {
      setDrafts((ds) =>
        ds.map((d) => (d.localId === draft.localId ? { ...d, uploading: false, error: error.message } : d)),
      );
      return;
    }
    const { data: signed } = await supabase.storage.from("galeria").createSignedUrl(path, SIGNED_URL_TTL);
    setDrafts((ds) =>
      ds.map((d) =>
        d.localId === draft.localId
          ? { ...d, uploading: false, uploadedPath: path, imageUrl: signed?.signedUrl }
          : d,
      ),
    );
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newDrafts = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map(emptyDraft);
    setDrafts((d) => [...newDrafts, ...d]);
    newDrafts.forEach((d) => void uploadDraft(d));
  };

  const patch = (localId: string, changes: Partial<Draft>) =>
    setDrafts((ds) => ds.map((d) => (d.localId === localId ? { ...d, ...changes } : d)));

  const analyzeDraft = async (d: Draft) => {
    if (!d.imageUrl) return;
    patch(d.localId, { analyzing: true, error: undefined });
    try {
      const res = await analyzeFn({ data: { imageUrl: d.imageUrl } });
      patch(d.localId, {
        analyzing: false,
        title: res.title,
        category: res.category,
        shape: res.shape,
        mainColor: res.mainColor,
        finish: res.finish,
        duration: res.duration,
        durability: res.durability,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao analisar";
      patch(d.localId, { analyzing: false, error: msg });
    }
  };

  const saveDraft = async (d: Draft) => {
    if (!d.imageUrl || !d.uploadedPath) return;
    if (!d.title.trim() || !d.mainColor.trim()) {
      patch(d.localId, { error: "Preencha título e cor principal" });
      return;
    }
    patch(d.localId, { saving: true, error: undefined });
    const { error } = await supabase.from("nail_models").insert({
      title: d.title.trim(),
      category: d.category,
      shape: d.shape,
      main_color: d.mainColor.trim(),
      finish: d.finish,
      image_url: d.imageUrl,
      storage_path: d.uploadedPath,
      duration: d.duration,
      durability: d.durability,
      featured: d.featured,
      is_active: true,
    });
    if (error) {
      patch(d.localId, { saving: false, error: error.message });
      return;
    }
    URL.revokeObjectURL(d.previewUrl);
    setDrafts((ds) => ds.filter((x) => x.localId !== d.localId));
    void loadItems();
  };

  const removeDraft = (d: Draft) => {
    URL.revokeObjectURL(d.previewUrl);
    if (d.uploadedPath) void supabase.storage.from("galeria").remove([d.uploadedPath]);
    setDrafts((ds) => ds.filter((x) => x.localId !== d.localId));
  };

  const toggleActive = async (row: DbNailModel) => {
    await supabase.from("nail_models").update({ is_active: !row.is_active }).eq("id", row.id);
    void loadItems();
  };

  const deleteItem = async (row: DbNailModel) => {
    if (!confirm(`Excluir "${row.title}"?`)) return;
    await supabase.from("nail_models").delete().eq("id", row.id);
    void loadItems();
  };

  return (
    <div className="space-y-6">
      <div className="px-1">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--pink)]">Admin</p>
        <h1 className="font-display text-3xl text-white">Galeria</h1>
        <p className="mt-1 text-sm text-white/60">
          Envie fotos novas, preencha os dados (ou peça pra IA sugerir) e salve.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-100">
        <p className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Página sem senha por enquanto. Não compartilhe este link publicamente.
        </p>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-white/20 bg-white/5 p-8 text-center text-sm text-white/70 hover:bg-white/10">
        <Upload className="h-6 w-6 text-[color:var(--pink)]" />
        <span>Toque para escolher fotos</span>
        <span className="text-[11px] text-white/40">JPG, PNG ou WEBP — pode selecionar várias</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {drafts.length > 0 && (
        <div className="space-y-3">
          <h2 className="px-1 text-sm font-semibold text-white/80">Novas fotos ({drafts.length})</h2>
          {drafts.map((d) => (
            <DraftCard
              key={d.localId}
              d={d}
              onChange={(c) => patch(d.localId, c)}
              onAnalyze={() => analyzeDraft(d)}
              onSave={() => saveDraft(d)}
              onRemove={() => removeDraft(d)}
            />
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h2 className="px-1 text-sm font-semibold text-white/80">
          Galeria atual ({items.length})
        </h2>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-white/50">
            Nada no banco ainda. A galeria pública está usando as fotos originais até você salvar
            a primeira aqui.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((row) => (
              <div
                key={row.id}
                className={`overflow-hidden rounded-2xl border ${
                  row.is_active ? "border-white/10" : "border-white/5 opacity-60"
                } bg-white/5`}
              >
                <img
                  src={row.image_url}
                  alt={row.title}
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
                <div className="p-2.5">
                  <p className="truncate text-xs font-semibold text-white">{row.title}</p>
                  <p className="truncate text-[10px] text-white/50">
                    {row.category} · {row.shape}
                  </p>
                  <div className="mt-2 flex gap-1">
                    <button
                      onClick={() => toggleActive(row)}
                      className="flex-1 rounded-full bg-white/10 px-2 py-1 text-[10px] text-white hover:bg-white/20"
                    >
                      {row.is_active ? (
                        <span className="flex items-center justify-center gap-1">
                          <Eye className="h-3 w-3" /> Ativa
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1">
                          <EyeOff className="h-3 w-3" /> Oculta
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => deleteItem(row)}
                      className="rounded-full bg-red-500/20 p-1.5 text-red-200 hover:bg-red-500/30"
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DraftCard({
  d,
  onChange,
  onAnalyze,
  onSave,
  onRemove,
}: {
  d: Draft;
  onChange: (c: Partial<Draft>) => void;
  onAnalyze: () => void;
  onSave: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
      <div className="flex flex-col gap-3 p-3 sm:flex-row">
        <div className="relative w-full shrink-0 sm:w-40">
          <img src={d.previewUrl} alt="" className="aspect-square w-full rounded-2xl object-cover" />
          {d.uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 text-white">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          <button
            onClick={onRemove}
            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
            aria-label="Remover"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Título" className="col-span-2">
              <input
                value={d.title}
                onChange={(e) => onChange({ title: e.target.value })}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[color:var(--pink)]"
                placeholder="Ex: Francesinha rosa"
              />
            </Field>
            <Field label="Categoria">
              <Select value={d.category} onChange={(v) => onChange({ category: v })} options={CATEGORIES} />
            </Field>
            <Field label="Formato">
              <Select value={d.shape} onChange={(v) => onChange({ shape: v })} options={SHAPES} />
            </Field>
            <Field label="Cor principal" className="col-span-2">
              <input
                value={d.mainColor}
                onChange={(e) => onChange({ mainColor: e.target.value })}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[color:var(--pink)]"
                placeholder="Ex: Nude com cristais"
              />
            </Field>
            <Field label="Acabamento" className="col-span-2">
              <Select value={d.finish} onChange={(v) => onChange({ finish: v })} options={FINISHES} />
            </Field>
            <Field label="Tempo médio">
              <input
                value={d.duration}
                onChange={(e) => onChange({ duration: e.target.value })}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[color:var(--pink)]"
              />
            </Field>
            <Field label="Durabilidade">
              <input
                value={d.durability}
                onChange={(e) => onChange({ durability: e.target.value })}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[color:var(--pink)]"
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-xs text-white/70">
            <input
              type="checkbox"
              checked={d.featured}
              onChange={(e) => onChange({ featured: e.target.checked })}
              className="h-3.5 w-3.5 accent-[#F7A8BD]"
            />
            Marcar como destaque
          </label>

          {d.error && (
            <p className="rounded-xl bg-red-500/15 p-2 text-xs text-red-200">{d.error}</p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onAnalyze}
              disabled={d.uploading || d.analyzing || !d.imageUrl}
              className="flex items-center gap-1.5 rounded-full border border-[color:var(--pink)]/40 bg-[color:var(--pink)]/10 px-3 py-2 text-xs font-semibold text-[color:var(--pink)] disabled:opacity-50"
            >
              {d.analyzing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Analisar com IA
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={d.uploading || d.saving || !d.imageUrl}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#F7A8BD] px-3 py-2 text-xs font-semibold text-[#061A33] disabled:opacity-50"
            >
              {d.saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Salvar na galeria
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-white/40">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[color:var(--pink)]"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-[#061A33]">
          {o}
        </option>
      ))}
    </select>
  );
}
