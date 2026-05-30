"use client";

import { useCallback, useEffect, useState } from "react";

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

// Cache partagé entre composants (source : serveur), avec maj optimiste.
let cache: Plantation[] = [];
let loaded = false;

function broadcast() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

async function refresh() {
  try {
    const res = await fetch("/api/garden", { cache: "no-store" });
    if (res.ok) {
      cache = (await res.json()) as Plantation[];
      loaded = true;
      broadcast();
    }
  } catch {
    // hors-ligne : on garde le cache courant
  }
}

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());
}

/** Hook réactif sur la liste des plantations (stockées côté serveur). */
export function useGarden() {
  const [plantations, setPlantations] = useState<Plantation[]>(cache);
  const [ready, setReady] = useState(loaded);

  useEffect(() => {
    const sync = () => {
      setPlantations([...cache]);
      setReady(loaded);
    };
    sync();
    if (!loaded) refresh();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const add = useCallback((p: Omit<Plantation, "uid">) => {
    const entry: Plantation = { ...p, uid: uid() };
    cache = [...cache, entry];
    broadcast();
    fetch("/api/garden", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(entry),
    })
      .then(refresh)
      .catch(() => {});
    return entry.uid;
  }, []);

  const remove = useCallback((target: string) => {
    cache = cache.filter((p) => p.uid !== target);
    broadcast();
    fetch(`/api/garden/${target}`, { method: "DELETE" })
      .then(refresh)
      .catch(() => {});
  }, []);

  const update = useCallback((target: string, patch: Partial<Plantation>) => {
    cache = cache.map((p) => (p.uid === target ? { ...p, ...patch } : p));
    broadcast();
    fetch(`/api/garden/${target}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    })
      .then(refresh)
      .catch(() => {});
  }, []);

  return { plantations, ready, add, remove, update };
}
