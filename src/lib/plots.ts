"use client";

import { useCallback, useEffect, useState } from "react";

const EVENT = "mon-potager:plots-change";

export interface Plot {
  id: string;
  nom: string;
  rows: number;
  cols: number;
  /** longueur rows*cols ; layout de l'année `year`. */
  cells: (string | null)[];
  /** année en cours d'édition */
  year: number;
  /** layouts par année : { "2025": cells, "2026": cells } */
  layouts: Record<string, (string | null)[]>;
}

let cache: Plot[] = [];
let loaded = false;

function broadcast() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

function currentYear(): number {
  return new Date().getFullYear();
}

function emptyCells(rows: number, cols: number): (string | null)[] {
  return Array<string | null>(rows * cols).fill(null);
}

/** Normalise un carré venu du serveur (compat. anciens sans layouts). */
function normalizePlot(p: Plot): Plot {
  const year = p.year && p.year > 0 ? p.year : currentYear();
  const layouts =
    p.layouts && Object.keys(p.layouts).length > 0
      ? p.layouts
      : { [String(year)]: p.cells };
  const cells = layouts[String(year)] ?? p.cells;
  return { ...p, year, layouts, cells };
}

async function refresh() {
  try {
    const res = await fetch("/api/plots", { cache: "no-store" });
    if (res.ok) {
      cache = ((await res.json()) as Plot[]).map(normalizePlot);
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

  const addPlot = useCallback(
    (nom: string, rows: number, cols: number, cells?: (string | null)[]) => {
      const year = currentYear();
      const layout = cells ?? emptyCells(rows, cols);
      const plot: Plot = {
        id: uid(),
        nom,
        rows,
        cols,
        cells: layout,
        year,
        layouts: { [String(year)]: layout },
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
    },
    []
  );

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
      const layouts = { ...plot.layouts, [String(plot.year)]: cells };
      patchPlot(id, { cells, layouts });
    },
    []
  );

  const resizePlot = useCallback((id: string, rows: number, cols: number) => {
    const plot = cache.find((p) => p.id === id);
    if (!plot) return;
    const resize = (src: (string | null)[]) => {
      const next = emptyCells(rows, cols);
      for (let r = 0; r < Math.min(rows, plot.rows); r++) {
        for (let c = 0; c < Math.min(cols, plot.cols); c++) {
          next[r * cols + c] = src[r * plot.cols + c] ?? null;
        }
      }
      return next;
    };
    const layouts: Record<string, (string | null)[]> = {};
    for (const [y, l] of Object.entries(plot.layouts)) layouts[y] = resize(l);
    const cells = resize(plot.cells);
    layouts[String(plot.year)] = cells;
    patchPlot(id, { rows, cols, cells, layouts });
  }, []);

  /** Change l'année éditée (crée un layout vide si l'année est nouvelle). */
  const setYear = useCallback((id: string, year: number) => {
    const plot = cache.find((p) => p.id === id);
    if (!plot) return;
    const layouts = { ...plot.layouts };
    if (!layouts[String(year)]) {
      layouts[String(year)] = emptyCells(plot.rows, plot.cols);
    }
    patchPlot(id, { year, cells: layouts[String(year)], layouts });
  }, []);

  return {
    plots,
    ready,
    addPlot,
    removePlot,
    renamePlot,
    setCell,
    resizePlot,
    setYear,
  };
}
