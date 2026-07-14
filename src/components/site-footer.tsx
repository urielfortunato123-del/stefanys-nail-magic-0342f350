import { MessageCircle } from "lucide-react";

const developerMessage = encodeURIComponent(
  `Olá, Uriel!\n\nGostei do aplicativo da Stefany e gostaria de saber mais sobre desenvolver um aplicativo semelhante para o meu negócio.`
);
const developerLink = `https://wa.me/5515996969953?text=${developerMessage}`;

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-white/10 bg-[color:var(--navy)] px-4 py-6 text-center">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
        Desenvolvido por
      </p>
      <a
        href={developerLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Entrar em contato com o desenvolvedor"
        className="mt-1 inline-block font-display text-base font-semibold text-white transition-colors hover:text-[color:var(--pink)] active:text-[color:var(--pink)]"
      >
        Uriel da Fonseca Fortunato
      </a>
      <div className="mt-3">
        <a
          href={developerLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Entrar em contato com o desenvolvedor"
          className="inline-flex items-center gap-2 rounded-full bg-[color:var(--pink)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.97]"
        >
          <MessageCircle size={14} />
          Contato com o Desenvolvedor
        </a>
      </div>
    </footer>
  );
}
