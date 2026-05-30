"use client";

import { useMemo, useState } from "react";
import { usePlots, Plot } from "@/lib/plots";
import { PLANTS, getPlantById } from "@/lib/plants";
import { Category, CATEGORY_LABELS } from "@/lib/types";
import { areIncompatible } from "@/lib/calendar";
import PlantAvatar from "./PlantAvatar";

type Brush = { type: "plant"; plantId: string } | { type: "eraser" } | null;

const CATEGORIES: (Category | "tous")[] = ["tous", "legume", "fruit", "aromate"];
const CAT_LABEL: Record<string, string> = { tous: "Tout", ...CATEGORY_LABELS };

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
  const { plots, ready, addPlot, removePlot, renamePlot, setCell, resizePlot } =
    usePlots();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [brush, setBrush] = useState<Brush>(null);
  const [catFilter, setCatFilter] = useState<Category | "tous">("tous");

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

  const palette = useMemo(
    () =>
      catFilter === "tous"
        ? PLANTS
        : PLANTS.filter((p) => p.category === catFilter),
    [catFilter]
  );

  if (!ready) {
    return <p className="text-sm text-emerald-700/60">Chargement…</p>;
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
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-emerald-100 bg-white p-4">
        <label className="block">
          <span className="text-xs text-emerald-700">Nom du carré</span>
          <input
            value={newNom}
            onChange={(e) => setNewNom(e.target.value)}
            placeholder="ex: Carré nord"
            className="mt-1 block w-40 rounded-lg border border-emerald-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400"
          />
        </label>
        <label className="block">
          <span className="text-xs text-emerald-700">Lignes</span>
          <input
            type="number"
            min={1}
            max={10}
            value={newRows}
            onChange={(e) => setNewRows(Number(e.target.value))}
            className="mt-1 block w-20 rounded-lg border border-emerald-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400"
          />
        </label>
        <label className="block">
          <span className="text-xs text-emerald-700">Colonnes</span>
          <input
            type="number"
            min={1}
            max={10}
            value={newCols}
            onChange={(e) => setNewCols(Number(e.target.value))}
            className="mt-1 block w-20 rounded-lg border border-emerald-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400"
          />
        </label>
        <button
          onClick={handleCreate}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + Nouveau carré
        </button>
      </div>

      {plots.length === 0 ? (
        <div className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center">
          <p className="text-4xl">🟫</p>
          <p className="mt-3 font-semibold text-emerald-900">
            Aucun carré pour l&apos;instant
          </p>
          <p className="mt-1 text-sm text-emerald-800/80">
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
                      : "bg-white text-emerald-800 ring-1 ring-emerald-100 hover:bg-emerald-50"
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
              onApply={applyBrush}
              onRename={(nom) => renamePlot(selected.id, nom)}
              onResize={(r, c) => resizePlot(selected.id, clamp(r), clamp(c))}
              onDelete={() => {
                removePlot(selected.id);
                setSelectedId(null);
              }}
            />
          )}

          {/* Palette */}
          <div className="rounded-xl border border-emerald-100 bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-emerald-900">
                Palette — choisissez une plante puis cliquez les cases
              </p>
              <button
                onClick={() => setBrush({ type: "eraser" })}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  brush?.type === "eraser"
                    ? "bg-rose-600 text-white"
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                🧽 Gomme
              </button>
            </div>

            <div className="mb-3 flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                    catFilter === cat
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  {CAT_LABEL[cat]}
                </button>
              ))}
            </div>

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
                        ? "bg-emerald-100 ring-2 ring-emerald-500"
                        : "hover:bg-emerald-50"
                    }`}
                  >
                    <PlantAvatar
                      emoji={plant.emoji}
                      category={plant.category}
                      size="sm"
                    />
                    <span className="leading-tight text-emerald-800">
                      {plant.nom}
                    </span>
                  </button>
                );
              })}
            </div>
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
  onApply,
  onRename,
  onResize,
  onDelete,
}: {
  plot: Plot;
  brush: Brush;
  conflicts: Set<number>;
  onApply: (index: number) => void;
  onRename: (nom: string) => void;
  onResize: (rows: number, cols: number) => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          value={plot.nom}
          onChange={(e) => onRename(e.target.value)}
          className="rounded-lg border border-transparent px-1 text-lg font-bold text-emerald-900 outline-none hover:border-emerald-200 focus:border-emerald-400"
        />
        <div className="flex items-center gap-3 text-sm text-emerald-800">
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
            className="rounded-full px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
          >
            Supprimer
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-1 rounded-lg bg-amber-50/60 p-2"
          style={{ gridTemplateColumns: `repeat(${plot.cols}, 3.25rem)` }}
        >
          {plot.cells.map((cellId, index) => {
            const plant = cellId ? getPlantById(cellId) : null;
            const inConflict = conflicts.has(index);
            return (
              <button
                key={index}
                onClick={() => onApply(index)}
                title={
                  inConflict
                    ? "Voisinage déconseillé"
                    : plant?.nom ?? "Case vide"
                }
                className={`flex h-13 w-13 items-center justify-center rounded-md border text-2xl transition ${
                  inConflict
                    ? "border-rose-400 bg-rose-50 ring-1 ring-rose-300"
                    : "border-amber-200/70 bg-white hover:border-emerald-300 hover:bg-emerald-50"
                }`}
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
                  </span>
                ) : (
                  <span className="text-emerald-200">·</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-emerald-700/80">
        <span>
          Pinceau actuel :{" "}
          <strong className="text-emerald-900">
            {brush?.type === "eraser"
              ? "Gomme"
              : brush?.type === "plant"
                ? (getPlantById(brush.plantId)?.nom ?? "—")
                : "aucun (choisissez dans la palette)"}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm border border-rose-400 bg-rose-50" />
          voisinage déconseillé
        </span>
      </div>
    </div>
  );
}

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-xs text-emerald-700">{label}</span>
      <button
        onClick={() => onChange(value - 1)}
        className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
      >
        −
      </button>
      <span className="w-5 text-center font-medium">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
      >
        +
      </button>
    </span>
  );
}
