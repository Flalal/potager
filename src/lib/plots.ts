"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "mon-potager:parcelles";
const EVENT = "mon-potager:plots-change";

export interface Plot {
  id: string;
  nom: string;
  rows: number;
  cols: number;
  /** longueur rows*cols ; chaque case contient un plantId ou null. */
  cells: (string | null)[];
}

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());
}

function read(): Plot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Plot[]) : [];
  } catch {
    return [];
  }
}

function write(list: Plot[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

function emptyCells(rows: number, cols: number): (string | null)[] {
  return Array<string | null>(rows * cols).fill(null);
}

export function usePlots() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setPlots(read());
    sync();
    setReady(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const addPlot = useCallback((nom: string, rows: number, cols: number) => {
    const plot: Plot = { id: uid(), nom, rows, cols, cells: emptyCells(rows, cols) };
    write([...read(), plot]);
    return plot.id;
  }, []);

  const removePlot = useCallback((id: string) => {
    write(read().filter((p) => p.id !== id));
  }, []);

  const renamePlot = useCallback((id: string, nom: string) => {
    write(read().map((p) => (p.id === id ? { ...p, nom } : p)));
  }, []);

  const setCell = useCallback(
    (id: string, index: number, plantId: string | null) => {
      write(
        read().map((p) => {
          if (p.id !== id) return p;
          const cells = [...p.cells];
          cells[index] = plantId;
          return { ...p, cells };
        })
      );
    },
    []
  );

  const resizePlot = useCallback(
    (id: string, rows: number, cols: number) => {
      write(
        read().map((p) => {
          if (p.id !== id) return p;
          const cells = emptyCells(rows, cols);
          for (let r = 0; r < Math.min(rows, p.rows); r++) {
            for (let c = 0; c < Math.min(cols, p.cols); c++) {
              cells[r * cols + c] = p.cells[r * p.cols + c] ?? null;
            }
          }
          return { ...p, rows, cols, cells };
        })
      );
    },
    []
  );

  return { plots, ready, addPlot, removePlot, renamePlot, setCell, resizePlot };
}
