import { Link } from "@tanstack/react-router";
import { Menu, MessageCircle } from "lucide-react";
import { businessConfig, whatsappLink, LOGO_URL } from "@/config/business";
const logo = LOGO_URL;

export function AppHeader({ onMenu }: { onMenu?: () => void }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[color:var(--navy)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <div className="h-14 w-14 overflow-hidden rounded-full">
            <img src={logo} alt="Logo Stefany Próspero" width={56} height={56} className="h-full w-full scale-[1.35] object-cover" />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate font-display text-base font-semibold text-white">Stefany Próspero</div>
            <div className="truncate text-[10px] uppercase tracking-[0.2em] text-[color:var(--pink)]">Nail Designer</div>
          </div>
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <a
            href={whatsappLink(`Olá, Stefany! Vim pelo aplicativo. 💅`)}
            target="_blank"
            rel="noreferrer"
            aria-label="Abrir WhatsApp"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-white transition hover:bg-white/10"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
          <button
            type="button"
            onClick={onMenu}
            aria-label="Abrir menu"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-white transition hover:bg-white/10"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      {businessConfig.slogan && (
        <div className="sr-only">{businessConfig.slogan}</div>
      )}
    </header>
  );
}
