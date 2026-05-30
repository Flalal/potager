"use client";

import { useState } from "react";
import { getCurrentMonth, plantsByActionForMonthAdjusted } from "@/lib/calendar";
import { useClimate } from "@/lib/climate";
import { MONTHS_FR, ActionType } from "@/lib/types";
import { quantityLabel } from "@/lib/quantities";
import { buyLinks } from "@/lib/shopping";
import type { Plant } from "@/lib/types";
import PlantAvatar from "./PlantAvatar";

const SECTIONS: { action: ActionType; titre: string; verbe: string }[] = [
  { action: "semis", titre: "Graines à semer", verbe: "graines" },
  { action: "plantation", titre: "Plants à repiquer", verbe: "plants" },
];

function Row({ plant, people }: { plant: Plant; people: number }) {
  const compare = buyLinks(plant).find((l) => l.compare);
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <PlantAvatar emoji={plant.emoji} category={plant.category} size="sm" />
      <div className="min-w-[120px] flex-1">
        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-50">
          {plant.nom}
        </p>
        <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
          {quantityLabel(plant, people)}
        </p>
      </div>
      {compare && (
        <a
          href={compare.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 dark:bg-zinc-800 dark:text-emerald-300 dark:hover:bg-zinc-700"
        >
          🛒 Comparer les prix
        </a>
      )}
    </li>
  );
}

export default function Courses() {
  const { offset } = useClimate();
  const [people, setPeople] = useState(4);
  const month = getCurrentMonth();
  const moisNom = MONTHS_FR[month - 1];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-100 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <span className="text-emerald-800/80 dark:text-emerald-100/80">
          Quantités pour
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPeople((n) => Math.max(1, n - 1))}
            className="h-7 w-7 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-zinc-800 dark:text-emerald-100 dark:hover:bg-zinc-700"
          >
            −
          </button>
          <span className="w-8 text-center font-semibold text-emerald-900 dark:text-emerald-50">
            {people}
          </span>
          <button
            onClick={() => setPeople((n) => Math.min(20, n + 1))}
            className="h-7 w-7 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-zinc-800 dark:text-emerald-100 dark:hover:bg-zinc-700"
          >
            +
          </button>
        </div>
        <span className="text-emerald-800/80 dark:text-emerald-100/80">
          personne{people > 1 ? "s" : ""}
        </span>
      </div>

      {SECTIONS.map((section) => {
        const plants = plantsByActionForMonthAdjusted(
          section.action,
          month,
          offset
        );
        return (
          <section key={section.action}>
            <h2 className="mb-3 text-lg font-bold text-emerald-900 dark:text-emerald-50">
              {section.titre}
              <span className="ml-2 text-sm font-normal text-emerald-700/70 dark:text-emerald-300/70">
                {plants.length} en {moisNom}
              </span>
            </h2>
            {plants.length === 0 ? (
              <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-4 text-sm text-emerald-700/70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-emerald-300/70">
                Rien à acheter en {section.verbe} ce mois-ci.
              </p>
            ) : (
              <ul className="space-y-2">
                {plants.map((p) => (
                  <Row key={p.id} plant={p} people={people} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
