import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface BookingState {
  // Cliente
  clientType: "existente" | "primeira" | null;
  name: string;
  phone: string;
  lastVisit?: string;
  birthDate?: string;
  discoveredVia?: string;
  referredBy?: string;

  // Serviço
  services: string[];
  otherService?: string;
  area: "Mãos" | "Pés" | "Mãos e pés" | null;
  nailsToMaintain?: string;
  brokenNails?: "Sim" | "Não" | "Não sei";
  needsRemoval?: "Sim" | "Não" | "Não sei";

  // Estilo
  size: string;
  shape: string;
  styles: string[];

  // Cor e referência
  colors: string[];
  frenchTip: "Sim" | "Não" | "Talvez" | "";
  decorations: string[];
  referenceImage?: string; // dataURL
  referenceImageName?: string;

  // Data
  date: string;
  period: string;
  time: string;

  // Local
  address: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    reference: string;
  };
  geo?: { lat: number; lng: number };
  addressConfirmed: boolean;

  // Observações
  allergies: "Sim" | "Não" | "";
  allergiesDetail: string;
  injuries: "Sim" | "Não" | "";
  injuriesDetail: string;
  hasBrokenNail: "Sim" | "Não" | "";
  notes: string;

  // Consentimento
  saveData: boolean;
  confirmed: boolean;
}

export const emptyState: BookingState = {
  clientType: null,
  name: "",
  phone: "",
  services: [],
  area: null,
  size: "",
  shape: "",
  styles: [],
  colors: [],
  frenchTip: "",
  decorations: [],
  date: "",
  period: "",
  time: "",
  address: { cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", reference: "" },
  addressConfirmed: false,
  allergies: "",
  allergiesDetail: "",
  injuries: "",
  injuriesDetail: "",
  hasBrokenNail: "",
  notes: "",
  saveData: false,
  confirmed: false,
};

const DRAFT_KEY = "stefany:booking-draft";
const SAVED_KEY = "stefany:saved-client";

interface Ctx {
  data: BookingState;
  update: (patch: Partial<BookingState>) => void;
  reset: () => void;
  loadSaved: () => void;
  clearSaved: () => void;
  hasSaved: boolean;
}

const BookingContext = createContext<Ctx | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<BookingState>(emptyState);
  const [hasSaved, setHasSaved] = useState(false);

  // Hidrata do localStorage após montar (evita mismatch SSR)
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) setData({ ...emptyState, ...JSON.parse(draft) });
      const saved = localStorage.getItem(SAVED_KEY);
      if (saved) {
        setHasSaved(true);
        if (!draft) {
          const s = JSON.parse(saved);
          setData((d) => ({ ...d, name: s.name || "", phone: s.phone || "", address: { ...d.address, ...(s.address || {}) } }));
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const update = useCallback((patch: Partial<BookingState>) => {
    setData((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setData(emptyState);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const loadSaved = useCallback(() => {
    try {
      const saved = localStorage.getItem(SAVED_KEY);
      if (saved) {
        const s = JSON.parse(saved);
        update({ name: s.name || "", phone: s.phone || "", address: { ...emptyState.address, ...(s.address || {}) } });
      }
    } catch {
      /* ignore */
    }
  }, [update]);

  const clearSaved = useCallback(() => {
    try {
      localStorage.removeItem(SAVED_KEY);
      setHasSaved(false);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ data, update, reset, loadSaved, clearSaved, hasSaved }), [data, update, reset, loadSaved, clearSaved, hasSaved]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}

export function persistSavedClient(data: BookingState) {
  try {
    localStorage.setItem(
      SAVED_KEY,
      JSON.stringify({ name: data.name, phone: data.phone, address: data.address }),
    );
  } catch {
    /* ignore */
  }
}
