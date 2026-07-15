import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MessageCircle, X, Send, Sparkles, RotateCcw, Camera, Loader2, ArrowLeft } from "lucide-react";
import { chatNodes, filterModelsByQuiz, type ChatNode, type ChatOption, type ModelQuizAnswers } from "@/lib/chatbot-flows";
import { gallery, type GalleryItem } from "@/data/gallery";
import { whatsappLink } from "@/config/business";
import { shareModel } from "@/lib/share-model";
import { uploadReferenceImage, tryShareRemoteImage } from "@/lib/upload-reference";

type Msg =
  | { role: "bot"; text: string; id: string }
  | { role: "user"; text: string; id: string };

type Mode =
  | { kind: "node"; nodeId: string }
  | { kind: "quiz"; step: number; answers: ModelQuizAnswers }
  | { kind: "quiz-result"; models: GalleryItem[] }
  | { kind: "upload-broken" };

const QUIZ_STEPS = [
  { key: "size", q: "Você prefere unhas curtas, médias ou longas?", opts: ["Curta", "Média", "Longa"] },
  { key: "shape", q: "Qual formato você gosta mais?", opts: ["Quadrada", "Almond", "Bailarina", "Stiletto", "Oval"] },
  { key: "vibe", q: "Prefere algo delicado, clássico ou chamativo?", opts: ["Delicada", "Clássica", "Chamativa"] },
  { key: "color", q: "Qual cor você mais gosta?", opts: ["Nude", "Rosa", "Branco", "Vermelho", "Preto", "Colorido"] },
  { key: "extra", q: "Gosta de pedrarias, glitter, desenhos ou nada disso?", opts: ["Pedrarias", "Glitter", "Desenho", "Nenhum"] },
] as const;

