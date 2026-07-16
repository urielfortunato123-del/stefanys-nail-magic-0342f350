import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Acesso administrativo" }, { name: "robots", content: "noindex" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) nav({ to: "/admin" });
    });
  }, [nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
    setLoading(false);
    if (error) {
      setErr("E-mail ou senha incorretos");
      return;
    }
    nav({ to: "/admin" });
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 py-8">
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--pink)]">Área restrita</p>
        <h1 className="font-display text-3xl text-white">Entrar</h1>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
        <label className="block">
          <span className="text-[11px] uppercase tracking-widest text-white/60">E-mail</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-[#F7A8BD]"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-widest text-white/60">Senha</span>
          <div className="relative mt-1">
            <input
              type={show ? "text" : "password"}
              required
              autoComplete="current-password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 pr-11 text-sm text-white outline-none focus:border-[#F7A8BD]"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/60 hover:bg-white/10"
              aria-label={show ? "Ocultar senha" : "Mostrar senha"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>
        {err && <p className="text-sm text-red-300">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#F7A8BD] py-3 text-sm font-semibold text-[#061A33] pink-glow disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Entrar
        </button>
        <Link to="/" className="block text-center text-xs text-white/50 hover:text-white/80">
          Voltar ao início
        </Link>
      </form>
    </div>
  );
}
