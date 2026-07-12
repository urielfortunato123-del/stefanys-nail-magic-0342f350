import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle, Home, RotateCcw, Camera } from "lucide-react";
import { useBooking } from "@/lib/booking-context";
import { businessConfig, whatsappLink } from "@/config/business";
import { buildWhatsAppMessage } from "@/lib/whatsapp";

export const Route = createFileRoute("/agendar/sucesso")({
  head: () => ({ meta: [{ title: "Solicitação preparada — Stefany Próspero" }, { name: "robots", content: "noindex" }] }),
  component: Success,
});

function Success() {
  const { data, reset } = useBooking();
  const navigate = useNavigate();
  const openAgain = () => window.open(whatsappLink(buildWhatsAppMessage(data)), "_blank");
  const newBooking = () => { reset(); navigate({ to: "/agendar" }); };

  return (
    <div className="glass-card rounded-3xl p-6 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[color:var(--pink)]/20 text-[color:var(--pink)]">
        <CheckCircle2 className="h-9 w-9" />
      </div>
      <h1 className="mt-4 font-display text-2xl text-white">Solicitação preparada com sucesso!</h1>
      <p className="mt-2 text-sm text-white/70">Agora é só enviar a mensagem para a Stefany e aguardar a confirmação.</p>

      {data.referenceImage && (
        <div className="mt-4 rounded-xl border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/10 p-3 text-left text-xs text-[color:var(--gold)]">
          <Camera className="mr-1 inline h-4 w-4" />
          Não se esqueça de anexar sua foto de inspiração no WhatsApp.
        </div>
      )}

      <div className="mt-6 grid gap-2">
        <button onClick={openAgain} className="flex items-center justify-center gap-2 rounded-full bg-[color:var(--pink)] px-5 py-3 text-sm font-semibold text-[color:var(--navy)] pink-glow">
          <MessageCircle className="h-4 w-4" /> Abrir WhatsApp novamente
        </button>
        <button onClick={newBooking} className="flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white">
          <RotateCcw className="h-4 w-4" /> Fazer outro agendamento
        </button>
        <Link to="/" className="flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm text-white/70 hover:text-white">
          <Home className="h-4 w-4" /> Voltar ao início
        </Link>
      </div>
      <p className="mt-6 text-[11px] text-white/40">{businessConfig.professionalName} · {businessConfig.slogan}</p>
    </div>
  );
}
