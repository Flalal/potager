"use client";

import Link from "next/link";
import { useGarden } from "@/lib/garden";
import { getPlantById } from "@/lib/plants";
import { MONTHS_FR } from "@/lib/types";
import {
  getCurrentMonth,
  shiftMonths,
  monthlyTasks,
  TASK_KIND_STYLE,
} from "@/lib/calendar";
import { useClimate } from "@/lib/climate";
import PlantAvatar from "./PlantAvatar";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function MonJardin() {
  const { plantations, ready, remove } = useGarden();
  const { offset } = useClimate();
  const month = getCurrentMonth();

  if (!ready) {
    return (
      <p className="text-sm text-emerald-700/60 dark:text-emerald-300/60">Chargement de votre jardin…</p>
    );
  }

  if (plantations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-emerald-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 text-center">
        <p className="text-4xl">🪴</p>
        <p className="mt-3 font-semibold text-emerald-900 dark:text-emerald-50">
          Votre jardin est vide
        </p>
        <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-100/80">
          Ouvrez une fiche plante et cliquez sur « Ajouter à mon jardin » pour
          commencer le suivi.
        </p>
        <Link
          href="/plantes"
          className="mt-4 inline-block rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Parcourir les plantes
        </Link>
      </div>
    );
  }

  const sorted = [...plantations].sort((a, b) =>
    a.datePlantation < b.datePlantation ? 1 : -1
  );

  const totalTasks = sorted.reduce((n, p) => {
    const plant = getPlantById(p.plantId);
    return n + (plant ? monthlyTasks(plant, month, offset).length : 0);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-emerald-600 p-4 text-white">
        <p className="text-sm">
          <strong>{MONTHS_FR[month - 1]}</strong> —{" "}
          {totalTasks > 0
            ? `${totalTasks} tâche${totalTasks > 1 ? "s" : ""} à faire dans votre jardin ce mois-ci.`
            : "Rien d'urgent ce mois-ci, profitez-en !"}
        </p>
      </div>

      {sorted.map((p) => {
        const plant = getPlantById(p.plantId);
        if (!plant) return null;

        const tasks = monthlyTasks(plant, month, offset);
        const recolte = shiftMonths(plant.recolte, offset);
        const prochaineRecolte = recolte.find((m) => m >= month);

        return (
          <div
            key={p.uid}
            className="rounded-xl border border-emerald-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
          >
            <div className="flex flex-wrap items-center gap-4">
              <Link href={`/plantes/${plant.id}`}>
                <PlantAvatar
                  emoji={plant.emoji}
                  category={plant.category}
                  size="md"
                />
              </Link>
              <div className="min-w-[140px] flex-1">
                <Link
                  href={`/plantes/${plant.id}`}
                  className="font-semibold text-emerald-900 dark:text-emerald-50 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {plant.nom}
                </Link>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                  Planté le {formatDate(p.datePlantation)} · {p.quantite}{" "}
                  {p.quantite > 1 ? "plants" : "plant"}
                  {p.emplacement ? ` · ${p.emplacement}` : ""}
                </p>
              </div>

              <div className="text-sm">
                {recolte.includes(month) ? (
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-900 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-100">
                    🧺 Récolte en cours
                  </span>
                ) : prochaineRecolte ? (
                  <span className="rounded-full bg-emerald-50 dark:bg-zinc-800 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-300">
                    Récolte vers {MONTHS_FR[prochaineRecolte - 1]}
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 dark:bg-zinc-800 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-300">
                    Récolte passée cette année
                  </span>
                )}
              </div>

              <button
                onClick={() => remove(p.uid)}
                className="rounded-full px-2 py-1 text-xs text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950"
                title="Retirer de mon jardin"
              >
                Retirer
              </button>
            </div>

            {tasks.length > 0 && (
              <div className="mt-3 border-t border-emerald-50 dark:border-zinc-800 pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  À faire ce mois-ci
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {tasks.map((t, i) => (
                    <span
                      key={i}
                      className={`rounded-full px-2.5 py-1 text-xs ${TASK_KIND_STYLE[t.kind]}`}
                    >
                      {t.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
