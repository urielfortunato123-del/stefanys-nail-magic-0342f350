import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { services } from "@/data/services";
import { useBooking } from "@/lib/booking-context";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços — Stefany Próspero Nail Designer" },
      { name: "description", content: "Alongamento, manutenção, esmaltação em gel, nail art e mais. Atendimento em domicílio." },
    ],
  }),
  component: Servicos,
});

function Servicos() {
  const { update } = useBooking();
  const navigate = useNavigate();
  const select = (id: string) => { update({ services: [id] }); navigate({ to: "/agendar" }); };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--pink)]">Serviços</p>
        <h1 className="font-display text-3xl text-white">Cuidados e arte</h1>
        <p className="mt-1 text-sm text-white/60">Valores confirmados pelo WhatsApp após avaliação.</p>
      </div>
      <div className="grid gap-3">
        {services.map((s) => (
          <div key={s.id} className="glass-card rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-lg text-white">{s.name}</h2>
                <p className="mt-1 text-xs text-white/60">{s.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-white/50">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {s.duration}</span>
                  <span>{s.price}</span>
                </div>
              </div>
            </div>
            <button onClick={() => select(s.id)} className="mt-3 w-full rounded-full bg-[color:var(--pink)] py-2.5 text-sm font-semibold text-[color:var(--navy)]">
              Selecionar serviço
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
