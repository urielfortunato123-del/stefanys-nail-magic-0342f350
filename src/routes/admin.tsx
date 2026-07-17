import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  createInspiracao,
  listInspiracoesAll,
  updateInspiracao,
  deleteInspiracao,
  resolveImageUrl,
  FORMATOS,
  ESTILOS,
  type InspiracaoRow,
  type InspiracaoTipo,
} from "@/lib/inspiracoes";
import {
  DEFAULT_AREA_CONFIG,
  loadAreaConfig,
  saveAreaConfig,
  type AreaAtendidaConfig,
} from "@/lib/area-atendida-config";
import { Loader2, LogOut, Upload, Eye, EyeOff as OffIcon, Trash2, MapPin } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel administrativo" }, { name: "robots", content: "noindex" }] }),
  component: AdminPanel,
});

function AdminPanel() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<InspiracaoRow[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        nav({ to: "/admin/login" });
        return;
      }
      setReady(true);
    });
  }, [nav]);

  async function reload() {
    const list = await listInspiracoesAll();
    setRows(list);
    const map: Record<string, string> = {};
    await Promise.all(
      list.map(async (r) => {
        map[r.id] = await resolveImageUrl(r);
      }),
    );
    setThumbs(map);
  }

  useEffect(() => {
    if (ready) reload();
  }, [ready]);

  async function signOut() {
    await supabase.auth.signOut();
    nav({ to: "/admin/login" });
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-20 text-white/60">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--pink)]">Área restrita</p>
          <h1 className="font-display text-2xl text-white">Painel de inspirações</h1>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </header>

      <NewInspiracaoForm
        onCreated={(r) => {
          setMsg("Inspiração publicada com sucesso.");
          setRows((prev) => [r, ...prev]);
          resolveImageUrl(r).then((u) => setThumbs((m) => ({ ...m, [r.id]: u })));
          setTimeout(() => setMsg(null), 4000);
        }}
      />

      {msg && (
        <div className="rounded-2xl bg-[#F7A8BD]/20 p-3 text-center text-sm text-white">
          {msg}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-lg text-white">Cadastradas ({rows.length})</h2>
        {rows.length === 0 && (
          <p className="text-sm text-white/60">Nenhuma inspiração ainda.</p>
        )}
        <ul className="space-y-3">
          {rows.map((r) => (
            <AdminRow
              key={r.id}
              row={r}
              thumb={thumbs[r.id]}
              onChange={reload}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

function NewInspiracaoForm({ onCreated }: { onCreated: (row: InspiracaoRow) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tipo, setTipo] = useState<InspiracaoTipo>("Mãos");
  const [formato, setFormato] = useState<string>("Stiletto");
  const [estilo, setEstilo] = useState<string>("Decorada");
  const [cor, setCor] = useState<string>("Não informar");
  const [titulo, setTitulo] = useState<string>("");
  const [ativo, setAtivo] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setErr(null);
    if (!f) return;
    if (!/(image\/jpeg|image\/jpg|image\/png|image\/webp)/i.test(f.type)) {
      setErr("Envie apenas JPG, PNG ou WEBP.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErr("Imagem acima de 10 MB. Escolha uma menor.");
      return;
    }
    setFile(f);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setErr("Selecione uma foto.");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      const row = await createInspiracao({ file, tipo, formato, estilo, cor, titulo, ativo });
      onCreated(row);
      setFile(null);
      setTitulo("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha ao salvar.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4">
      <h2 className="font-display text-lg text-white">Nova inspiração</h2>

      <label className="block">
        <span className="text-[11px] uppercase tracking-widest text-white/60">Foto</span>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={onPick}
          className="mt-1 block w-full text-xs text-white/80 file:mr-3 file:rounded-full file:border-0 file:bg-[#F7A8BD] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[#061A33]"
        />
      </label>
      {preview && (
        <img src={preview} alt="Prévia" className="max-h-64 w-full rounded-2xl object-contain bg-black/20" />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo">
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as InspiracaoTipo)}
            className="select-dark"
          >
            <option value="Mãos">Mãos</option>
            <option value="Pés">Pés</option>
          </select>
        </Field>
        <Field label="Formato">
          <select value={formato} onChange={(e) => setFormato(e.target.value)} className="select-dark">
            {FORMATOS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </Field>
        <Field label="Estilo">
          <select value={estilo} onChange={(e) => setEstilo(e.target.value)} className="select-dark">
            {ESTILOS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Cor">
          <input
            list="cores-sugestoes"
            value={cor}
            onChange={(e) => setCor(e.target.value)}
            className="select-dark"
            placeholder="Cor ou 'Não informar'"
          />
          <datalist id="cores-sugestoes">
            <option value="Não informar" />
            <option value="Rosa" />
            <option value="Nude" />
            <option value="Vermelho" />
            <option value="Branco" />
            <option value="Preto" />
            <option value="Azul" />
            <option value="Verde" />
            <option value="Dourado" />
            <option value="Prateado" />
          </datalist>
        </Field>
      </div>

      <Field label="Título (opcional)">
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Inspiração"
          className="select-dark"
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-white/80">
        <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
        Ativa / publicada
      </label>

      {err && <p className="text-sm text-red-300">{err}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#F7A8BD] py-3 text-sm font-semibold text-[#061A33] pink-glow disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Salvar inspiração
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-white/60">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function AdminRow({ row, thumb, onChange }: { row: InspiracaoRow; thumb?: string; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<InspiracaoRow>>(row);

  async function toggleAtivo() {
    setBusy(true);
    try {
      await updateInspiracao(row.id, { ativo: !row.ativo });
      onChange();
    } finally {
      setBusy(false);
    }
  }

  async function onSave() {
    setBusy(true);
    try {
      await updateInspiracao(row.id, {
        titulo: draft.titulo ?? row.titulo,
        tipo: draft.tipo ?? row.tipo,
        formato: draft.formato ?? row.formato,
        estilo: draft.estilo ?? row.estilo,
        cor: draft.cor ?? row.cor,
      });
      setEditing(false);
      onChange();
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!confirm("Excluir esta inspiração definitivamente? Esta ação não pode ser desfeita.")) return;
    setBusy(true);
    try {
      await deleteInspiracao(row);
      onChange();
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      {thumb ? (
        <img src={thumb} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
      ) : (
        <div className="h-20 w-20 shrink-0 rounded-xl bg-white/10" />
      )}
      <div className="min-w-0 flex-1 text-sm text-white">
        {editing ? (
          <div className="grid grid-cols-2 gap-2">
            <select value={draft.tipo ?? row.tipo} onChange={(e) => setDraft((d) => ({ ...d, tipo: e.target.value }))} className="select-dark">
              <option>Mãos</option>
              <option>Pés</option>
            </select>
            <select value={draft.formato ?? row.formato} onChange={(e) => setDraft((d) => ({ ...d, formato: e.target.value }))} className="select-dark">
              {FORMATOS.map((f) => <option key={f}>{f}</option>)}
            </select>
            <select value={draft.estilo ?? row.estilo} onChange={(e) => setDraft((d) => ({ ...d, estilo: e.target.value }))} className="select-dark">
              {ESTILOS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input value={draft.cor ?? row.cor} onChange={(e) => setDraft((d) => ({ ...d, cor: e.target.value }))} className="select-dark" />
            <input value={draft.titulo ?? row.titulo} onChange={(e) => setDraft((d) => ({ ...d, titulo: e.target.value }))} className="select-dark col-span-2" placeholder="Título" />
          </div>
        ) : (
          <>
            <p className="truncate font-semibold">{row.titulo}</p>
            <p className="text-xs text-white/60">{row.tipo} · {row.formato} · {row.estilo}</p>
            <p className="text-xs text-white/60">Cor: {row.cor}</p>
            <p className={`text-xs ${row.ativo ? "text-emerald-300" : "text-amber-300"}`}>
              {row.ativo ? "Publicada" : "Oculta"}
            </p>
          </>
        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {editing ? (
            <>
              <button disabled={busy} onClick={onSave} className="rounded-full bg-[#F7A8BD] px-3 py-1 text-xs font-semibold text-[#061A33]">Salvar</button>
              <button disabled={busy} onClick={() => { setEditing(false); setDraft(row); }} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80">Cancelar</button>
            </>
          ) : (
            <>
              <button disabled={busy} onClick={() => setEditing(true)} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80">Editar</button>
              <button disabled={busy} onClick={toggleAtivo} className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-xs text-white/80">
                {row.ativo ? <><OffIcon className="h-3 w-3" /> Ocultar</> : <><Eye className="h-3 w-3" /> Publicar</>}
              </button>
              <button disabled={busy} onClick={onDelete} className="flex items-center gap-1 rounded-full border border-red-300/40 px-3 py-1 text-xs text-red-200">
                <Trash2 className="h-3 w-3" /> Excluir
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
