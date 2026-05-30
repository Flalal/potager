"use client";

import { useCallback, useEffect, useState } from "react";

const EVENT = "mon-potager:seeds-change";

let cache: string[] = [];
let loaded = false;

function broadcast() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

async function refresh() {
  try {
    const res = await fetch("/api/seeds", { cache: "no-store" });
    if (res.ok) {
      cache = (await res.json()) as string[];
      loaded = true;
      broadcast();
    }
  } catch {
    // hors-ligne
  }
}

/** Inventaire des graines possédées (liste d'ids de plantes). */
export function useSeeds() {
  const [seeds, setSeeds] = useState<string[]>(cache);
  const [ready, setReady] = useState(loaded);

  useEffect(() => {
    const sync = () => {
      setSeeds([...cache]);
      setReady(loaded);
    };
    sync();
    if (!loaded) refresh();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const isOwned = useCallback((id: string) => seeds.includes(id), [seeds]);

  const toggle = useCallback((id: string) => {
    const has = !cache.includes(id);
    cache = has ? [...cache, id] : cache.filter((x) => x !== id);
    broadcast();
    fetch("/api/seeds", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plantId: id, has }),
    })
      .then(refresh)
      .catch(() => {});
  }, []);

  return { seeds, ready, isOwned, toggle };
}
