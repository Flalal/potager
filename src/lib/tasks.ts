"use client";

import { useCallback, useEffect, useState } from "react";

const EVENT = "mon-potager:tasks-change";

/** Clé stable d'une tâche pour un mois donné (réinitialisée chaque mois). */
export function taskKey(
  plantationUid: string,
  year: number,
  month: number,
  label: string
): string {
  return `${plantationUid}:${year}-${month}:${label}`;
}

let cache: Set<string> = new Set();
let loaded = false;

function broadcast() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

async function refresh() {
  try {
    const res = await fetch("/api/tasks", { cache: "no-store" });
    if (res.ok) {
      cache = new Set((await res.json()) as string[]);
      loaded = true;
      broadcast();
    }
  } catch {
    // hors-ligne
  }
}

export function useTaskDone() {
  const [, force] = useState(0);

  useEffect(() => {
    const sync = () => force((n) => n + 1);
    if (!loaded) refresh();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const isDone = useCallback((key: string) => cache.has(key), []);

  const toggle = useCallback((key: string) => {
    const done = !cache.has(key);
    if (done) cache.add(key);
    else cache.delete(key);
    broadcast();
    fetch("/api/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, done }),
    })
      .then(refresh)
      .catch(() => {});
  }, []);

  return { isDone, toggle, ready: loaded };
}
