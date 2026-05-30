"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANTS } from "@/lib/plants";
import { MONTHS_SHORT, Category, CATEGORY_LABELS, ActionType } from "@/lib/types";
import { getCurrentMonth, ACTION_COLORS, shiftMonths } from "@/lib/calendar";
import { useClimate } from "@/lib/climate";

const CATEGORIES: (Category | "tous")[] = ["tous", "legume", "fruit", "aromate"];

const CAT_LABEL: Record<string, string> = {
  tous: "Tout",
  ...CATEGORY_LABELS,
};

const ORDER: ActionType[] = ["semis", "plantation", "recolte"];

function cellActions(
  semis: number[],
  plantation: number[],
  recolte: number[],
  month: number
): ActionType[] {
  const a: ActionType[] = [];
  if (semis.includes(month)) a.push("semis");
  if (plantation.includes(month)) a.push("plantation");
  if (recolte.includes(month)) a.push("recolte");
  return a;
}

export default function CalendarGrid() {
  const [filter, setFilter] = useState<Category | "tous">("tous");
  const [activeActions, setActiveActions] = useState<Set<ActionType>>(
    () => new Set(ORDER)
  );
  const { offset } = useClimate();
  const currentMonth = getCurrentMonth();

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
            {plants.map((plant) => (
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
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                  const actions = cellActions(
                    shiftMonths(plant.semis, offset),
                    shiftMonths(plant.plantation, offset),
                    shiftMonths(plant.recolte, offset),
                    month
                  ).filter(isActive);
                  return (
                    <td
                      key={month}
                      className={`px-1 py-1.5 ${
                        month === currentMonth ? "bg-emerald-50/60 dark:bg-zinc-800/60" : ""
                      }`}
                    >
                      <div className="flex justify-center gap-0.5">
                        {actions.map((a) => (
                          <span
                            key={a}
                            title={ACTION_COLORS[a].label}
                            className={`h-3.5 w-3.5 rounded-sm ${ACTION_COLORS[a].dot}`}
                          />
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