const uid = () => Math.random().toString(36).slice(2);

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [mode, setMode] = useState<Mode>({ kind: "node", nodeId: "menu" });
  const [typing, setTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && messages.length === 0) {
      pushBot(chatNodes.menu.text);
    }
  }, [open, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [messages, typing]);

  const pushBot = (text: string) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: "bot", text, id: uid() }]);
    }, 350);
  };

  const pushUser = (text: string) =>
    setMessages((m) => [...m, { role: "user", text, id: uid() }]);

  const goToNode = (nodeId: string) => {
    const node = chatNodes[nodeId];
    if (!node) return;
    setMode({ kind: "node", nodeId });
    pushBot(node.text);
  };

  const handleOption = async (opt: ChatOption) => {
    pushUser(opt.label);
    if (opt.action) {
      if (opt.action.type === "whatsapp") {
        window.open(whatsappLink(opt.action.message), "_blank");
        pushBot("Abri o WhatsApp para você continuar a conversa com a Stefany. 💛");
        return;
      }
      if (opt.action.type === "route") {
        navigate({ to: opt.action.to });
        setOpen(false);
        return;
      }
      if (opt.action.type === "start-model-quiz") {
        setMode({ kind: "quiz", step: 0, answers: {} });
        pushBot(QUIZ_STEPS[0].q);
        return;
      }
      if (opt.action.type === "upload-broken-nail") {
        setMode({ kind: "upload-broken" });
        pushBot("Envie uma foto da unha para eu passar à Stefany. Toque no botão da câmera abaixo. 📸");
        return;
      }
    }
    if (opt.next) goToNode(opt.next);
  };

  const answerQuiz = (value: string) => {
    if (mode.kind !== "quiz") return;
    pushUser(value);
    const stepDef = QUIZ_STEPS[mode.step];
    const newAnswers = { ...mode.answers, [stepDef.key]: value } as ModelQuizAnswers;
    if (mode.step + 1 < QUIZ_STEPS.length) {
      setMode({ kind: "quiz", step: mode.step + 1, answers: newAnswers });
      pushBot(QUIZ_STEPS[mode.step + 1].q);
    } else {
      const models = filterModelsByQuiz(gallery, newAnswers);
      setMode({ kind: "quiz-result", models });
      pushBot(
        models.length
          ? "Achei estes modelos que combinam com você! Toque em um para escolher 👇"
          : "Não encontrei modelos exatos, mas você pode explorar a galeria completa.",
      );
    }
  };

  const chooseModelFromQuiz = async (item: GalleryItem) => {
    pushUser(`Escolhi: ${item.title}`);
    await shareModel(item);
    pushBot("Prontinho! Enviei sua escolha para a Stefany. 💅");
    resetToMenu();
  };

  const handleBrokenPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { signedUrl } = await uploadReferenceImage(file);
      const message = `Olá, Stefany! 💅

Minha unha quebrou e estou enviando uma foto para você avaliar.

🖼️ Foto:
${signedUrl}`;
      const shared = await tryShareRemoteImage(
        signedUrl,
        "unha-quebrada",
        message,
        "Foto da unha",
      );
      if (!shared) {
        window.open(whatsappLink(message), "_blank");
      }
      pushBot("Sua foto foi enviada para a Stefany. Ela responde em seguida. 💛");
      resetToMenu();
    } catch {
      pushBot("Não consegui enviar a foto agora. Tente novamente ou abra o WhatsApp direto.");
    } finally {
      setUploading(false);
    }
  };

  const resetToMenu = () => {
    setMode({ kind: "node", nodeId: "menu" });
    setTimeout(() => pushBot("Posso te ajudar em mais alguma coisa? Toque no menu abaixo."), 500);
  };

  const restart = () => {
    setMessages([]);
    setMode({ kind: "node", nodeId: "menu" });
  };

  const currentOptions: ChatOption[] =
    mode.kind === "node" ? chatNodes[mode.nodeId]?.options ?? [] : [];

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir assistente"
          className="fixed bottom-[calc(96px+env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-2 rounded-full bg-[color:var(--pink)] px-4 py-3 text-sm font-semibold text-[color:var(--navy)] shadow-2xl pink-glow md:bottom-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <MessageCircle className="h-5 w-5" />
          <span>Posso ajudar?</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 sm:p-4">
          <div className="flex h-[85dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-[600px] sm:max-w-md sm:rounded-3xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/5 bg-gradient-to-r from-[color:var(--pink)] to-[color:var(--gold)] px-4 py-3 text-[color:var(--navy)]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <div>
                  <p className="text-sm font-semibold leading-tight">Assistente da Stefany</p>
                  <p className="text-[10px] leading-tight opacity-80">Online agora</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={restart}
                  aria-label="Reiniciar"
                  className="rounded-full p-1.5 hover:bg-black/10"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Fechar"
                  className="rounded-full p-1.5 hover:bg-black/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto bg-[#F9F5F2] px-3 py-4"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "rounded-br-sm bg-[color:var(--pink)] text-[#061A33]"
                        : "rounded-bl-sm bg-white text-[#061A33]"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40" />
                  </div>
                </div>
              )}

              {/* Quiz result cards */}
              {mode.kind === "quiz-result" && (
                <div className="grid gap-2">
                  {mode.models.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => chooseModelFromQuiz(m)}
                      className="flex items-center gap-3 rounded-2xl bg-white p-2 text-left shadow-sm"
                    >
                      <img
                        src={m.imageUrl}
                        alt={m.title}
                        loading="lazy"
                        className="h-16 w-16 flex-none rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#061A33]">{m.title}</p>
                        <p className="truncate text-[11px] text-black/60">
                          {m.category} · {m.shape} · {m.mainColor}
                        </p>
                        <p className="mt-1 text-[10px] font-semibold uppercase text-[color:var(--pink)]">
                          Escolher este modelo
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions area */}
            <div className="border-t border-black/5 bg-white p-3">
              {mode.kind === "node" && (
                <div className="flex flex-wrap gap-1.5">
                  {currentOptions.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => handleOption(o)}
                      className="rounded-full border border-[color:var(--pink)]/40 bg-[color:var(--pink)]/10 px-3 py-1.5 text-xs font-medium text-[#061A33] hover:bg-[color:var(--pink)]/20"
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}

              {mode.kind === "quiz" && (
                <div className="flex flex-wrap gap-1.5">
                  {QUIZ_STEPS[mode.step].opts.map((v) => (
                    <button
                      key={v}
                      onClick={() => answerQuiz(v)}
                      className="rounded-full border border-[color:var(--pink)]/40 bg-[color:var(--pink)]/10 px-3 py-1.5 text-xs font-medium text-[#061A33] hover:bg-[color:var(--pink)]/20"
                    >
                      {v}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setMode({ kind: "node", nodeId: "menu" });
                      pushBot("Sem problemas — voltei ao menu.");
                    }}
                    className="rounded-full border border-black/10 px-3 py-1.5 text-xs text-black/60"
                  >
                    <ArrowLeft className="mr-1 inline h-3 w-3" /> Voltar
                  </button>
                </div>
              )}

              {mode.kind === "quiz-result" && (
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => navigate({ to: "/inspiracoes" })}
                    className="rounded-full border border-[color:var(--pink)]/40 bg-[color:var(--pink)]/10 px-3 py-1.5 text-xs font-medium text-[#061A33]"
                  >
                    Ver galeria completa
                  </button>
                  <button
                    onClick={resetToMenu}
                    className="rounded-full border border-black/10 px-3 py-1.5 text-xs text-black/60"
                  >
                    Voltar ao menu
                  </button>
                </div>
              )}

              {mode.kind === "upload-broken" && (
                <div className="flex flex-wrap items-center gap-2">
                  <label className={`inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white ${uploading ? "opacity-70" : "cursor-pointer"}`}>
                    {uploading ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enviando...</>
                    ) : (
                      <><Camera className="h-3.5 w-3.5" /> Tirar / escolher foto</>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      disabled={uploading}
                      className="hidden"
                      onChange={handleBrokenPhoto}
                    />
                  </label>
                  <button
                    onClick={resetToMenu}
                    className="rounded-full border border-black/10 px-3 py-1.5 text-xs text-black/60"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
