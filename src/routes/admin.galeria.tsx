import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2, Sparkles, Trash2, Upload, X, Eye, EyeOff, AlertTriangle, Copy, Tag, Eraser,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { analyzeNailImage, generateTagsFromImage, OCCASION_OPTIONS } from "@/lib/gallery-ai.functions";
import { normalize } from "@/lib/gallery-search";

export const Route = createFileRoute("/admin/galeria")({
  head: () => ({
    meta: [{ title: "Admin — Galeria" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminGaleria,
});

const CATEGORIES = ["Francesinha", "Decoradas", "Coloridas", "Luxo", "Minimalistas", "Nail Art"];
const SHAPES = ["Almond", "Bailarina", "Stiletto", "Quadrada"];
const LENGTHS = ["Curto", "Médio", "Longo", "Extra longo"];
const FINISHES = ["Glitter", "Encapsulado", "Pedrarias", "3D", "Pintura Artística", "Francesinha"];
const STYLES = ["Minimalista", "Luxo", "Decorada", "Nail Art", "Francesinha", "Colorida"];
const COLORS = [
  "Nude", "Branco", "Preto", "Rosa", "Rosa claro", "Rosa pink", "Vermelho", "Vinho",
  "Nude com cristais", "Dourado", "Prata", "Azul", "Azul marinho", "Verde", "Roxo",
  "Marrom", "Bege", "Glitter", "Cristal", "Pérola", "Multicolorido",
];
const DURATIONS = ["1h", "1h30", "2h", "2h30", "3h", "3h30"];
const DURABILITIES = ["2 semanas", "3 semanas", "até 20 dias", "até 25 dias", "1 mês"];

const SIGNED_URL_TTL = 60 * 60 * 24 * 365;

type DbRow = {
  id: string;
  title: string;
  category: string;
  shape: string;
  length: string;
  main_color: string;
  secondary_color: string | null;
  finish: string;
  style: string;
  keywords: string[];
  occasions: string[];
  description: string;
  image_url: string;
  storage_path: string | null;
  duration: string;
  durability: string;
  featured: boolean;
  is_active: boolean;
};

type Draft = {
  localId: string;
  file?: File;
  previewUrl: string;
  uploading: boolean;
  uploadedPath?: string;
  imageUrl?: string;
  analyzing: boolean;
  generatingTags: boolean;
  saving: boolean;
  error?: string;
  // form fields
  title: string;
  category: string;
  shape: string;
  length: string;
  mainColor: string;
  secondaryColor: string;
  finish: string;
  style: string;
  tags: string[];
  occasions: string[];
  description: string;
  duration: string;
  durability: string;
  featured: boolean;
};

const emptyDraftFields = () => ({
  title: "",
  category: "Decoradas",
  shape: "Almond",
  length: "Médio",
  mainColor: "Nude",
  secondaryColor: "",
  finish: "Pintura Artística",
  style: "Decorada",
  tags: [] as string[],
  occasions: [] as string[],
  description: "",
  duration: "2h",
  durability: "3 semanas",
  featured: false,
});

function newFileDraft(file: File): Draft {
  const base = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
  return {
    localId: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    uploading: true,
    analyzing: false,
    generatingTags: false,
    saving: false,
    ...emptyDraftFields(),
    title: base.slice(0, 40),
  };
}

function duplicateFromRow(row: DbRow): Draft {
  return {
    localId: crypto.randomUUID(),
    previewUrl: row.image_url,
    uploading: false,
    uploadedPath: row.storage_path ?? undefined,
    imageUrl: row.image_url,
    analyzing: false,
    generatingTags: false,
    saving: false,
    title: `${row.title} (cópia)`,
    category: row.category,
    shape: row.shape,
    length: row.length,
    mainColor: row.main_color,
    secondaryColor: row.secondary_color ?? "",
    finish: row.finish,
    style: row.style,
    tags: [...(row.keywords ?? [])],
    occasions: [...(row.occasions ?? [])],
    description: row.description,
    duration: row.duration,
    durability: row.durability,
    featured: false,
  };
}

function normalizeTag(t: string) {
  return normalize(t).slice(0, 30);
}

function AdminGaleria() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [items, setItems] = useState<DbRow[]>([]);
  const [loading, setLoading] = useState(true);
  const analyzeFn = useServerFn(analyzeNailImage);
  const tagsFn = useServerFn(generateTagsFromImage);

  const loadItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("nail_models")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as DbRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const uploadDraft = async (draft: Draft) => {
    if (!draft.file) return;
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
      .map(newFileDraft);
    setDrafts((d) => [...newDrafts, ...d]);
    newDrafts.forEach((d) => void uploadDraft(d));
  };

  const patch = (localId: string, changes: Partial<Draft>) =>
    setDrafts((ds) => ds.map((d) => (d.localId === localId ? { ...d, ...changes } : d)));

  const replaceImage = (localId: string, file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setDrafts((ds) =>
      ds.map((d) =>
        d.localId === localId
          ? { ...d, file, previewUrl, uploading: true, uploadedPath: undefined, imageUrl: undefined, error: undefined }
          : d,
      ),
    );
    const target: Draft = { ...drafts.find((x) => x.localId === localId)!, file, previewUrl };
    void uploadDraft(target);
  };

  const analyzeDraft = async (d: Draft) => {
    if (!d.imageUrl) return;
    patch(d.localId, { analyzing: true, error: undefined });
    try {
      const res = await analyzeFn({ data: { imageUrl: d.imageUrl } });
      const tags = Array.from(new Set((res.tags ?? []).map(normalizeTag).filter(Boolean)));
      patch(d.localId, {
        analyzing: false,
        title: res.title,
        category: res.category,
        shape: res.shape,
        length: res.length,
        mainColor: res.mainColor,
        secondaryColor: res.secondaryColor || "",
        finish: res.finish,
        style: res.style,
        tags,
        occasions: res.occasions ?? [],
        description: res.description,
        duration: res.duration,
        durability: res.durability,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao analisar";
      patch(d.localId, { analyzing: false, error: msg });
    }
  };

  const generateTags = async (d: Draft) => {
    if (!d.imageUrl) return;
    patch(d.localId, { generatingTags: true, error: undefined });
    try {
      const res = await tagsFn({ data: { imageUrl: d.imageUrl } });
      const suggested = Array.from(new Set((res.tags ?? []).map(normalizeTag).filter(Boolean)));
      // mescla com as existentes, sem duplicar
      const merged = Array.from(new Set([...d.tags, ...suggested]));
      const mergedOcc = Array.from(new Set([...d.occasions, ...(res.occasions ?? [])]));
      patch(d.localId, { generatingTags: false, tags: merged, occasions: mergedOcc });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao gerar tags";
      patch(d.localId, { generatingTags: false, error: msg });
    }
  };

  const clearSuggestions = (d: Draft) => {
    patch(d.localId, {
      ...emptyDraftFields(),
      title: d.title, // preserva o nome digitado
      error: undefined,
    });
  };

  const saveDraft = async (d: Draft) => {
    if (!d.imageUrl) return patch(d.localId, { error: "Envie a foto primeiro" });
    if (!d.title.trim()) return patch(d.localId, { error: "Preencha o nome do modelo" });
    patch(d.localId, { saving: true, error: undefined });
    const { error } = await supabase.from("nail_models").insert({
      title: d.title.trim(),
      category: d.category,
      shape: d.shape,
      length: d.length,
      main_color: d.mainColor,
      secondary_color: d.secondaryColor || null,
      finish: d.finish,
      style: d.style,
      keywords: d.tags,
      occasions: d.occasions,
      description: d.description.trim(),
      image_url: d.imageUrl,
      storage_path: d.uploadedPath ?? null,
      duration: d.duration,
      durability: d.durability,
      featured: d.featured,
      is_active: true,
    });
    if (error) return patch(d.localId, { saving: false, error: error.message });
    if (d.file) URL.revokeObjectURL(d.previewUrl);
    setDrafts((ds) => ds.filter((x) => x.localId !== d.localId));
    void loadItems();
  };

  const removeDraft = (d: Draft) => {
    if (d.file) URL.revokeObjectURL(d.previewUrl);
    if (d.file && d.uploadedPath) void supabase.storage.from("galeria").remove([d.uploadedPath]);
    setDrafts((ds) => ds.filter((x) => x.localId !== d.localId));
  };

  const duplicateItem = (row: DbRow) => {
    setDrafts((ds) => [duplicateFromRow(row), ...ds]);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleActive = async (row: DbRow) => {
    await supabase.from("nail_models").update({ is_active: !row.is_active }).eq("id", row.id);
    void loadItems();
  };

  const deleteItem = async (row: DbRow) => {
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
          Envie fotos, revise os campos (ou peça sugestão à IA) e salve.
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
          <h2 className="px-1 text-sm font-semibold text-white/80">
            Novos modelos ({drafts.length})
          </h2>
          {drafts.map((d) => (
            <DraftCard
              key={d.localId}
              d={d}
              onChange={(c) => patch(d.localId, c)}
              onAnalyze={() => analyzeDraft(d)}
              onGenerateTags={() => generateTags(d)}
              onClearSuggestions={() => clearSuggestions(d)}
              onSave={() => saveDraft(d)}
              onRemove={() => removeDraft(d)}
              onReplaceImage={(file) => replaceImage(d.localId, file)}
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
            Nada no banco ainda. A galeria pública está usando as fotos originais até você
            salvar a primeira aqui.
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
                    {row.category} · {row.shape} · {row.length}
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
                      onClick={() => duplicateItem(row)}
                      className="rounded-full bg-[color:var(--pink)]/20 p-1.5 text-[color:var(--pink)] hover:bg-[color:var(--pink)]/30"
                      aria-label="Duplicar"
                      title="Duplicar modelo"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => deleteItem(row)}
                      className="rounded-full bg-red-500/20 p-1.5 text-red-200 hover:bg-red-500/30"
                      aria-label="Excluir"
                      title="Excluir"
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
  d, onChange, onAnalyze, onGenerateTags, onClearSuggestions, onSave, onRemove, onReplaceImage,
}: {
  d: Draft;
  onChange: (c: Partial<Draft>) => void;
  onAnalyze: () => void;
  onGenerateTags: () => void;
  onClearSuggestions: () => void;
  onSave: () => void;
  onRemove: () => void;
  onReplaceImage: (file: File) => void;
}) {
  const [tagInput, setTagInput] = useState("");
  const addTag = (raw: string) => {
    const t = normalizeTag(raw);
    if (!t) return;
    if (d.tags.includes(t)) return;
    onChange({ tags: [...d.tags, t] });
  };
  const removeTag = (t: string) => onChange({ tags: d.tags.filter((x) => x !== t) });
  const toggleOccasion = (o: string) => {
    onChange({
      occasions: d.occasions.includes(o)
        ? d.occasions.filter((x) => x !== o)
        : [...d.occasions, o],
    });
  };

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
          <label className="mt-2 flex cursor-pointer items-center justify-center gap-1 rounded-full bg-white/10 py-1.5 text-[10px] text-white hover:bg-white/20">
            <Upload className="h-3 w-3" /> Trocar foto
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onReplaceImage(f);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Nome do modelo" className="col-span-2">
              <input
                value={d.title}
                onChange={(e) => onChange({ title: e.target.value })}
                className={inputCls}
                placeholder="Ex: Francesinha rosa"
              />
            </Field>
            <Field label="Categoria">
              <Select value={d.category} onChange={(v) => onChange({ category: v })} options={CATEGORIES} />
            </Field>
            <Field label="Estilo">
              <Select value={d.style} onChange={(v) => onChange({ style: v })} options={STYLES} />
            </Field>
            <Field label="Formato">
              <Select value={d.shape} onChange={(v) => onChange({ shape: v })} options={SHAPES} />
            </Field>
            <Field label="Comprimento">
              <Select value={d.length} onChange={(v) => onChange({ length: v })} options={LENGTHS} />
            </Field>
            <Field label="Cor principal">
              <Select value={d.mainColor} onChange={(v) => onChange({ mainColor: v })} options={COLORS} />
            </Field>
            <Field label="Cor secundária">
              <Select
                value={d.secondaryColor}
                onChange={(v) => onChange({ secondaryColor: v })}
                options={["", ...COLORS]}
                labelFor={(v) => (v === "" ? "— nenhuma —" : v)}
              />
            </Field>
            <Field label="Acabamento" className="col-span-2">
              <Select value={d.finish} onChange={(v) => onChange({ finish: v })} options={FINISHES} />
            </Field>
            <Field label="Tempo médio">
              <Select value={d.duration} onChange={(v) => onChange({ duration: v })} options={DURATIONS} />
            </Field>
            <Field label="Durabilidade">
              <Select value={d.durability} onChange={(v) => onChange({ durability: v })} options={DURABILITIES} />
            </Field>

            <Field label="Ocasião" className="col-span-2">
              <div className="flex flex-wrap gap-1.5">
                {OCCASION_OPTIONS.map((o) => {
                  const active = d.occasions.includes(o);
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => toggleOccasion(o)}
                      className={`rounded-full px-3 py-1 text-[11px] transition ${
                        active
                          ? "bg-[#F7A8BD] text-[#061A33]"
                          : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                      }`}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Tags" className="col-span-2">
              <div className="rounded-xl border border-white/15 bg-white/5 p-2">
                {d.tags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {d.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-full bg-[color:var(--pink)]/20 py-0.5 pl-2 pr-1 text-[11px] text-[color:var(--pink)]"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => removeTag(t)}
                          className="rounded-full p-0.5 hover:bg-white/10"
                          aria-label={`Remover ${t}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag(tagInput);
                      setTagInput("");
                    } else if (e.key === "Backspace" && !tagInput && d.tags.length) {
                      removeTag(d.tags[d.tags.length - 1]);
                    }
                  }}
                  onBlur={() => {
                    if (tagInput) {
                      addTag(tagInput);
                      setTagInput("");
                    }
                  }}
                  placeholder={d.tags.length ? "Adicionar tag..." : "Digite e Enter (ex: rosa, delicada, casamento)"}
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
                />
              </div>
            </Field>

            <Field label="Descrição" className="col-span-2">
              <textarea
                value={d.description}
                onChange={(e) => onChange({ description: e.target.value })}
                rows={2}
                className={inputCls + " resize-none"}
                placeholder="Frase curta que descreve o modelo"
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

          {/* Prévia */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-2">
            <p className="mb-1.5 text-[10px] uppercase tracking-widest text-white/40">
              Prévia na galeria
            </p>
            <div className="flex gap-2">
              <img src={d.previewUrl} alt="" className="h-20 w-20 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {d.title || "Sem nome"}
                </p>
                <p className="truncate text-[11px] text-white/50">
                  {d.category} · {d.shape} · {d.length} · {d.mainColor}
                </p>
                {d.tags.length > 0 && (
                  <p className="mt-1 truncate text-[10px] text-white/40">#{d.tags.join(" #")}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onAnalyze}
              disabled={d.uploading || d.analyzing || !d.imageUrl}
              className="flex items-center gap-1.5 rounded-full border border-[color:var(--pink)]/40 bg-[color:var(--pink)]/10 px-3 py-2 text-xs font-semibold text-[color:var(--pink)] disabled:opacity-50"
            >
              {d.analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Analisar com IA
            </button>
            <button
              type="button"
              onClick={onGenerateTags}
              disabled={d.uploading || d.generatingTags || !d.imageUrl}
              className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {d.generatingTags ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Tag className="h-3.5 w-3.5" />}
              Gerar tags com IA
            </button>
            <button
              type="button"
              onClick={onClearSuggestions}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
            >
              <Eraser className="h-3.5 w-3.5" /> Limpar sugestões
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

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[color:var(--pink)]";

function Field({
  label, children, className = "",
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
  value, onChange, options, labelFor,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labelFor?: (v: string) => string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    >
      {options.map((o) => (
        <option key={o || "__empty"} value={o} className="bg-[#061A33]">
          {labelFor ? labelFor(o) : o}
        </option>
      ))}
    </select>
  );
}
