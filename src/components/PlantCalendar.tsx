"use client";

import {
  Plant,
  MONTHS_SHORT,
  MONTHS_FR,
  ACTION_ORDER as ORDER,
  DECADE_PART_LABELS,
  DECADE_PARTS as PARTS,
} from "@/lib/types";
import { ACTION_COLORS, adjustedDecadeSets, monthToDecades } from "@/lib/calendar";
import { useClimate, ZONE_LABELS } from "@/lib/climate";

export default function PlantCalendar({ plant }: { plant: Plant }) {
  const { offset, zone } = useClimate();

  const decades = adjustedDecadeSets(plant, offset);

  return (
    <section className="rounded-xl border border-emerald-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold text-emerald-900 dark:text-emerald-50">Calendrier</h2>
        <span className="text-xs text-emerald-700/70 dark:text-emerald-300/70">
          Zone : {ZONE_LABELS[zone]}
        </span>
      </div>
      <div className="space-y-2">
        {ORDER.map((action) => (
          <div key={action} className="flex items-center gap-2">
            <span className="w-24 shrink-0 text-sm font-medium text-emerald-800 dark:text-emerald-100">
              {ACTION_COLORS[action].label}
            </span>
            <div className="flex flex-1 gap-1">
              {MONTHS_SHORT.map((m, i) => {
                const month = i + 1;
                return (
                  <div key={m} className="flex flex-1 flex-col items-center gap-0.5">
                    <div className="flex w-full gap-px">
                      {PARTS.map((part, pi) => {
                        const decade = monthToDecades(month)[pi];
                        const active = decades[action].has(decade);
                        return (
                          <div
                            key={part}
                            title={`${MONTHS_FR[i]} — ${DECADE_PART_LABELS[part]}`}
                            className={`h-7 flex-1 rounded-[3px] ${
                              active
                                ? ACTION_COLORS[action].bg
                                : "bg-emerald-50/50 dark:bg-zinc-800/50"
                            }`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-[9px] text-emerald-700/50 dark:text-emerald-300/50">
                      {m[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-emerald-700/70 dark:text-emerald-300/70">
        Chaque mois est découpé en 3 (début / mi / fin). Les cases colorées
        indiquent la période précise.
      </p>
      {plant.semis.length === 0 && (
        <p className="mt-2 text-xs text-emerald-700/70 dark:text-emerald-300/70">
          Cette plante se cultive à partir de plants/arbustes achetés, pas par
          semis.
        </p>
      )}
    </section>
  );
}
