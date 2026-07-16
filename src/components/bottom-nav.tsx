import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Sparkles, CalendarHeart, ListChecks, MessageCircle } from "lucide-react";

const items: { to: string; label: string; icon: typeof Home; primary?: boolean }[] = [
  { to: "/", label: "Início", icon: Home },
  { to: "/inspiracoes", label: "Inspirações", icon: Sparkles },
  { to: "/agendar", label: "Agendar", icon: CalendarHeart, primary: true },
  { to: "/servicos", label: "Serviços", icon: ListChecks },
  { to: "/contato", label: "Contato", icon: MessageCircle },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--pink)]/25 bg-white/80 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-5">
        {items.map(({ to, label, icon: Icon, primary }) => {
          const active = pathname === to || (to !== "/" && pathname.startsWith(to));
          return (
            <li key={to} className="flex">
              <Link
                to={to as never}
                aria-label={label}
                className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] transition ${
                  active ? "text-[color:var(--pink)]" : "text-white/60"
                }`}
              >
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full ${
                    primary
                      ? "bg-[color:var(--pink)] text-[color:var(--navy)] pink-glow"
                      : active
                        ? "bg-white/10"
                        : ""
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
