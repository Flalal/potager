"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "mon-potager:plantations";
const EVENT = "mon-potager:change";

export interface Plantation {
  /** id unique de l'entrée */
  uid: string;
  /** id de la plante du catalogue */
  plantId: string;
  /** date de mise en terre, format ISO yyyy-mm-dd */
  datePlantation: string;
  /** quantité plantée */
  quantite: number;
  /** emplacement libre (ex: "carré nord", "balcon") */
  emplacement: string;
  notes: string;
}

function read(): Plantation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Plantation[]) : [];
  } catch {
    return [];
  }
}

function write(list: Plantation[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

/** Hook réactif sur la liste des plantations stockées en local. */
export function useGarden() {
  const [plantations, setPlantations] = useState<Plantation[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setPlantations(read());
    sync();
    setReady(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const add = useCallback((p: Omit<Plantation, "uid">) => {
    const list = read();
    const uid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now() + Math.random());
    write([...list, { ...p, uid }]);
  }, []);

  const remove = useCallback((uid: string) => {
    write(read().filter((p) => p.uid !== uid));
  }, []);

  const update = useCallback((uid: string, patch: Partial<Plantation>) => {
    write(read().map((p) => (p.uid === uid ? { ...p, ...patch } : p)));
  }, []);

  return { plantations, ready, add, remove, update };
}
