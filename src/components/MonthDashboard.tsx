"use client";

import { useState } from "react";
import Link from "next/link";
import { MONTHS_FR, ActionType } from "@/lib/types";
import {
  getCurrentMonth,
  plantsByActionForMonthAdjusted,
  ACTION_COLORS,
} from "@/lib/calendar";
import { useClimate, ZONE_LABELS } from "@/lib/climate";
import PlantCard from "@/components/PlantCard";

const SECTIONS: { action: ActionType; titre: string; intro: string }[] = [
  {
    action: "semis",
    titre: "À semer",
    intro: "Mettez ces graines en terre (ou sous abri) ce mois-ci.",
  },
  {
    action: "plantation",
    titre: "À planter",
    intro: "Repiquez ou installez ces plants au jardin.",
  },
  {
    action: "recolte",
    titre: "À récolter",
    intro: "C'est la saison : ces cultures arrivent à maturité.",
  },
];

export default function MonthDashboard() {
  const { offset, zone } = useClimate();
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const month = getCurrentMonth();
  const moisNom = MONTHS_FR[month - 1];

  const visibleSections = activeAction
    ? SECTIONS.filter((s) => s.action === activeAction)
    : SECTIONS;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-emerald-600 to-green-500 p-6 text-white sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-100">
          Nous sommes en
        </p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{moisNom}</h1>
        <p className="mt-2 max-w-xl text-emerald-50">
          Voici ce que vous pouvez faire au potager ce mois-ci, pour la zone «{" "}
          {ZONE_LABELS[zone]} ». Cliquez sur une action pour filtrer, ou sur une
          plante pour sa fiche détaillée.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {SECTIONS.map((s) => {
            const count = plantsByActionForMonthAdjusted(
              s.action,
              month,
              offset
            ).length;
            const isActive = activeAction === s.action;
            return (
              <button
                key={s.action}
                onClick={() =>
                  setActiveAction((prev) =>
                    prev === s.action ? null : s.action
                  )
                }
                aria-pressed={isActive}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition ${
                  isActive
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${ACTION_COLORS[s.action].dot}`}
                />
                {count} {s.titre.toLowerCase()}
              </button>
            );
          })}
          {activeAction && (
            <button
              onClick={() => setActiveAction(null)}
              className="rounded-full px-3 py-1 text-emerald-50 underline-offset-2 hover:underline"
            >
              Tout voir
            </button>
          )}
        </div>
      </section>

      {visibleSections.map((section) => {
        const plants = plantsByActionForMonthAdjusted(
          section.action,
          month,
          offset
        );
        return (
          <section key={section.action}>
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`h-3 w-3 rounded-full ${ACTION_COLORS[section.action].dot}`}
              />
              <h2 className="text-xl font-bold text-emerald-900">
                {section.titre}
                <span className="ml-2 text-sm font-normal text-emerald-700/70">
                  {plants.length}
                </span>
              </h2>
            </div>
            <p className="mb-4 text-sm text-emerald-800/80">{section.intro}</p>
            {plants.length === 0 ? (
              <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-4 text-sm text-emerald-700/70">
                Rien de prévu pour {section.titre.toLowerCase()} en {moisNom}.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {plants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    badge={section.action}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}

      <section className="rounded-xl border border-emerald-100 bg-white p-5 text-center">
        <p className="text-emerald-800">
          Envie de voir l&apos;année entière ?{" "}
          <Link
            href="/calendrier"
            className="font-semibold text-emerald-600 underline-offset-2 hover:underline"
          >
            Ouvrir le calendrier complet
          </Link>
        </p>
      </section>
    </div>
  );
}
