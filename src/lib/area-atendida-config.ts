// Config da área atendida — persistida em localStorage.
// Não expõe endereço residencial: usamos um ponto aproximado da região-base.

export type AreaAtendidaConfig = {
  cidade: string;
  lat: number;
  lng: number;
  raioKm: number;
  taxaPorKm?: number;
  observacao?: string;
  circuloAtivo: boolean;
};

const KEY = "stefany:area-atendida:v1";

export const DEFAULT_AREA_CONFIG: AreaAtendidaConfig = {
  cidade: "Bauru/SP",
  lat: -22.3145,
  lng: -49.0587,
  raioKm: 15,
  taxaPorKm: undefined,
  observacao:
    "A disponibilidade e eventuais taxas de deslocamento são confirmadas pelo WhatsApp.",
  circuloAtivo: true,
};

export function loadAreaConfig(): AreaAtendidaConfig {
  if (typeof window === "undefined") return DEFAULT_AREA_CONFIG;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_AREA_CONFIG;
    const parsed = JSON.parse(raw) as Partial<AreaAtendidaConfig>;
    return { ...DEFAULT_AREA_CONFIG, ...parsed };
  } catch {
    return DEFAULT_AREA_CONFIG;
  }
}

export function saveAreaConfig(cfg: AreaAtendidaConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(cfg));
}

// Haversine — distância aproximada em km
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
