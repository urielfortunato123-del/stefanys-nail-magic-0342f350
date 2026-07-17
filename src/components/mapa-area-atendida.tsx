// Mapa interativo Leaflet/OpenStreetMap — carregado somente no cliente.
// Este módulo importa Leaflet no topo. Deve ser usado apenas via React.lazy
// dentro de <ClientOnly>. Nunca importar estaticamente em rota SSR.
import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Circle,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair } from "lucide-react";
import type { AreaAtendidaConfig } from "@/lib/area-atendida-config";
import { haversineKm } from "@/lib/area-atendida-config";

// Corrige ícones padrão quebrados no build do Vite.
// Usamos ícones personalizados (SVG inline), mas mantemos o fallback.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const NAVY = "#0B1B3A";
const ROSE = "#D99682";

function svgPin(fill: string, stroke: string) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
      <path d="M17 1 C8 1 2 8 2 16 C2 27 17 43 17 43 C17 43 32 27 32 16 C32 8 26 1 17 1 Z"
        fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <circle cx="17" cy="16" r="5.5" fill="${stroke}"/>
    </svg>`;
}

const baseIcon = L.divIcon({
  className: "stefany-marker",
  html: svgPin(NAVY, ROSE),
  iconSize: [34, 44],
  iconAnchor: [17, 42],
  popupAnchor: [0, -36],
});

const clientIcon = L.divIcon({
  className: "stefany-marker",
  html: svgPin(ROSE, NAVY),
  iconSize: [30, 40],
  iconAnchor: [15, 38],
  popupAnchor: [0, -32],
});

function InvalidateOnMount() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 120);
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [map]);
  return null;
}

function LocateControl({
  onLocated,
  onError,
}: {
  onLocated: (p: { lat: number; lng: number }) => void;
  onError: (msg: string) => void;
}) {
  const map = useMap();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onFound = (e: L.LocationEvent) => {
      setBusy(false);
      onLocated({ lat: e.latlng.lat, lng: e.latlng.lng });
    };
    const onErr = () => {
      setBusy(false);
      onError(
        "Não foi possível acessar sua localização. Digite sua cidade ou bairro abaixo.",
      );
    };
    map.on("locationfound", onFound);
    map.on("locationerror", onErr);
    return () => {
      map.off("locationfound", onFound);
      map.off("locationerror", onErr);
    };
  }, [map, onLocated, onError]);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setBusy(true);
        map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
      }}
      className="absolute right-3 top-3 z-[500] flex items-center gap-1.5 rounded-full border border-[color:var(--pink)]/60 bg-[color:var(--navy)]/90 px-3 py-2 text-[11px] font-semibold text-white shadow-lg backdrop-blur hover:bg-[color:var(--navy-deep)]"
    >
      <Crosshair className="h-3.5 w-3.5" />
      {busy ? "Localizando…" : "Usar minha localização"}
    </button>
  );
}

export type MapaAreaAtendidaProps = {
  config: AreaAtendidaConfig;
  clientPos?: { lat: number; lng: number } | null;
  searchPos?: { lat: number; lng: number; label?: string } | null;
  onLocated?: (p: { lat: number; lng: number }) => void;
  onLocateError?: (msg: string) => void;
};

export default function MapaAreaAtendida({
  config,
  clientPos,
  searchPos,
  onLocated,
  onLocateError,
}: MapaAreaAtendidaProps) {
  const center = useMemo<[number, number]>(() => [config.lat, config.lng], [config.lat, config.lng]);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (searchPos) {
      mapRef.current.flyTo([searchPos.lat, searchPos.lng], 13, { duration: 0.8 });
    }
  }, [searchPos]);

  return (
    <div className="relative h-[360px] w-full sm:h-[420px]">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        className="h-full w-full"
        ref={(m) => {
          mapRef.current = m ?? null;
        }}
      >
        <InvalidateOnMount />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Ruas (OpenStreetMap)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Topográfico (OpenTopoMap)">
            <TileLayer
              attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Style &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              maxZoom={17}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Escuro (CARTO)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Área atendida">
            <Circle
              center={center}
              radius={config.raioKm * 1000}
              pathOptions={{
                color: ROSE,
                fillColor: ROSE,
                fillOpacity: 0.15,
                weight: 2,
                dashArray: "8 6",
              }}
            >
              <Popup>Área aproximada de atendimento da Stefany</Popup>
            </Circle>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Região-base">
            <Marker position={center} icon={baseIcon}>
              <Popup>Região-base de atendimento</Popup>
            </Marker>
          </LayersControl.Overlay>

          {clientPos && (
            <LayersControl.Overlay checked name="Minha localização">
              <Marker position={[clientPos.lat, clientPos.lng]} icon={clientIcon}>
                <Popup>
                  Você está aqui
                  <br />
                  Distância aprox.:{" "}
                  {haversineKm({ lat: center[0], lng: center[1] }, clientPos).toFixed(1)} km
                </Popup>
              </Marker>
            </LayersControl.Overlay>
          )}

          {searchPos && (
            <LayersControl.Overlay checked name="Resultado pesquisado">
              <Marker position={[searchPos.lat, searchPos.lng]} icon={clientIcon}>
                <Popup>
                  {searchPos.label ?? "Local pesquisado"}
                  <br />
                  Distância aprox.:{" "}
                  {haversineKm(
                    { lat: center[0], lng: center[1] },
                    { lat: searchPos.lat, lng: searchPos.lng },
                  ).toFixed(1)}{" "}
                  km
                </Popup>
              </Marker>
            </LayersControl.Overlay>
          )}
        </LayersControl>

        <LocateControl
          onLocated={(p) => onLocated?.(p)}
          onError={(m) => onLocateError?.(m)}
        />
      </MapContainer>
    </div>
  );
}
