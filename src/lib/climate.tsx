"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Zone = "nord" | "tempere" | "sud";

/** Décalage en mois appliqué aux dates de référence (France tempérée). */
export const ZONE_OFFSET: Record<Zone, number> = {
  nord: 1, // climat plus froid : on sème / récolte plus tard
  tempere: 0,
  sud: -1, // climat plus doux : on peut démarrer plus tôt
};

export const ZONE_LABELS: Record<Zone, string> = {
  nord: "Nord / altitude",
  tempere: "France tempérée",
  sud: "Sud / Méditerranée",
};

const ZONES: Zone[] = ["nord", "tempere", "sud"];
const STORAGE_KEY = "mon-potager:zone";

interface ClimateContextValue {
  zone: Zone;
  offset: number;
  setZone: (z: Zone) => void;
  ready: boolean;
}

const ClimateContext = createContext<ClimateContextValue>({
  zone: "tempere",
  offset: 0,
  setZone: () => {},
  ready: false,
});

export function ClimateProvider({ children }: { children: React.ReactNode }) {
  const [zone, setZoneState] = useState<Zone>("tempere");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hydratation depuis le localStorage au montage (pattern store externe).
    const saved = window.localStorage.getItem(STORAGE_KEY) as Zone | null;
    /* eslint-disable react-hooks/set-state-in-effect */
    if (saved && ZONES.includes(saved)) setZoneState(saved);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const setZone = useCallback((z: Zone) => {
    setZoneState(z);
    window.localStorage.setItem(STORAGE_KEY, z);
  }, []);

  return (
    <ClimateContext.Provider
      value={{ zone, offset: ZONE_OFFSET[zone], setZone, ready }}
    >
      {children}
    </ClimateContext.Provider>
  );
}

export function useClimate() {
  return useContext(ClimateContext);
}
