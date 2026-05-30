"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePlots, Plot } from "@/lib/plots";
import { PLANTS, getPlantById } from "@/lib/plants";
import { Category, CATEGORY_LABELS } from "@/lib/types";
import { areIncompatible } from "@/lib/calendar";
import { useSeeds } from "@/lib/seeds";
import {
  rotationConflicts,
  suggestionsForPlot,
  PLOT_TEMPLATES,
} from "@/lib/plot-logic";
import PlantAvatar from "./PlantAvatar";

type Brush = { type: "plant"; plantId: string } | { type: "eraser" } | null;
type PaletteFilter = Category | "tous" | "mes";

const CATEGORIES: (Category | "tous")[] = ["tous", "legume", "fruit", "aromate"];
const CAT_LABEL: Record<string, string> = {
  tous: "Tout",
  mes: "🌰 Mes graines",
  ...CATEGORY_LABELS,
};

function conflictCells(plot: Plot): Set<number> {
  const conflicts = new Set<number>();
  const { rows, cols, cells } = plot;
  const at = (r: number, c: number) => cells[r * cols + c];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = at(r, c);
      if (!id) continue;
      const plant = getPlantById(id);
      if (!plant) continue;
      const neighbors: [number, number][] = [
        [r, c + 1],
        [r + 1, c],
      ];
      for (const [nr, nc] of neighbors) {
        if (nr >= rows || nc >= cols) continue;
        const nid = at(nr, nc);
        if (!nid) continue;
        const np = getPlantById(nid);
        if (np && areIncompatible(plant, np)) {
          conflicts.add(r * cols + c);
          conflicts.add(nr * cols + nc);
        }
      }
    }
  }
  return conflicts;
}

