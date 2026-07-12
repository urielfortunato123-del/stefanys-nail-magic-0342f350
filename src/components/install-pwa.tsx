import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "stefany:install-dismissed";

export function InstallPWABanner() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone;
    if (standalone) return;
    if (ios) {
      setIsIOS(true);
      setVisible(true);
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
  };

  const install = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      dismiss();
    } else if (isIOS) {
      setShowIOSHelp(true);
    }
  };

  if (!visible) return null;

  return (
    <div className="glass-card mx-4 my-3 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--pink)]/20 text-[color:var(--pink)]">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Instale o aplicativo da Stefany no seu celular.</p>
          {showIOSHelp || isIOS ? (
            <ol className="mt-2 space-y-1 text-xs text-white/70">
              <li className="flex items-center gap-1">1. Toque em <Share className="inline h-3 w-3" /> Compartilhar no Safari.</li>
              <li>2. Escolha "Adicionar à Tela de Início".</li>
              <li>3. Confirme em "Adicionar".</li>
            </ol>
          ) : (
            <p className="mt-1 text-xs text-white/60">Acesso rápido, offline básico e experiência de aplicativo real.</p>
          )}
          <div className="mt-3 flex gap-2">
            {!isIOS && (
              <button onClick={install} className="rounded-full bg-[color:var(--pink)] px-4 py-1.5 text-xs font-semibold text-[color:var(--navy)]">
                Instalar aplicativo
              </button>
            )}
            {isIOS && !showIOSHelp && (
              <button onClick={install} className="rounded-full bg-[color:var(--pink)] px-4 py-1.5 text-xs font-semibold text-[color:var(--navy)]">
                Como instalar
              </button>
            )}
            <button onClick={dismiss} className="rounded-full px-3 py-1.5 text-xs text-white/60 hover:text-white">Agora não</button>
          </div>
        </div>
        <button onClick={dismiss} aria-label="Fechar" className="text-white/50 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
