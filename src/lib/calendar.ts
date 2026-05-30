import { PLANTS } from "./plants";
import { ActionType, Plant } from "./types";

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1; // 1-12
}

/**
 * Décale une liste de mois selon la zone climatique.
 * offset > 0 = plus tard dans l'année (nord), offset < 0 = plus tôt (sud).
 */
export function shiftMonths(months: number[], offset: number): number[] {
  if (!offset) return months;
  const shifted = months.map((m) => (((m - 1 + offset) % 12) + 12) % 12 + 1);
  return Array.from(new Set(shifted)).sort((a, b) => a - b);
}

/** Renvoie les mois d'une plante pour une action, ajustés à la zone. */
export function adjustedMonths(
  plant: Plant,
  action: ActionType,
  offset: number
): number[] {
  const base =
    action === "semis"
      ? plant.semis
      : action === "plantation"
        ? plant.plantation
        : plant.recolte;
  return shiftMonths(base, offset);
}

/** Plantes ayant une action donnée à un mois donné, en tenant compte de la zone. */
export function plantsByActionForMonthAdjusted(
  action: ActionType,
  month: number,
  offset: number
): Plant[] {
  return PLANTS.filter((p) => adjustedMonths(p, action, offset).includes(month));
}

/** Renvoie les actions (semis/plantation/récolte) d'une plante pour un mois donné. */
export function actionsForMonth(plant: Plant, month: number): ActionType[] {
  const actions: ActionType[] = [];
  if (plant.semis.includes(month)) actions.push("semis");
  if (plant.plantation.includes(month)) actions.push("plantation");
  if (plant.recolte.includes(month)) actions.push("recolte");
  return actions;
}

/** Toutes les plantes ayant une action donnée pour un mois donné. */
export function plantsByActionForMonth(
  action: ActionType,
  month: number
): Plant[] {
  return PLANTS.filter((p) => {
    if (action === "semis") return p.semis.includes(month);
    if (action === "plantation") return p.plantation.includes(month);
    return p.recolte.includes(month);
  });
}

function looseMatch(name: string, plantNom: string): boolean {
  const a = name.toLowerCase();
  const b = plantNom.toLowerCase();
  // gère "Laitue / Salade" vs "Laitue", "Pomme de terre" vs "pomme de terre"
  return b.split(/[/]/).some((part) => {
    const p = part.trim();
    return p.length > 2 && (a.includes(p) || p.includes(a));
  });
}

/** Deux plantes sont incompatibles si l'une cite l'autre dans ses compagnons défavorables. */
export function areIncompatible(a: Plant, b: Plant): boolean {
  if (a.id === b.id) return false;
  const aRejectsB = a.compagnonsDefavorables.some((n) => looseMatch(n, b.nom));
  const bRejectsA = b.compagnonsDefavorables.some((n) => looseMatch(n, a.nom));
  return aRejectsB || bRejectsA;
}

export type TaskKind = "recolte" | "soin" | "arrosage";

export interface MonthlyTask {
  label: string;
  kind: TaskKind;
}

/**
 * Tâches concrètes à faire ce mois-ci pour une plante déjà installée,
 * ajustées à la zone climatique.
 */
export function monthlyTasks(
  plant: Plant,
  month: number,
  offset: number
): MonthlyTask[] {
  const tasks: MonthlyTask[] = [];

  if (shiftMonths(plant.recolte, offset).includes(month)) {
    tasks.push({ label: "🧺 À récolter", kind: "recolte" });
  }

  for (const soin of plant.soins) {
    if (shiftMonths(soin.mois, offset).includes(month)) {
      tasks.push({ label: soin.titre, kind: "soin" });
    }
  }

  const summer = shiftMonths([6, 7, 8], offset);
  if (plant.besoinEau === "eleve" && summer.includes(month)) {
    tasks.push({
      label: "💧 Arroser régulièrement (besoin élevé)",
      kind: "arrosage",
    });
  }

  return tasks;
}

export const TASK_KIND_STYLE: Record<TaskKind, string> = {
  recolte:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
  soin: "bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  arrosage: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
};

export const ACTION_COLORS: Record<
  ActionType,
  { bg: string; text: string; dot: string; label: string }
> = {
  semis: {
    bg: "bg-amber-100 dark:bg-amber-900",
    text: "text-amber-800 dark:text-amber-200",
    dot: "bg-amber-500",
    label: "Semis",
  },
  plantation: {
    bg: "bg-sky-100 dark:bg-sky-900",
    text: "text-sky-800 dark:text-sky-200",
    dot: "bg-sky-500",
    label: "Plantation",
  },
  recolte: {
    bg: "bg-emerald-100 dark:bg-emerald-900",
    text: "text-emerald-800 dark:text-emerald-100",
    dot: "bg-emerald-600",
    label: "Récolte",
  },
};