export default function PotagerPlanner() {
  const {
    plots,
    ready,
    addPlot,
    removePlot,
    renamePlot,
    setCell,
    resizePlot,
    setYear,
  } = usePlots();
  const { seeds, ready: seedsReady } = useSeeds();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [brush, setBrush] = useState<Brush>(null);
  const [catFilter, setCatFilter] = useState<PaletteFilter>("tous");

  // Par défaut, si l'inventaire de graines existe, on filtre dessus.
  const didInitFilter = useRef(false);
  useEffect(() => {
    if (!didInitFilter.current && seedsReady && seeds.length > 0) {
      didInitFilter.current = true;
      setCatFilter("mes");
    }
  }, [seedsReady, seeds.length]);

  // formulaire de création
  const [newNom, setNewNom] = useState("");
  const [newRows, setNewRows] = useState(4);
  const [newCols, setNewCols] = useState(4);

  const selected =
    plots.find((p) => p.id === selectedId) ?? plots[0] ?? null;

  const conflicts = useMemo(
    () => (selected ? conflictCells(selected) : new Set<number>()),
    [selected]
  );

  const rotation = useMemo(
    () => (selected ? rotationConflicts(selected) : new Set<number>()),
    [selected]
  );

  const suggestions = useMemo(
    () => (selected ? suggestionsForPlot(selected.cells) : []),
    [selected]
  );

  const palette = useMemo(() => {
    if (catFilter === "mes") return PLANTS.filter((p) => seeds.includes(p.id));
    if (catFilter === "tous") return PLANTS;
    return PLANTS.filter((p) => p.category === catFilter);
  }, [catFilter, seeds]);

  if (!ready) {
    return <p className="text-sm text-emerald-700/60 dark:text-emerald-300/60">Chargement…</p>;
  }

  const handleCreate = () => {
    const nom = newNom.trim() || `Carré ${plots.length + 1}`;
    const id = addPlot(nom, clamp(newRows), clamp(newCols));
    setSelectedId(id);
    setNewNom("");
  };

  const applyBrush = (index: number) => {
    if (!selected || !brush) return;
    setCell(selected.id, index, brush.type === "eraser" ? null : brush.plantId);
  };

  return (
    <div className="space-y-5">
      {/* Création de carré */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-emerald-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <label className="block">
          <span className="text-xs text-emerald-700 dark:text-emerald-300">Nom du carré</span>
          <input
            value={newNom}
            onChange={(e) => setNewNom(e.target.value)}
            placeholder="ex: Carré nord"
            className="mt-1 block w-40 rounded-lg border border-emerald-200 dark:border-zinc-700 px-2 py-1.5 text-sm outline-none focus:border-emerald-400 dark:focus:border-emerald-500"
          />
        </label>
        <label className="block">
          <span className="text-xs text-emerald-700 dark:text-emerald-300">Lignes</span>
          <input
            type="number"
            min={1}
            max={10}
            value={newRows}
            onChange={(e) => setNewRows(Number(e.target.value))}
            className="mt-1 block w-20 rounded-lg border border-emerald-200 dark:border-zinc-700 px-2 py-1.5 text-sm outline-none focus:border-emerald-400 dark:focus:border-emerald-500"
          />
        </label>
        <label className="block">
          <span className="text-xs text-emerald-700 dark:text-emerald-300">Colonnes</span>
          <input
            type="number"
            min={1}
            max={10}
            value={newCols}
            onChange={(e) => setNewCols(Number(e.target.value))}
            className="mt-1 block w-20 rounded-lg border border-emerald-200 dark:border-zinc-700 px-2 py-1.5 text-sm outline-none focus:border-emerald-400 dark:focus:border-emerald-500"
          />
        </label>
        <button
          onClick={handleCreate}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + Nouveau carré
        </button>
      </div>

      {/* Modèles tout faits */}
      <div className="rounded-xl border border-emerald-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <p className="mb-1 text-sm font-semibold text-emerald-900 dark:text-emerald-50">
          🌱 Pas d&apos;idée ? Partez d&apos;un modèle
        </p>
        <p className="mb-3 text-xs text-emerald-800/80 dark:text-emerald-100/80">
          Un carré pré-rempli, à ajuster ensuite comme vous voulez.
        </p>
        <div className="flex flex-wrap gap-2">
          {PLOT_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                const id = addPlot(t.nom, t.rows, t.cols, [...t.cells]);
                setSelectedId(id);
              }}
              title={t.description}
              className="rounded-xl border border-emerald-100 dark:border-zinc-700 px-3 py-2 text-left text-xs transition hover:border-emerald-300 hover:bg-emerald-50 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              <span className="block font-semibold text-emerald-900 dark:text-emerald-50">
                {t.nom}
              </span>
              <span className="block text-emerald-700/80 dark:text-emerald-300/80">
                {t.rows}×{t.cols} — {t.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {plots.length === 0 ? (
        <div className="rounded-xl border border-dashed border-emerald-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 text-center">
          <p className="text-4xl">🟫</p>
          <p className="mt-3 font-semibold text-emerald-900 dark:text-emerald-50">
            Aucun carré pour l&apos;instant
          </p>
          <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-100/80">
            Créez votre premier carré ci-dessus, puis placez-y vos plantes.
          </p>
        </div>
      ) : (
        <>
          {/* Onglets des carrés */}
          {plots.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {plots.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    selected?.id === p.id
                      ? "bg-emerald-600 text-white"
                      : "bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-100 ring-1 ring-emerald-100 dark:ring-zinc-800 hover:bg-emerald-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  {p.nom}
                </button>
              ))}
            </div>
          )}

          {selected && (
            <PlotEditor
              key={selected.id}
              plot={selected}
              brush={brush}
              conflicts={conflicts}
              rotation={rotation}
              onApply={applyBrush}
              onRename={(nom) => renamePlot(selected.id, nom)}
              onResize={(r, c) => resizePlot(selected.id, clamp(r), clamp(c))}
              onSetYear={(y) => setYear(selected.id, y)}
              onDelete={() => {
                removePlot(selected.id);
                setSelectedId(null);
              }}
            />
          )}

          {/* Suggestions de voisines */}
          {selected && suggestions.length > 0 && (
            <div className="rounded-xl border border-emerald-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
              <p className="mb-2 text-sm font-semibold text-emerald-900 dark:text-emerald-50">
                💡 Bonnes voisines à ajouter
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((id) => {
                  const plant = getPlantById(id);
                  if (!plant) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => setBrush({ type: "plant", plantId: id })}
                      title={`Choisir ${plant.nom} comme pinceau`}
                      className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800 transition hover:bg-emerald-100 dark:bg-zinc-800 dark:text-emerald-100 dark:hover:bg-zinc-700"
                    >
                      <span>{plant.emoji}</span>
                      {plant.nom}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Palette */}
          <div className="rounded-xl border border-emerald-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-50">
                Palette — choisissez une plante puis cliquez les cases
              </p>
              <button
                onClick={() => setBrush({ type: "eraser" })}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  brush?.type === "eraser"
                    ? "bg-rose-600 text-white"
                    : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900"
                }`}
              >
                🧽 Gomme
              </button>
            </div>

            <div className="mb-3 flex flex-wrap gap-1.5">
              {(["mes", ...CATEGORIES] as PaletteFilter[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                    catFilter === cat
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 dark:bg-zinc-800 text-emerald-800 dark:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-zinc-700"
                  }`}
                >
                  {CAT_LABEL[cat]}
                  {cat === "mes" && ` (${seeds.length})`}
                </button>
              ))}
            </div>

            {catFilter === "mes" && palette.length === 0 ? (
              <p className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/50 p-4 text-sm text-emerald-800 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-emerald-100">
                Vous n&apos;avez pas encore défini vos graines.{" "}
                <Link
                  href="/graines"
                  className="font-semibold text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-300"
                >
                  Définir mes graines →
                </Link>
              </p>
            ) : (
              <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-5 md:grid-cols-6">
                {palette.map((plant) => {
                const active =
                  brush?.type === "plant" && brush.plantId === plant.id;
                return (
                  <button
                    key={plant.id}
                    onClick={() => setBrush({ type: "plant", plantId: plant.id })}
                    className={`flex flex-col items-center gap-1 rounded-lg p-2 text-center text-xs transition ${
                      active
                        ? "bg-emerald-100 dark:bg-emerald-900 ring-2 ring-emerald-500"
                        : "hover:bg-emerald-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <PlantAvatar
                      emoji={plant.emoji}
                      category={plant.category}
                      size="sm"
                    />
                    <span className="leading-tight text-emerald-800 dark:text-emerald-100">
                      {plant.nom}
                    </span>
                  </button>
                );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function clamp(n: number): number {
  if (Number.isNaN(n)) return 1;
  return Math.max(1, Math.min(10, Math.round(n)));
}

function PlotEditor({
  plot,
  brush,
  conflicts,
  rotation,
  onApply,
  onRename,
  onResize,
  onSetYear,
  onDelete,
}: {
  plot: Plot;
  brush: Brush;
  conflicts: Set<number>;
  rotation: Set<number>;
  onApply: (index: number) => void;
  onRename: (nom: string) => void;
  onResize: (rows: number, cols: number) => void;
  onSetYear: (year: number) => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-xl border border-emerald-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          value={plot.nom}
          onChange={(e) => onRename(e.target.value)}
          className="rounded-lg border border-transparent px-1 text-lg font-bold text-emerald-900 dark:text-emerald-50 outline-none hover:border-emerald-200 dark:hover:border-zinc-700 focus:border-emerald-400 dark:focus:border-emerald-500"
        />
        <div className="flex flex-wrap items-center gap-3 text-sm text-emerald-800 dark:text-emerald-100">
          <Stepper
            label="Année"
            value={plot.year}
            onChange={(v) => onSetYear(v)}
            min={2000}
            max={2100}
            width="w-12"
          />
          <Stepper
            label="Lignes"
            value={plot.rows}
            onChange={(v) => onResize(v, plot.cols)}
          />
          <Stepper
            label="Colonnes"
            value={plot.cols}
            onChange={(v) => onResize(plot.rows, v)}
          />
          <button
            onClick={onDelete}
            className="rounded-full px-2 py-1 text-xs text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950"
          >
            Supprimer
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-1 rounded-lg bg-amber-50/60 dark:bg-amber-950/40 p-2"
          style={{ gridTemplateColumns: `repeat(${plot.cols}, 3.25rem)` }}
        >
          {plot.cells.map((cellId, index) => {
            const plant = cellId ? getPlantById(cellId) : null;
            const inConflict = conflicts.has(index);
            const inRotation = rotation.has(index);
            const cellClass = inConflict
              ? "border-rose-400 dark:border-rose-700 bg-rose-50 dark:bg-rose-950 ring-1 ring-rose-300 dark:ring-rose-700"
              : inRotation
                ? "border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950 ring-1 ring-amber-300 dark:ring-amber-700"
                : "border-amber-200/70 dark:border-zinc-700/70 bg-white dark:bg-zinc-900 hover:border-emerald-300 dark:hover:border-zinc-600 hover:bg-emerald-50 dark:hover:bg-zinc-800";
            const title = inConflict
              ? "Voisinage déconseillé"
              : inRotation
                ? "Rotation : même famille ici récemment"
                : plant
                  ? `${plant.nom} — espacement ${plant.espacement}`
                  : "Case vide";
            return (
              <button
                key={index}
                onClick={() => onApply(index)}
                title={title}
                className={`flex h-13 w-13 items-center justify-center rounded-md border text-2xl transition ${cellClass}`}
                style={{ height: "3.25rem", width: "3.25rem" }}
              >
                {plant ? (
                  <span className="relative">
                    {plant.emoji}
                    {inConflict && (
                      <span className="absolute -right-2 -top-2 text-xs">
                        ⚠️
                      </span>
                    )}
                    {!inConflict && inRotation && (
                      <span className="absolute -right-2 -top-2 text-xs">
                        🔁
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-emerald-200 dark:text-zinc-600">·</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {(() => {
        const ids = Array.from(
          new Set(plot.cells.filter((c): c is string => Boolean(c)))
        );
        if (ids.length === 0) return null;
        return (
          <div className="mt-4 border-t border-emerald-50 dark:border-zinc-800 pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              📏 Distances de plantation
            </p>
            <div className="flex flex-wrap gap-2">
              {ids.map((id) => {
                const plant = getPlantById(id);
                if (!plant) return null;
                return (
                  <span
                    key={id}
                    className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800 dark:bg-zinc-800 dark:text-emerald-100"
                  >
                    <span>{plant.emoji}</span>
                    <span className="font-medium">{plant.nom}</span>
                    <span className="text-emerald-700/70 dark:text-emerald-300/70">
                      {plant.espacement}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        );
      })()}

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-emerald-700/80 dark:text-emerald-300/80">
        <span>
          Pinceau actuel :{" "}
          <strong className="text-emerald-900 dark:text-emerald-50">
            {brush?.type === "eraser"
              ? "Gomme"
              : brush?.type === "plant"
                ? (getPlantById(brush.plantId)?.nom ?? "—")
                : "aucun (choisissez dans la palette)"}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm border border-rose-400 dark:border-rose-700 bg-rose-50 dark:bg-rose-950" />
          ⚠️ voisinage déconseillé
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm border border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950" />
          🔁 rotation (même famille récemment)
        </span>
      </div>
    </div>
  );
}

function Stepper({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  width = "w-5",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  width?: string;
}) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-xs text-emerald-700 dark:text-emerald-300">{label}</span>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-6 w-6 rounded-full bg-emerald-50 dark:bg-zinc-800 text-emerald-800 dark:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-zinc-700"
      >
        −
      </button>
      <span className={`${width} text-center font-medium`}>{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="h-6 w-6 rounded-full bg-emerald-50 dark:bg-zinc-800 text-emerald-800 dark:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-zinc-700"
      >
        +
      </button>
    </span>
  );
}
