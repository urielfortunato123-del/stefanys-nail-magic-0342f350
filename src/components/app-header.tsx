import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, MessageCircle } from "lucide-react";
import { useRef } from "react";
import { businessConfig, whatsappLink, LOGO_URL } from "@/config/business";
import { supabase } from "@/integrations/supabase/client";
const logo = LOGO_URL;

export function AppHeader({ onMenu }: { onMenu?: () => void }) {
  const nav = useNavigate();
  const tapsRef = useRef<{ count: number; last: number }>({ count: 0, last: 0 });

  async function onLogoTap(e: React.MouseEvent) {
    const now = Date.now();
    const s = tapsRef.current;
    if (now - s.last > 1500) s.count = 0;
    s.count += 1;
    s.last = now;
    if (s.count >= 7) {
      e.preventDefault();
      s.count = 0;
      const { data } = await supabase.auth.getUser();
      nav({ to: data.user ? "/admin" : "/admin/login" });
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[color:var(--pink)]/25 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2" onClick={onLogoTap}>
          <img
            src={logo}
            alt="Stefany Próspero Nail Designer"
            width={54}
            height={54}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
            className="logo-stefany"
          />
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
