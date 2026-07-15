import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, MapPin, Camera, X, MessageCircle, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useBooking, persistSavedClient } from "@/lib/booking-context";
import { services } from "@/data/services";
import { availableTimes, periods } from "@/data/availableTimes";
import { businessConfig, whatsappLink } from "@/config/business";
import { buildWhatsAppMessage } from "@/lib/whatsapp";
import { uploadReferenceImage } from "@/lib/upload-reference";

export const Route = createFileRoute("/agendar")({
  head: () => ({
    meta: [
      { title: "Agendar atendimento — Stefany Próspero" },
      { name: "description", content: "Preencha os dados do seu atendimento em domicílio e envie para a Stefany pelo WhatsApp." },
    ],
  }),
  component: AgendarPage,
});

const STEPS = [
  "Tipo de cliente",
  "Seus dados",
  "Serviço",
  "Área",
  "Estilo",
  "Cor e referência",
  "Data e horário",
  "Localização",
  "Observações",
  "Resumo",
];

function AgendarPage() {
  const [step, setStep] = useState(0);
  const { data, update, hasSaved, loadSaved } = useBooking();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const validate = (s: number): string | null => {
    switch (s) {
      case 0: return data.clientType ? null : "Selecione uma opção para continuar.";
      case 1:
        if (!data.name.trim()) return "Informe seu nome para continuar.";
        if (!data.phone.trim()) return "Informe seu telefone.";
        if (data.clientType === "primeira" && !data.discoveredVia) return "Conte como você conheceu a Stefany.";
        if (data.discoveredVia === "Indicação" && !data.referredBy?.trim()) return "Quem indicou você?";
        return null;
      case 2: return data.services.length ? (data.services.includes("outro") && !data.otherService?.trim() ? "Descreva o serviço 'Outro'." : null) : "Escolha pelo menos um serviço.";
      case 3: return data.area ? null : "Escolha a área do atendimento.";
      case 4: return data.styles.length && data.size && data.shape ? null : "Preencha tamanho, formato e estilo.";
      case 5: return data.colors.length ? null : "Escolha pelo menos uma cor.";
      case 6: return data.date && data.period && data.time ? null : "Escolha data, período e horário.";
      case 7:
        if (!data.geo && !data.address.street.trim()) return "Informe o endereço ou compartilhe sua localização.";
        if (!data.addressConfirmed) return "Confirme que este é o endereço do atendimento.";
        return null;
      case 8: return null;
      case 9: return data.confirmed ? null : "Confirme que as informações estão corretas.";
      default: return null;
    }
  };

  const next = () => {
    const err = validate(step);
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prev = () => {
    setError(null);
    if (step === 0) { navigate({ to: "/" }); return; }
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goto = (s: number) => { setError(null); setStep(s); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const progress = ((step + 1) / STEPS.length) * 100;

  const send = () => {
    const err = validate(9);
    if (err) { setError(err); return; }
    if (data.saveData) persistSavedClient(data);
    const message = buildWhatsAppMessage(data);
    window.open(whatsappLink(message), "_blank");
    navigate({ to: "/agendar/sucesso" });
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-white/60">Etapa {step + 1} de {STEPS.length}</span>
          <span className="font-medium text-[color:var(--pink)]">{STEPS[step]}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-[color:var(--pink)] to-[color:var(--gold)] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="glass-card min-h-[300px] rounded-3xl p-5">
        {step === 0 && <StepClientType data={data} update={update} hasSaved={hasSaved} loadSaved={loadSaved} />}
        {step === 1 && <StepData data={data} update={update} />}
        {step === 2 && <StepServices data={data} update={update} />}
        {step === 3 && <StepArea data={data} update={update} />}
        {step === 4 && <StepStyle data={data} update={update} />}
        {step === 5 && <StepColors data={data} update={update} />}
        {step === 6 && <StepDate data={data} update={update} />}
        {step === 7 && <StepLocation data={data} update={update} />}
        {step === 8 && <StepNotes data={data} update={update} />}
        {step === 9 && <StepSummary data={data} update={update} goto={goto} />}
      </div>

      {error && (
        <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="sticky bottom-24 z-30 flex gap-2 md:bottom-4">
        <button onClick={prev} className="flex items-center gap-1.5 rounded-full border border-white/20 bg-[color:var(--navy)]/80 px-5 py-3 text-sm font-medium text-white backdrop-blur">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={next} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[color:var(--pink)] px-5 py-3 text-sm font-semibold text-[color:var(--navy)] pink-glow">
            Continuar <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={send} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[color:var(--pink)] px-5 py-3 text-sm font-semibold text-[color:var(--navy)] pink-glow">
            <MessageCircle className="h-4 w-4" /> Enviar para o WhatsApp
          </button>
        )}
      </div>
    </div>
  );
}

/* ============ STEPS ============ */

type StepProps = { data: ReturnType<typeof useBooking>["data"]; update: ReturnType<typeof useBooking>["update"] };

function SectionTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-2xl leading-tight text-white">{children}</h2>
      {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
    </div>
  );
}

function OptionCard({ selected, onClick, children, className = "" }: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
        selected ? "border-[color:var(--pink)] bg-[color:var(--pink)]/10 pink-glow" : "border-white/10 bg-white/[0.02] hover:bg-white/5"
      } ${className}`}
    >
      {children}
      {selected && <Check className="absolute right-3 top-3 h-4 w-4 text-[color:var(--pink)]" />}
    </button>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-white/70">{label}{required && <span className="ml-0.5 text-[color:var(--pink)]">*</span>}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-[color:var(--pink)] focus:bg-white/[0.07]";

function StepClientType({ data, update, hasSaved, loadSaved }: StepProps & { hasSaved: boolean; loadSaved: () => void }) {
  return (
    <div>
      <SectionTitle subtitle="Isso ajuda a Stefany a preparar seu atendimento.">Você já é cliente?</SectionTitle>
      <div className="grid gap-3">
        <OptionCard selected={data.clientType === "existente"} onClick={() => update({ clientType: "existente" })}>
          <div className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--pink)]/20 text-xl">💖</div>
          <div>
            <p className="font-semibold text-white">Sou cliente</p>
            <p className="text-xs text-white/60">Já fiz atendimento com a Stefany.</p>
          </div>
        </OptionCard>
        <OptionCard selected={data.clientType === "primeira"} onClick={() => update({ clientType: "primeira" })}>
          <div className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--gold)]/20 text-xl">✨</div>
          <div>
            <p className="font-semibold text-white">Primeira vez</p>
            <p className="text-xs text-white/60">Será meu primeiro atendimento.</p>
          </div>
        </OptionCard>
      </div>
      {hasSaved && (
        <button onClick={loadSaved} className="mt-4 w-full rounded-xl border border-white/10 py-2.5 text-xs text-white/70 hover:bg-white/5">
          Usar meus dados salvos
        </button>
      )}
    </div>
  );
}

function StepData({ data, update }: StepProps) {
  const origins = ["Instagram", "Indicação", "WhatsApp", "Google", "Outro"];
  return (
    <div>
      <SectionTitle subtitle="Precisamos apenas do essencial para contato.">Seus dados</SectionTitle>
      <div className="space-y-3">
        <Field label="Nome completo" required>
          <input className={inputCls} value={data.name} onChange={(e) => update({ name: e.target.value })} placeholder="Como podemos te chamar?" />
        </Field>
        <Field label="Telefone (WhatsApp)" required>
          <input className={inputCls} value={data.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="(11) 90000-0000" inputMode="tel" />
        </Field>
        {data.clientType === "existente" ? (
          <Field label="Data do último atendimento (opcional)">
            <input type="date" className={inputCls} value={data.lastVisit || ""} onChange={(e) => update({ lastVisit: e.target.value })} />
          </Field>
        ) : (
          <>
            <Field label="Data de nascimento (opcional)">
              <input type="date" className={inputCls} value={data.birthDate || ""} onChange={(e) => update({ birthDate: e.target.value })} />
            </Field>
            <Field label="Como você conheceu a Stefany?" required>
              <div className="grid grid-cols-2 gap-2">
                {origins.map((o) => (
                  <OptionCard key={o} selected={data.discoveredVia === o} onClick={() => update({ discoveredVia: o })}>
                    <span className="text-sm font-medium">{o}</span>
                  </OptionCard>
                ))}
              </div>
            </Field>
            {data.discoveredVia === "Indicação" && (
              <Field label="Quem indicou você?" required>
                <input className={inputCls} value={data.referredBy || ""} onChange={(e) => update({ referredBy: e.target.value })} placeholder="Nome da pessoa" />
              </Field>
            )}
          </>
        )}
        <label className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-white/70">
          <input type="checkbox" checked={data.saveData} onChange={(e) => update({ saveData: e.target.checked })} className="mt-0.5 accent-[color:var(--pink)]" />
          <span>Salvar meus dados neste celular para o próximo agendamento (nome, telefone e endereço).</span>
        </label>
      </div>
    </div>
  );
}

function StepServices({ data, update }: StepProps) {
  const toggle = (id: string) => {
    const set = new Set(data.services);
    set.has(id) ? set.delete(id) : set.add(id);
    update({ services: Array.from(set) });
  };
  return (
    <div>
      <SectionTitle subtitle="Selecione um ou mais serviços.">Qual serviço você deseja?</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {services.map((s) => (
          <OptionCard key={s.id} selected={data.services.includes(s.id)} onClick={() => toggle(s.id)}>
            <div>
              <p className="text-sm font-semibold text-white">{s.name}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-white/60">{s.description}</p>
            </div>
          </OptionCard>
        ))}
      </div>
      {data.services.includes("outro") && (
        <div className="mt-3">
          <Field label="Descreva o serviço" required>
            <input className={inputCls} value={data.otherService || ""} onChange={(e) => update({ otherService: e.target.value })} placeholder="Ex.: encapsulada com flores" />
          </Field>
        </div>
      )}
    </div>
  );
}

function StepArea({ data, update }: StepProps) {
  const opts = ["Mãos", "Pés", "Mãos e pés"] as const;
  const needsMaint = data.services.some((s) => ["manutencao", "alongamento"].includes(s));
  return (
    <div>
      <SectionTitle>Em qual área será o atendimento?</SectionTitle>
      <div className="grid gap-2">
        {opts.map((o) => (
          <OptionCard key={o} selected={data.area === o} onClick={() => update({ area: o })}>
            <span className="text-sm font-medium">{o}</span>
          </OptionCard>
        ))}
      </div>
      {needsMaint && (
        <div className="mt-5 space-y-3">
          <Field label="Quantas unhas precisam de manutenção?">
            <input className={inputCls} value={data.nailsToMaintain || ""} onChange={(e) => update({ nailsToMaintain: e.target.value })} placeholder="Ex.: 3" inputMode="numeric" />
          </Field>
          <Field label="Existe alguma unha quebrada?">
            <div className="grid grid-cols-3 gap-2">
              {(["Sim", "Não", "Não sei"] as const).map((v) => (
                <OptionCard key={v} selected={data.brokenNails === v} onClick={() => update({ brokenNails: v })}><span className="mx-auto text-sm">{v}</span></OptionCard>
              ))}
            </div>
          </Field>
          <Field label="Precisa de remoção anterior?">
            <div className="grid grid-cols-3 gap-2">
              {(["Sim", "Não", "Não sei"] as const).map((v) => (
                <OptionCard key={v} selected={data.needsRemoval === v} onClick={() => update({ needsRemoval: v })}><span className="mx-auto text-sm">{v}</span></OptionCard>
              ))}
            </div>
          </Field>
        </div>
      )}
    </div>
  );
}

function StepStyle({ data, update }: StepProps) {
  const sizes = ["Curta", "Média", "Longa", "Extra longa", "Ainda não decidi"];
  const shapes = ["Quadrada", "Bailarina", "Almond", "Stiletto", "Oval", "Redonda", "Squoval", "Ainda não decidi"];
  const styles = ["Delicada", "Francesinha", "Colorida", "Glitter", "Encapsulada", "Premium", "Artística", "Minimalista", "Temática", "Ainda não decidi"];
  const toggleStyle = (s: string) => {
    const set = new Set(data.styles);
    set.has(s) ? set.delete(s) : set.add(s);
    update({ styles: Array.from(set) });
  };
  return (
    <div>
      <SectionTitle subtitle="Tamanho, formato e o estilo que combina com você.">Estilo</SectionTitle>
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">Tamanho</p>
          <div className="grid grid-cols-2 gap-2">
            {sizes.map((s) => (
              <OptionCard key={s} selected={data.size === s} onClick={() => update({ size: s })}><span className="text-sm">{s}</span></OptionCard>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">Formato</p>
          <div className="grid grid-cols-2 gap-2">
            {shapes.map((s) => (
              <OptionCard key={s} selected={data.shape === s} onClick={() => update({ shape: s })}><span className="text-sm">{s}</span></OptionCard>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">Estilo (pode escolher mais de um)</p>
          <div className="flex flex-wrap gap-2">
            {styles.map((s) => {
              const on = data.styles.includes(s);
              return (
                <button key={s} type="button" onClick={() => toggleStyle(s)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${on ? "border-[color:var(--pink)] bg-[color:var(--pink)] text-[color:var(--navy)]" : "border-white/15 bg-white/[0.03] text-white/80"}`}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const COLORS: { name: string; hex: string }[] = [
  { name: "Rosa claro", hex: "#F5B6C8" },
  { name: "Rosa pink", hex: "#E83E8C" },
  { name: "Nude", hex: "#D8B4A0" },
  { name: "Branco", hex: "#FFFFFF" },
  { name: "Preto", hex: "#111111" },
  { name: "Vermelho", hex: "#B91C3C" },
  { name: "Azul claro", hex: "#7DD3FC" },
  { name: "Azul", hex: "#2563EB" },
  { name: "Roxo", hex: "#8B5CF6" },
  { name: "Verde", hex: "#22C55E" },
  { name: "Dourado", hex: "#D4AF37" },
  { name: "Prata", hex: "#C0C0C0" },
];

const EXTRA_COLOR_OPTS = ["Outra cor", "Ainda não decidi"];

function StepColors({ data, update }: StepProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const toggleColor = (c: string) => {
    const set = new Set(data.colors);
    set.has(c) ? set.delete(c) : set.add(c);
    update({ colors: Array.from(set) });
  };
  const toggleDeco = (c: string) => {
    const set = new Set(data.decorations);
    set.has(c) ? set.delete(c) : set.add(c);
    update({ decorations: Array.from(set) });
  };

  const removePhoto = () => {
    update({
      referenceImage: undefined,
      referenceImageName: undefined,
      referenceImageUrl: undefined,
      referenceImagePath: undefined,
    });
    setUploadError(null);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite re-selecionar o mesmo arquivo
    if (!file) return;
    if (!data.referenceImageConsent) {
      setUploadError("Marque o consentimento para poder enviar a foto.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadError("A foto está muito grande (limite 15 MB).");
      return;
    }
    setUploadError(null);
    // Prévia local
    const reader = new FileReader();
    reader.onload = () =>
      update({ referenceImage: reader.result as string, referenceImageName: file.name });
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const { path, signedUrl } = await uploadReferenceImage(file);
      update({ referenceImagePath: path, referenceImageUrl: signedUrl });
    } catch (err) {
      console.error(err);
      setUploadError(
        "Não foi possível preparar a foto. Tente novamente ou envie diretamente pelo WhatsApp.",
      );
      update({ referenceImageUrl: undefined, referenceImagePath: undefined });
    } finally {
      setUploading(false);
    }
  };
  return (
    <div>
      <SectionTitle subtitle="Escolha as cores e detalhes que você quer.">Cor e referência</SectionTitle>
      <div className="space-y-5">
        {data.referenceModel && (
          <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--pink)]/30 bg-[color:var(--pink)]/10 p-3">
            <img src={data.referenceModel.imageUrl} alt={data.referenceModel.title} className="h-14 w-14 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-widest text-[color:var(--pink)]">Modelo escolhido</p>
              <p className="truncate text-sm font-semibold text-white">{data.referenceModel.title}</p>
            </div>
            <button type="button" onClick={() => update({ referenceModel: undefined })} className="text-xs text-white/60">Remover</button>
          </div>
        )}

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/50">Cores (pode escolher mais de uma)</p>
          <div className="grid grid-cols-6 gap-3">
            {COLORS.map((c) => {
              const on = data.colors.includes(c.name);
              const lightBg = ["#FFFFFF", "#F5B6C8", "#7DD3FC", "#D8B4A0", "#C0C0C0", "#D4AF37"].includes(c.hex);
              return (
                <button
                  key={c.name}
                  type="button"
                  aria-label={c.name}
                  title={c.name}
                  onClick={() => toggleColor(c.name)}
                  style={{ backgroundColor: c.hex }}
                  className={`relative h-11 w-11 rounded-full border-2 transition-transform active:scale-95 ${
                    on ? "border-[#F7A8BD] ring-2 ring-[#F7A8BD]/40" : "border-white/20"
                  }`}
                >
                  {on && <Check className={`absolute inset-0 m-auto h-5 w-5 ${lightBg ? "text-[#061A33]" : "text-white"}`} />}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {EXTRA_COLOR_OPTS.map((v) => {
              const on = data.colors.includes(v);
              return (
                <button key={v} type="button" onClick={() => toggleColor(v)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${on ? "border-[color:var(--pink)] bg-[color:var(--pink)] text-[color:var(--navy)]" : "border-white/15 bg-white/5 text-white/80"}`}>
                  {v}
                </button>
              );
            })}
          </div>
          {data.colors.length > 0 && (
            <p className="mt-3 text-xs text-white/60">Cores escolhidas: <span className="text-white">{data.colors.join(", ")}</span></p>
          )}
        </div>

        <Field label="Deseja francesinha?">
          <div className="grid grid-cols-3 gap-2">
            {(["Sim", "Não", "Talvez"] as const).map((v) => (
              <OptionCard key={v} selected={data.frenchTip === v} onClick={() => update({ frenchTip: v })}><span className="mx-auto text-sm">{v}</span></OptionCard>
            ))}
          </div>
        </Field>

        <Field label="Deseja glitter, pedraria ou decoração?">
          <div className="grid grid-cols-3 gap-2">
            {["Glitter", "Pedraria", "Adesivo", "Desenho à mão", "Encapsulada", "Nenhum"].map((v) => (
              <OptionCard key={v} selected={data.decorations.includes(v)} onClick={() => toggleDeco(v)}><span className="mx-auto text-xs">{v}</span></OptionCard>
            ))}
          </div>
        </Field>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">Foto de inspiração</p>
          {data.referenceImage ? (
            <div className="relative">
              <img src={data.referenceImage} alt="Referência" className="max-h-64 w-full rounded-2xl object-cover" />
              <button onClick={() => update({ referenceImage: undefined, referenceImageName: undefined })} aria-label="Remover" className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-6 text-center hover:bg-white/5">
              <Camera className="h-6 w-6 text-[color:var(--pink)]" />
              <span className="text-sm text-white">Envie uma foto de inspiração</span>
              <span className="text-xs text-white/50">Abrir câmera ou galeria</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
            </label>
          )}
          <p className="mt-2 text-[11px] text-[color:var(--gold)]">
            <Sparkles className="mr-1 inline h-3 w-3" />
            Após abrir o WhatsApp, envie também a foto de referência selecionada.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepDate({ data, update }: StepProps) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div>
      <SectionTitle subtitle="O horário será confirmado pela Stefany no WhatsApp.">Data e horário</SectionTitle>
      <div className="space-y-4">
        <Field label="Data desejada" required>
          <input type="date" min={today} className={inputCls} value={data.date} onChange={(e) => update({ date: e.target.value })} />
        </Field>
        <Field label="Período" required>
          <div className="grid grid-cols-3 gap-2">
            {periods.map((p) => (
              <OptionCard key={p} selected={data.period === p} onClick={() => update({ period: p })}><span className="mx-auto text-sm">{p}</span></OptionCard>
            ))}
          </div>
        </Field>
        <Field label="Horário preferido" required>
          <div className="grid grid-cols-4 gap-2">
            {availableTimes.map((t) => (
              <OptionCard key={t} selected={data.time === t} onClick={() => update({ time: t })}><span className="mx-auto text-sm">{t}</span></OptionCard>
            ))}
          </div>
        </Field>
        <p className="rounded-xl border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/10 px-3 py-2 text-xs text-[color:var(--gold)]">
          O horário não é confirmado automaticamente. A Stefany confirmará disponibilidade pelo WhatsApp.
        </p>
      </div>
    </div>
  );
}

function StepLocation({ data, update }: StepProps) {
  const [loading, setLoading] = useState(false);
  const useGeo = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { update({ geo: { lat: pos.coords.latitude, lng: pos.coords.longitude } }); setLoading(false); },
      () => setLoading(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };
  const setAddr = (patch: Partial<typeof data.address>) => update({ address: { ...data.address, ...patch } });
  return (
    <div>
      <SectionTitle subtitle="Atendimento em domicílio — nos diga onde te encontrar.">Onde será o atendimento?</SectionTitle>
      <button onClick={useGeo} disabled={loading} className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--pink)]/15 py-3 text-sm font-semibold text-[color:var(--pink)]">
        <MapPin className="h-4 w-4" />
        {loading ? "Obtendo localização…" : data.geo ? "Localização capturada ✓ — atualizar" : "Usar minha localização atual"}
      </button>
      {data.geo && (
        <a href={`https://www.google.com/maps?q=${data.geo.lat},${data.geo.lng}`} target="_blank" rel="noreferrer" className="mb-4 block truncate text-center text-xs text-[color:var(--gold)] underline">
          Ver no Google Maps
        </a>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="CEP"><input className={inputCls} value={data.address.cep} onChange={(e) => setAddr({ cep: e.target.value })} placeholder="00000-000" /></Field>
        <Field label="Número"><input className={inputCls} value={data.address.number} onChange={(e) => setAddr({ number: e.target.value })} /></Field>
        <div className="col-span-2"><Field label="Rua"><input className={inputCls} value={data.address.street} onChange={(e) => setAddr({ street: e.target.value })} /></Field></div>
        <div className="col-span-2"><Field label="Complemento"><input className={inputCls} value={data.address.complement} onChange={(e) => setAddr({ complement: e.target.value })} placeholder="Apto, bloco…" /></Field></div>
        <Field label="Bairro"><input className={inputCls} value={data.address.neighborhood} onChange={(e) => setAddr({ neighborhood: e.target.value })} /></Field>
        <Field label="Cidade"><input className={inputCls} value={data.address.city} onChange={(e) => setAddr({ city: e.target.value })} /></Field>
        <Field label="Estado"><input className={inputCls} value={data.address.state} onChange={(e) => setAddr({ state: e.target.value })} placeholder="SP" /></Field>
        <div className="col-span-2"><Field label="Ponto de referência"><input className={inputCls} value={data.address.reference} onChange={(e) => setAddr({ reference: e.target.value })} placeholder="Ex.: próximo à padaria" /></Field></div>
      </div>
      <label className="mt-4 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-white/80">
        <input type="checkbox" checked={data.addressConfirmed} onChange={(e) => update({ addressConfirmed: e.target.checked })} className="mt-0.5 accent-[color:var(--pink)]" />
        <span>Este é o endereço onde desejo ser atendida.</span>
      </label>
    </div>
  );
}

function StepNotes({ data, update }: StepProps) {
  return (
    <div>
      <SectionTitle subtitle="Nos conte tudo o que for importante para o atendimento.">Observações importantes</SectionTitle>
      <div className="space-y-4">
        <Field label="Você possui alguma alergia?">
          <div className="grid grid-cols-2 gap-2">
            {(["Não", "Sim"] as const).map((v) => (
              <OptionCard key={v} selected={data.allergies === v} onClick={() => update({ allergies: v })}><span className="mx-auto text-sm">{v}</span></OptionCard>
            ))}
          </div>
          {data.allergies === "Sim" && (
            <textarea className={`${inputCls} mt-2 min-h-[70px]`} value={data.allergiesDetail} onChange={(e) => update({ allergiesDetail: e.target.value })} placeholder="Descreva sua alergia" />
          )}
        </Field>
        <Field label="Machucado, inflamação ou sensibilidade?">
          <div className="grid grid-cols-2 gap-2">
            {(["Não", "Sim"] as const).map((v) => (
              <OptionCard key={v} selected={data.injuries === v} onClick={() => update({ injuries: v })}><span className="mx-auto text-sm">{v}</span></OptionCard>
            ))}
          </div>
          {data.injuries === "Sim" && (
            <textarea className={`${inputCls} mt-2 min-h-[70px]`} value={data.injuriesDetail} onChange={(e) => update({ injuriesDetail: e.target.value })} placeholder="Descreva" />
          )}
        </Field>
        <Field label="Há alguma unha quebrada ou danificada?">
          <div className="grid grid-cols-2 gap-2">
            {(["Não", "Sim"] as const).map((v) => (
              <OptionCard key={v} selected={data.hasBrokenNail === v} onClick={() => update({ hasBrokenNail: v })}><span className="mx-auto text-sm">{v}</span></OptionCard>
            ))}
          </div>
        </Field>
        <Field label="Observações gerais">
          <textarea className={`${inputCls} min-h-[90px]`} value={data.notes} onChange={(e) => update({ notes: e.target.value })}
            placeholder="Quero uma decoração delicada. / Tenho alergia a determinado produto. / Uma das unhas está quebrada. / Gostaria de algo parecido com a foto." />
        </Field>
      </div>
    </div>
  );
}

function StepSummary({ data, update, goto }: StepProps & { goto: (s: number) => void }) {
  const rows = useMemo(() => {
    const nameOf = (id: string) => services.find((s) => s.id === id)?.name ?? id;
    const addr = data.address;
    const enderecoTxt = [addr.street && `${addr.street}, ${addr.number || "s/n"}`, addr.neighborhood, addr.city, addr.state].filter(Boolean).join(" · ");
    return [
      { step: 0, label: "Tipo de cliente", value: data.clientType === "existente" ? "Cliente atual" : "Primeira vez" },
      { step: 1, label: "Nome", value: data.name },
      { step: 1, label: "Telefone", value: data.phone },
      { step: 2, label: "Serviços", value: data.services.map(nameOf).join(", ") + (data.otherService ? ` (Outro: ${data.otherService})` : "") },
      { step: 3, label: "Área", value: data.area || "-" },
      { step: 4, label: "Tamanho / Formato", value: `${data.size} · ${data.shape}` },
      { step: 4, label: "Estilo", value: data.styles.join(", ") },
      { step: 5, label: "Cores", value: data.colors.join(", ") },
      { step: 5, label: "Francesinha", value: data.frenchTip || "-" },
      { step: 5, label: "Decoração", value: data.decorations.join(", ") || "-" },
      { step: 5, label: "Foto de referência", value: data.referenceImage ? "Sim" : "Não" },
      { step: 6, label: "Data", value: `${data.date} · ${data.period} · ${data.time}` },
      { step: 7, label: "Endereço", value: enderecoTxt || "-" },
      { step: 7, label: "Localização", value: data.geo ? `${data.geo.lat.toFixed(5)}, ${data.geo.lng.toFixed(5)}` : "-" },
      { step: 8, label: "Alergias", value: data.allergies === "Sim" ? `Sim — ${data.allergiesDetail}` : data.allergies || "-" },
      { step: 8, label: "Observações", value: data.notes || "-" },
    ];
  }, [data]);

  return (
    <div>
      <SectionTitle subtitle="Revise antes de enviar. Você pode editar qualquer seção.">Confira seu agendamento</SectionTitle>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider text-white/40">{r.label}</p>
              <p className="mt-0.5 break-words text-sm text-white">{r.value || "-"}</p>
            </div>
            <button onClick={() => goto(r.step)} className="text-xs text-[color:var(--pink)] hover:underline">Editar</button>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        <p className="rounded-xl border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/10 p-3 text-xs text-[color:var(--gold)]">
          O envio não confirma automaticamente o horário. A Stefany responderá pelo WhatsApp para confirmar disponibilidade, valor e deslocamento.
        </p>
        <label className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-white">
          <input type="checkbox" checked={data.confirmed} onChange={(e) => update({ confirmed: e.target.checked })} className="mt-0.5 accent-[color:var(--pink)]" />
          <span>Confirmo que as informações estão corretas.</span>
        </label>
        <p className="text-center text-xs text-white/50">
          Será enviado para o WhatsApp <span className="font-medium text-white">{businessConfig.whatsappNumber}</span>
        </p>
      </div>
    </div>
  );
}
