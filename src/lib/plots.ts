"use client";

import { useCallback, useEffect, useState } from "react";

const EVENT = "mon-potager:plots-change";

export interface Plot {
  id: string;
  nom: string;
  rows: number;
  cols: number;
  /** longueur rows*cols ; chaque case contient un plantId ou null. */
  cells: (string | null)[];
}

// Cache partagé (source : serveur) + maj optimiste.
let cache: Plot[] = [];
let loaded = false;

function broadcast() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

async function refresh() {
  try {
    const res = await fetch("/api/plots", { cache: "no-store" });
    if (res.ok) {
      cache = (await res.json()) as Plot[];
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

function emptyCells(rows: number, cols: number): (string | null)[] {
  return Array<string | null>(rows * cols).fill(null);
}

function patchPlot(id: string, patch: Partial<Omit<Plot, "id">>) {
  cache = cache.map((p) => (p.id === id ? { ...p, ...patch } : p));
  broadcast();
  fetch(`/api/plots/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  })
    .then(refresh)
    .catch(() => {});
}

export function usePlots() {
  const [plots, setPlots] = useState<Plot[]>(cache);
  const [ready, setReady] = useState(loaded);

  useEffect(() => {
    const sync = () => {
      setPlots([...cache]);
      setReady(loaded);
    };
    sync();
    if (!loaded) refresh();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const addPlot = useCallback((nom: string, rows: number, cols: number) => {
    const plot: Plot = {
      id: uid(),
      nom,
      rows,
      cols,
      cells: emptyCells(rows, cols),
    };
    cache = [...cache, plot];
    broadcast();
    fetch("/api/plots", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(plot),
    })
      .then(refresh)
      .catch(() => {});
    return plot.id;
  }, []);

  const removePlot = useCallback((id: string) => {
    cache = cache.filter((p) => p.id !== id);
    broadcast();
    fetch(`/api/plots/${id}`, { method: "DELETE" })
      .then(refresh)
      .catch(() => {});
  }, []);

  const renamePlot = useCallback((id: string, nom: string) => {
    patchPlot(id, { nom });
  }, []);

  const setCell = useCallback(
    (id: string, index: number, plantId: string | null) => {
      const plot = cache.find((p) => p.id === id);
      if (!plot) return;
      const cells = [...plot.cells];
      cells[index] = plantId;
      patchPlot(id, { cells });
    },
    []
  );

  const resizePlot = useCallback((id: string, rows: number, cols: number) => {
    const plot = cache.find((p) => p.id === id);
    if (!plot) return;
    const cells = emptyCells(rows, cols);
    for (let r = 0; r < Math.min(rows, plot.rows); r++) {
      for (let c = 0; c < Math.min(cols, plot.cols); c++) {
        cells[r * cols + c] = plot.cells[r * plot.cols + c] ?? null;
      }
    }
    patchPlot(id, { rows, cols, cells });
  }, []);

  return { plots, ready, addPlot, removePlot, renamePlot, setCell, resizePlot };
}
