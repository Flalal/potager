"use client";

import { useCallback, useEffect, useState } from "react";

const EVENT = "mon-potager:journal-change";

export type JournalType =
  | "recolte"
  | "semis"
  | "plantation"
  | "observation"
  | "traitement";

export const JOURNAL_TYPE_LABELS: Record<JournalType, string> = {
  recolte: "Récolte",
  semis: "Semis",
  plantation: "Plantation",
  observation: "Observation",
  traitement: "Traitement",
};

export const JOURNAL_TYPE_EMOJI: Record<JournalType, string> = {
  recolte: "🧺",
  semis: "🌱",
  plantation: "🪴",
  observation: "👀",
  traitement: "🧴",
};

export interface JournalEntry {
  id: string;
  /** date de l'événement, ISO yyyy-mm-dd */
  date: string;
  type: JournalType;
  /** id de plante du catalogue, ou "" si non lié */
  plantId: string;
  titre: string;
  note: string;
  /** quantité récoltée/semée (optionnel) */
  quantite: number | null;
  unite: string;
}

let cache: JournalEntry[] = [];
let loaded = false;

function broadcast() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

async function refresh() {
  try {
    const res = await fetch("/api/journal", { cache: "no-store" });
    if (res.ok) {
      cache = (await res.json()) as JournalEntry[];
      loaded = true;
      broadcast();
    }
  } catch {
    // hors-ligne : on garde le cache
  }
}

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());
}

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>(cache);
  const [ready, setReady] = useState(loaded);

  useEffect(() => {
    const sync = () => {
      setEntries([...cache]);
      setReady(loaded);
    };
    sync();
    if (!loaded) refresh();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const add = useCallback((entry: Omit<JournalEntry, "id">) => {
    const full: JournalEntry = { ...entry, id: uid() };
    cache = [full, ...cache];
    broadcast();
    fetch("/api/journal", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(full),
    })
      .then(refresh)
      .catch(() => {});
    return full.id;
  }, []);

  const remove = useCallback((id: string) => {
    cache = cache.filter((e) => e.id !== id);
    broadcast();
    fetch(`/api/journal/${id}`, { method: "DELETE" })
      .then(refresh)
      .catch(() => {});
  }, []);

  return { entries, ready, add, remove };
}
