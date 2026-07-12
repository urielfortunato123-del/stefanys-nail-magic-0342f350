import { createFileRoute } from "@tanstack/react-router";
import { Share, Plus, Download } from "lucide-react";

export const Route = createFileRoute("/instalar")({
  head: () => ({
    meta: [
      { title: "Instalar o aplicativo — Stefany Próspero" },
      { name: "description", content: "Instale o aplicativo da Stefany no seu celular." },
    ],
  }),
  component: Instalar,
});

function Instalar() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--pink)]">PWA</p>
        <h1 className="font-display text-3xl text-white">Instalar o aplicativo</h1>
        <p className="mt-1 text-sm text-white/60">Tenha a Stefany a um toque de distância.</p>
      </div>

      <section className="glass-card rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2">
          <Download className="h-4 w-4 text-[color:var(--pink)]" />
          <h2 className="font-display text-lg text-white">Android / Chrome</h2>
        </div>
        <ol className="space-y-2 text-sm text-white/80">
          <li>1. Toque no menu do navegador (três pontos).</li>
          <li>2. Escolha "Instalar aplicativo" ou "Adicionar à tela inicial".</li>
          <li>3. Confirme para adicionar o ícone da Stefany.</li>
        </ol>
      </section>

      <section className="glass-card rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2">
          <Share className="h-4 w-4 text-[color:var(--pink)]" />
          <h2 className="font-display text-lg text-white">iPhone / Safari</h2>
        </div>
        <ol className="space-y-2 text-sm text-white/80">
          <li className="flex items-center gap-1">1. Toque no botão <Share className="inline h-3.5 w-3.5" /> Compartilhar.</li>
          <li className="flex items-center gap-1">2. Escolha "Adicionar à Tela de Início" <Plus className="inline h-3.5 w-3.5" />.</li>
          <li>3. Confirme em "Adicionar".</li>
        </ol>
      </section>
    </div>
  );
}
