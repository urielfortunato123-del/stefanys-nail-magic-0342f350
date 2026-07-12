import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/area-atendida")({
  head: () => ({
    meta: [
      { title: "Área atendida — Stefany Próspero" },
      { name: "description", content: "Atendimento em domicílio. Consulte disponibilidade para sua região." },
    ],
  }),
  component: Area,
});

function Area() {
  const [city, setCity] = useState("");
  const navigate = useNavigate();
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--pink)]">Cobertura</p>
        <h1 className="font-display text-3xl text-white">Área atendida</h1>
        <p className="mt-1 text-sm text-white/70">
          A Stefany realiza atendimento em domicílio. A disponibilidade e possíveis taxas de deslocamento dependem da localização.
        </p>
      </div>

      <div className="glass-card grid aspect-video place-items-center rounded-2xl bg-gradient-to-br from-[color:var(--navy-deep)] to-[color:var(--navy)] text-white/40">
        <MapPin className="h-10 w-10" />
        <p className="text-xs">Mapa ilustrativo</p>
      </div>

      <div className="glass-card space-y-3 rounded-2xl p-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-white/70">Sua cidade ou bairro</span>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex.: Vila Mariana, São Paulo"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[color:var(--pink)]" />
        </label>
        <button onClick={() => navigate({ to: "/agendar" })} className="w-full rounded-full bg-[color:var(--pink)] py-3 text-sm font-semibold text-[color:var(--navy)] pink-glow">
          Consultar atendimento
        </button>
      </div>
    </div>
  );
}
