"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANTS } from "@/lib/plants";
import {
  MONTHS_SHORT,
  MONTHS_FR,
  Category,
  CATEGORY_LABELS,
  ActionType,
  ACTION_ORDER as ORDER,
  DECADE_PART_LABELS,
  DECADE_PARTS as PARTS,
} from "@/lib/types";
import {
  getCurrentMonth,
  getCurrentDecade,
  monthToDecades,
  ACTION_COLORS,
  adjustedDecadeSets,
} from "@/lib/calendar";
import { useClimate } from "@/lib/climate";

const CATEGORIES: (Category | "tous")[] = ["tous", "legume", "fruit", "aromate"];

const CAT_LABEL: Record<string, string> = {
  tous: "Tout",
  ...CATEGORY_LABELS,
};

export default function CalendarGrid() {
  const [filter, setFilter] = useState<Category | "tous">("tous");
  const [activeActions, setActiveActions] = useState<Set<ActionType>>(
    () => new Set(ORDER)
  );
  const { offset } = useClimate();
  const currentMonth = getCurrentMonth();
  const currentDecade = getCurrentDecade();

  const toggleAction = (a: ActionType) =>
    setActiveActions((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      // jamais aucune action active : on remet tout
      return next.size === 0 ? new Set(ORDER) : next;
    });

  const isActive = (a: ActionType) => activeActions.has(a);
  const filtered = activeActions.size < ORDER.length;

  const plants =
    filter === "tous"
      ? PLANTS
      : PLANTS.filter((p) => p.category === filter);

  return (
    <div className="space-y-4">
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

      <div className="flex flex-wrap items-center gap-2">
        {ORDER.map((a) => (
          <button
            key={a}
            onClick={() => toggleAction(a)}
            aria-pressed={isActive(a)}
            title={`Afficher / masquer : ${ACTION_COLORS[a].label}`}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              isActive(a)
                ? `${ACTION_COLORS[a].bg} ${ACTION_COLORS[a].text} ring-1 ring-inset ring-current/20`
                : "bg-white dark:bg-zinc-900 text-emerald-700/50 dark:text-emerald-300/50 ring-1 ring-emerald-100 dark:ring-zinc-800 hover:bg-emerald-50 dark:hover:bg-zinc-800"
            }`}
          >
            <span
              className={`h-3 w-3 rounded-sm ${
                isActive(a) ? ACTION_COLORS[a].dot : "bg-emerald-200 dark:bg-zinc-700"
              }`}
            />
            {ACTION_COLORS[a].label}
          </button>
        ))}
        {filtered && (
          <button
            onClick={() => setActiveActions(new Set(ORDER))}
            className="ml-1 text-xs text-emerald-600 dark:text-emerald-400 underline-offset-2 hover:underline"
          >
            Tout afficher
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-emerald-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-emerald-50 dark:bg-zinc-800 px-3 py-2 text-left font-semibold text-emerald-900 dark:text-emerald-50">
                Plante
              </th>
              {MONTHS_SHORT.map((m, i) => (
                <th
                  key={m}
                  className={`px-1 py-2 text-center text-xs font-semibold ${
                    i + 1 === currentMonth
                      ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-50"
                      : "text-emerald-700/70 dark:text-emerald-300/70"
                  }`}
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plants.map((plant) => {
              const sets = adjustedDecadeSets(plant, offset);
              return (
              <tr key={plant.id} className="border-t border-emerald-50 dark:border-zinc-800">
                <td className="sticky left-0 z-10 bg-white dark:bg-zinc-900 px-3 py-1.5">
                  <Link
                    href={`/plantes/${plant.id}`}
                    className="flex items-center gap-2 whitespace-nowrap font-medium text-emerald-900 dark:text-emerald-50 hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    <span>{plant.emoji}</span>
                    {plant.nom}
                  </Link>
                </td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <td
                    key={month}
                    className={`px-1 py-1.5 ${
                      month === currentMonth
                        ? "bg-emerald-50/60 dark:bg-zinc-800/60"
                        : ""
                    }`}
                  >
                    <div className="flex justify-center gap-px">
                      {PARTS.map((part, pi) => {
                        const decade = monthToDecades(month)[pi];
                        const acts = ORDER.filter(
                          (a) => isActive(a) && sets[a].has(decade)
                        );
                        return (
                          <div
                            key={part}
                            title={`${MONTHS_FR[month - 1]} — ${DECADE_PART_LABELS[part]}`}
                            className={`flex w-3 flex-col gap-px rounded-[3px] py-0.5 ${
                              decade === currentDecade
                                ? "ring-1 ring-emerald-400 dark:ring-emerald-500"
                                : ""
                            }`}
                          >
                            {acts.map((a) => (
                              <span
                                key={a}
                                title={ACTION_COLORS[a].label}
                                className={`h-1.5 w-full rounded-[2px] ${ACTION_COLORS[a].dot}`}
                              />
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                ))}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-emerald-700/70 dark:text-emerald-300/70">
        Chaque mois est divisé en 3 : <strong>début</strong> (1–10),{" "}
        <strong>mi</strong> (11–20) et <strong>fin</strong> (21–fin du mois). La
        position de la marque dans la case indique la période précise ; le
        liseré vert repère la décade en cours.
      </p>
    </div>
  );
}
