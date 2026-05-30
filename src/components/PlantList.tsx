"use client";

import { useMemo, useState } from "react";
import { PLANTS } from "@/lib/plants";
import { Category, CATEGORY_LABELS } from "@/lib/types";
import PlantCard from "./PlantCard";

const CATEGORIES: (Category | "tous")[] = ["tous", "legume", "fruit", "aromate"];
const CAT_LABEL: Record<string, string> = { tous: "Tout", ...CATEGORY_LABELS };

export default function PlantList() {
  const [filter, setFilter] = useState<Category | "tous">("tous");
  const [query, setQuery] = useState("");

  const plants = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLANTS.filter((p) => {
      const matchCat = filter === "tous" || p.category === filter;
      const matchQuery = q === "" || p.nom.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [filter, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                filter === cat
                  ? "bg-emerald-600 text-white"
                  : "bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-100 ring-1 ring-emerald-100 dark:ring-zinc-800 hover:bg-emerald-50 dark:hover:bg-zinc-800"
              }`}
            >
              {CAT_LABEL[cat]}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une plante…"
          className="w-full rounded-full border border-emerald-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-1.5 text-sm outline-none focus:border-emerald-400 dark:focus:border-emerald-500 sm:w-56"
        />
      </div>

      {plants.length === 0 ? (
        <p className="rounded-xl border border-dashed border-emerald-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 text-sm text-emerald-700/70 dark:text-emerald-300/70">
          Aucune plante ne correspond à votre recherche.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}
    </div>
  );
}
