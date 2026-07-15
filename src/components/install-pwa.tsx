import { useEffect, useMemo, useState } from "react";
import { X, Share, Plus, Download, Smartphone, Apple, Check } from "lucide-react";
import { LOGO_URL, businessConfig } from "@/config/business";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const KEY_DISMISSED = "stefany_install_prompt_dismissed";
const KEY_PLATFORM = "stefany_install_platform";
const KEY_INSTALLED = "stefany_app_installed";

type Platform = "android" | "ios" | "desktop" | "unknown";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/mac|win|linux/i.test(ua)) return "desktop";
  return "unknown";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

type Props = { autoOpenDelayMs?: number; forceOpen?: boolean; onClose?: () => void };

export function InstallPWABanner(props: Props = {}) {
  return <InstallModal {...props} />;
}

export function InstallModal({ autoOpenDelayMs = 2000, forceOpen, onClose }: Props) {
  const platform = useMemo(detectPlatform, []);
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<Platform | null>(null);
  const [dontShow, setDontShow] = useState(false);
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  // Capture beforeinstallprompt globally
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const installedHandler = () => {
      try { localStorage.setItem(KEY_INSTALLED, "1"); } catch { /* ignore */ }
      setInstalled(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  // Auto-open logic
  useEffect(() => {
    if (forceOpen) { setOpen(true); return; }
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(KEY_DISMISSED) === "1") return;
      if (localStorage.getItem(KEY_INSTALLED) === "1") return;
    } catch { /* ignore */ }
    const t = setTimeout(() => setOpen(true), autoOpenDelayMs);
    return () => clearTimeout(t);
  }, [autoOpenDelayMs, forceOpen]);

  // Pre-select platform when opening
  useEffect(() => {
    if (!open) return;
    if (chosen) return;
    try {
      const saved = localStorage.getItem(KEY_PLATFORM) as Platform | null;
      if (saved) { setChosen(saved); return; }
    } catch { /* ignore */ }
    if (platform === "android" || platform === "ios") setChosen(platform);
  }, [open, platform, chosen]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = (persist: boolean) => {
    setOpen(false);
    if (persist || dontShow) {
      try { localStorage.setItem(KEY_DISMISSED, "1"); } catch { /* ignore */ }
    }
    onClose?.();
  };

  const chooseAndroid = () => {
    setChosen("android");
    try { localStorage.setItem(KEY_PLATFORM, "android"); } catch { /* ignore */ }
  };
  const chooseIOS = () => {
    setChosen("ios");
    try { localStorage.setItem(KEY_PLATFORM, "ios"); } catch { /* ignore */ }
  };

  const installAndroid = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const res = await deferred.userChoice;
    if (res.outcome === "accepted") {
      try { localStorage.setItem(KEY_INSTALLED, "1"); } catch { /* ignore */ }
      setInstalled(true);
    }
    setDeferred(null);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Instalar aplicativo"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      onClick={() => close(false)}
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card relative w-full max-w-md rounded-t-3xl bg-[color:var(--navy-deep)] p-5 pb-6 shadow-2xl sm:rounded-3xl"
      >
        <button
          onClick={() => close(false)}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          <div className="mx-auto h-20 w-20 overflow-hidden rounded-full">
            <img
              src={LOGO_URL}
              alt={businessConfig.professionalName}
              width={88}
              height={88}
              className="h-full w-full scale-105 object-cover"
            />
          </div>
          {installed ? (
            <>
              <h2 className="mt-3 font-display text-xl text-white">Aplicativo instalado com sucesso!</h2>
              <p className="mt-1 text-sm text-white/70">Abra o ícone da Stefany na tela inicial do seu celular.</p>
              <button
                onClick={() => close(true)}
                className="mt-5 w-full rounded-full bg-[color:var(--pink)] px-5 py-3 text-sm font-semibold text-[color:var(--navy)] pink-glow"
              >
                Ótimo!
              </button>
            </>
          ) : (
            <>
              <h2 className="mt-3 font-display text-xl text-white">Instale o aplicativo da Stefany</h2>
              <p className="mt-1 text-sm text-white/70">
                Tenha acesso rápido aos agendamentos, inspirações e serviços direto na tela do seu celular.
              </p>
            </>
          )}
        </div>

        {!installed && (
          <>
            <p className="mt-5 text-center text-xs uppercase tracking-[0.2em] text-white/50">Qual celular você usa?</p>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <button
                onClick={chooseAndroid}
                className={`glass-card flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center transition ${
                  chosen === "android" ? "ring-2 ring-[color:var(--pink)]" : ""
                }`}
              >
                <Smartphone className="h-6 w-6 text-[color:var(--pink)]" />
                <span className="text-sm font-semibold text-white">Android</span>
                <span className="text-[11px] leading-tight text-white/60">Instalação rápida e automática</span>
              </button>
              <button
                onClick={chooseIOS}
                className={`glass-card flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center transition ${
                  chosen === "ios" ? "ring-2 ring-[color:var(--pink)]" : ""
                }`}
              >
                <Apple className="h-6 w-6 text-[color:var(--pink)]" />
                <span className="text-sm font-semibold text-white">iPhone</span>
                <span className="text-[11px] leading-tight text-white/60">Adicionar à Tela de Início</span>
              </button>
            </div>

            {chosen === "android" && (
              <div className="mt-4 rounded-2xl bg-white/5 p-4 text-sm text-white/80">
                {deferred ? (
                  <>
                    <p className="mb-3">Toque no botão abaixo para instalar direto no seu Android.</p>
                    <button
                      onClick={installAndroid}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--pink)] px-5 py-3 text-sm font-semibold text-[color:var(--navy)] pink-glow"
                    >
                      <Download className="h-4 w-4" /> Instalar agora
                    </button>
                  </>
                ) : (
                  <ol className="space-y-1.5 text-xs">
                    <li>1. Abra o menu do navegador (três pontos).</li>
                    <li>2. Toque em "Instalar aplicativo" ou "Adicionar à tela inicial".</li>
                    <li>3. Confirme para adicionar o ícone da Stefany.</li>
                  </ol>
                )}
              </div>
            )}

            {chosen === "ios" && (
              <div className="mt-4 rounded-2xl bg-white/5 p-4 text-sm text-white/80">
                <p className="mb-2 text-xs text-white/60">Abra este aplicativo no Safari para instalar:</p>
                <ol className="space-y-1.5 text-xs">
                  <li className="flex items-center gap-1">1. Toque em <Share className="inline h-3.5 w-3.5" /> Compartilhar.</li>
                  <li>2. Role e escolha "Adicionar à Tela de Início" <Plus className="inline h-3.5 w-3.5" />.</li>
                  <li>3. Confirme o nome "Stefany Nails" e toque em "Adicionar".</li>
                  <li>4. O ícone aparecerá na tela inicial do iPhone.</li>
                </ol>
                <p className="mt-3 text-[11px] text-white/50">
                  Está no Chrome do iPhone? Abra este endereço no Safari para instalar.
                </p>
              </div>
            )}

            <label className="mt-4 flex items-center gap-2 text-xs text-white/60">
              <input
                type="checkbox"
                checked={dontShow}
                onChange={(e) => setDontShow(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/10"
              />
              Não mostrar novamente
            </label>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => close(false)}
                className="flex-1 rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80"
              >
                Agora não
              </button>
              <button
                onClick={() => close(true)}
                className="flex-1 rounded-full bg-white/10 px-4 py-2.5 text-sm font-medium text-white"
              >
                <Check className="mr-1 inline h-3.5 w-3.5" /> Entendi
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Botão "Instalar aqui" reutilizável
export function InstallHereButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  if (typeof window !== "undefined" && isStandalone()) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/5 ${className}`}
      >
        <Download className="h-4 w-4 text-[color:var(--pink)]" />
        Instalar aplicativo
      </button>
      {open && <InstallModal forceOpen onClose={() => setOpen(false)} autoOpenDelayMs={0} />}
    </>
  );
}
