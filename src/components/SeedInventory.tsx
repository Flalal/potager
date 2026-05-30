"use client";

import { useMemo, useState } from "react";
import { PLANTS } from "@/lib/plants";
import { Category, CATEGORY_LABELS } from "@/lib/types";
import { useSeeds } from "@/lib/seeds";
import PlantAvatar from "./PlantAvatar";

const CATEGORIES: (Category | "tous")[] = ["tous", "legume", "fruit", "aromate"];
const CAT_LABEL: Record<string, string> = { tous: "Tout", ...CATEGORY_LABELS };

export default function SeedInventory() {
  const { seeds, ready, isOwned, toggle } = useSeeds();
  const [cat, setCat] = useState<Category | "tous">("tous");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLANTS.filter(
      (p) =>
        (cat === "tous" || p.category === cat) &&
        (!q || p.nom.toLowerCase().includes(q))
    );
  }, [cat, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-100 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <span className="font-medium text-emerald-900 dark:text-emerald-50">
          {ready ? `${seeds.length} graine${seeds.length > 1 ? "s" : ""}` : "…"}{" "}
          <span className="font-normal text-emerald-700/70 dark:text-emerald-300/70">
            dans votre inventaire
          </span>
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une plante…"
          className="ml-auto w-44 rounded-lg border border-emerald-200 px-2 py-1 text-sm outline-none focus:border-emerald-400 dark:border-zinc-700 dark:focus:border-emerald-500"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
              cat === c
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-zinc-800 dark:text-emerald-100 dark:hover:bg-zinc-700"
            }`}
          >
            {CAT_LABEL[c]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {list.map((plant) => {
          const owned = isOwned(plant.id);
          return (
            <button
              key={plant.id}
              onClick={() => toggle(plant.id)}
              aria-pressed={owned}
              className={`flex items-center gap-2 rounded-xl border p-3 text-left transition ${
                owned
                  ? "border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950"
                  : "border-emerald-100 bg-white hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
              }`}
            >
              <PlantAvatar
                emoji={plant.emoji}
                category={plant.category}
                size="sm"
              />
              <span className="min-w-0 flex-1 text-sm font-medium text-emerald-900 dark:text-emerald-50">
                {plant.nom}
              </span>
              <span className="text-lg">{owned ? "✅" : "⬜"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
