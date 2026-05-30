"use client";

import { Plant, MONTHS_SHORT, ActionType } from "@/lib/types";
import { ACTION_COLORS, shiftMonths } from "@/lib/calendar";
import { useClimate, ZONE_LABELS } from "@/lib/climate";

const ORDER: ActionType[] = ["semis", "plantation", "recolte"];

export default function PlantCalendar({ plant }: { plant: Plant }) {
  const { offset, zone } = useClimate();

  const months: Record<ActionType, number[]> = {
    semis: shiftMonths(plant.semis, offset),
    plantation: shiftMonths(plant.plantation, offset),
    recolte: shiftMonths(plant.recolte, offset),
  };

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
            <div className="flex flex-1 gap-0.5">
              {MONTHS_SHORT.map((m, i) => {
                const active = months[action].includes(i + 1);
                return (
                  <div
                    key={m}
                    title={m}
                    className={`flex h-7 flex-1 items-center justify-center rounded text-[10px] ${
                      active
                        ? `${ACTION_COLORS[action].bg} ${ACTION_COLORS[action].text} font-semibold`
                        : "bg-emerald-50/50 dark:bg-zinc-800/50 text-emerald-700/30 dark:text-emerald-300/40"
                    }`}
                  >
                    {m[0]}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {plant.semis.length === 0 && (
        <p className="mt-3 text-xs text-emerald-700/70 dark:text-emerald-300/70">
          Cette plante se cultive à partir de plants/arbustes achetés, pas par
          semis.
        </p>
      )}
    </section>
  );
}
