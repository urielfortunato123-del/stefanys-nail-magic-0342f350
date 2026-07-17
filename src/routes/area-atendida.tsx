import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { MapPin, Loader2, Search, WifiOff } from "lucide-react";
import {
  DEFAULT_AREA_CONFIG,
  haversineKm,
  loadAreaConfig,
  type AreaAtendidaConfig,
} from "@/lib/area-atendida-config";
import { whatsappLink } from "@/config/business";

const MapaAreaAtendida = lazy(() => import("@/components/mapa-area-atendida"));

export const Route = createFileRoute("/area-atendida")({
  head: () => ({
    meta: [
      { title: "Área atendida — Stefany Próspero" },
      {
        name: "description",
        content:
          "Mapa interativo da região-base de atendimento em domicílio da Stefany. Consulte sua cidade ou bairro.",
      },
    ],
  }),
  component: Area,
});

type SearchPos = { lat: number; lng: number; label?: string } | null;
type ClientPos = { lat: number; lng: number } | null;

// Cache local simples para respeitar o Nominatim (1 req/s, baixo volume).
const searchCache = new Map<string, { lat: number; lng: number; label: string } | null>();
let lastNominatimAt = 0;

async function geocode(q: string) {
  const key = q.trim().toLowerCase();
  if (!key) return null;
  if (searchCache.has(key)) return searchCache.get(key) ?? null;

  const wait = Math.max(0, 1100 - (Date.now() - lastNominatimAt));
  if (wait) await new Promise((r) => setTimeout(r, wait));
  lastNominatimAt = Date.now();

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "br");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("q", q);

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Falha na busca");
  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;
  const first = data[0];
  const hit = first
    ? { lat: parseFloat(first.lat), lng: parseFloat(first.lon), label: first.display_name }
    : null;
  searchCache.set(key, hit);
  return hit;
}

function Area() {
  const [city, setCity] = useState("");
  const [config, setConfig] = useState<AreaAtendidaConfig>(DEFAULT_AREA_CONFIG);
  const [searchPos, setSearchPos] = useState<SearchPos>(null);
  const [clientPos, setClientPos] = useState<ClientPos>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const inflight = useRef(false);

  useEffect(() => {
    setConfig(loadAreaConfig());
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const activePos = searchPos ?? clientPos;
  const distanciaKm = activePos
    ? haversineKm({ lat: config.lat, lng: config.lng }, activePos)
    : null;
  const dentro = distanciaKm !== null ? distanciaKm <= config.raioKm : null;

  async function onConsult(e: React.FormEvent) {
    e.preventDefault();
    if (inflight.current) return;
    setErrorMsg(null);
    setStatusMsg(null);
    if (!city.trim()) {
      setErrorMsg("Digite uma cidade ou bairro.");
      return;
    }
    inflight.current = true;
    setLoading(true);
    try {
      const hit = await geocode(city);
      if (!hit) {
        setSearchPos(null);
        setErrorMsg("Não encontramos essa localização. Tente outro nome.");
      } else {
        setSearchPos(hit);
      }
    } catch {
      setErrorMsg("Falha ao consultar o mapa. Tente novamente em instantes.");
    } finally {
      setLoading(false);
      inflight.current = false;
    }
  }

  function buildWhats() {
    const situacao =
      dentro === null
        ? "não informada"
        : dentro
          ? "dentro da área principal"
          : "fora da área principal";
    const dist = distanciaKm !== null ? `${distanciaKm.toFixed(1)} km` : "-";
    const local = searchPos?.label ?? city ?? "-";
    let msg = `Olá, Stefany! Gostaria de confirmar atendimento em domicílio.\n\nLocal informado: ${local}\nDistância aproximada: ${dist}\nSituação no mapa: ${situacao}\n\nVocê atende nessa região?`;
    if (clientPos) {
      const link = `https://www.openstreetmap.org/?mlat=${clientPos.lat}&mlon=${clientPos.lng}#map=16/${clientPos.lat}/${clientPos.lng}`;
      msg += `\n\nMinha localização: ${link}`;
    }
    return whatsappLink(msg);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--pink)]">
          Cobertura
        </p>
        <h1 className="font-display text-3xl text-white">Área atendida</h1>
        <p className="mt-1 text-sm text-white/70">
          A Stefany realiza atendimento em domicílio. A disponibilidade e possíveis taxas de
          deslocamento dependem da localização.
        </p>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl shadow-xl"
        style={{ border: "1px solid rgba(217, 150, 130, 0.55)" }}
      >
        {online ? (
          <ClientOnly
            fallback={
              <div className="grid h-[360px] w-full place-items-center bg-[color:var(--navy-deep)] text-white/50 sm:h-[420px]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="grid h-[360px] w-full place-items-center bg-[color:var(--navy-deep)] text-white/50 sm:h-[420px]">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              }
            >
              <MapaAreaAtendida
                config={config}
                clientPos={clientPos}
                searchPos={searchPos}
                onLocated={(p) => {
                  setClientPos(p);
                  setErrorMsg(null);
                }}
                onLocateError={(m) => setErrorMsg(m)}
              />
            </Suspense>
          </ClientOnly>
        ) : (
          <div className="flex h-[360px] w-full flex-col items-center justify-center gap-2 bg-[color:var(--navy-deep)] text-white/70 sm:h-[420px]">
            <WifiOff className="h-8 w-8" />
            <p className="text-sm">O mapa precisa de conexão com a internet.</p>
          </div>
        )}
      </div>

      <p className="text-xs text-white/60">
        {config.observacao ??
          "A disponibilidade e eventuais taxas de deslocamento são confirmadas pelo WhatsApp."}
      </p>

      <form onSubmit={onConsult} className="glass-card space-y-3 rounded-2xl p-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-white/70">
            Sua cidade ou bairro
          </span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ex.: Jardim Bela Vista, Bauru"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[color:var(--pink)]"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--pink)] py-3 text-sm font-semibold text-[color:var(--navy)] pink-glow disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Consultar atendimento
        </button>
        {errorMsg && <p className="text-sm text-red-300">{errorMsg}</p>}
        {statusMsg && <p className="text-sm text-white/70">{statusMsg}</p>}
      </form>

      {activePos && distanciaKm !== null && (
        <div className="glass-card space-y-3 rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 text-[color:var(--pink)]" />
            <div className="text-sm text-white/80">
              {dentro ? (
                <>
                  <p className="font-semibold text-white">
                    Esta localização está dentro da área aproximada de atendimento.
                  </p>
                  <p className="text-xs text-white/60">
                    Distância aproximada: {distanciaKm.toFixed(1)} km. A confirmação final é
                    feita pela Stefany.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-white">
                    Essa localização está fora da área principal, mas a Stefany poderá avaliar
                    o atendimento e a taxa de deslocamento.
                  </p>
                  <p className="text-xs text-white/60">
                    Distância aproximada: {distanciaKm.toFixed(1)} km.
                  </p>
                </>
              )}
            </div>
          </div>
          <a
            href={buildWhats()}
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-full bg-[color:var(--pink)] py-3 text-center text-sm font-semibold text-[color:var(--navy)] pink-glow"
          >
            {dentro ? "Confirmar com a Stefany" : "Consultar pelo WhatsApp"}
          </a>
        </div>
      )}
    </div>
  );
}
