import { PLANTS } from "./plants";
import { ActionType, Plant, monthToDecades } from "./types";

// Primitives pures de décade : définies dans types.ts (sans import → pas de
// cycle, réutilisables par plants.ts). Ré-exportées ici par commodité.
export { monthToDecades, decadeMonth, decadePart } from "./types";

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1; // 1-12
}

/**
 * Décade courante (1..36) d'après la date du jour.
 * Jours 1-10 → début, 11-20 → mi, 21+ → fin.
 */
export function getCurrentDecade(): number {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const part = day <= 10 ? 0 : day <= 20 ? 1 : 2;
  return (month - 1) * 3 + part + 1;
}

/**
 * Décale une liste de décades selon la zone climatique.
 * `offset` est exprimé en mois (comme `shiftMonths`) et converti en décades.
 */
export function shiftDecades(decades: number[], offset: number): number[] {
  if (!offset) return decades;
  const shift = offset * 3;
  const shifted = decades.map((d) => (((d - 1 + shift) % 36) + 36) % 36 + 1);
  return Array.from(new Set(shifted)).sort((a, b) => a - b);
}

/**
 * Décades d'une plante pour une action : utilise la précision décadaire si
 * elle est fournie, sinon développe les mois pleins en décades.
 */
export function decadesForAction(plant: Plant, action: ActionType): number[] {
  const fine =
    action === "semis"
      ? plant.semisD
      : action === "plantation"
        ? plant.plantationD
        : plant.recolteD;
  if (fine && fine.length) return [...fine].sort((a, b) => a - b);
  const base =
    action === "semis"
      ? plant.semis
      : action === "plantation"
        ? plant.plantation
        : plant.recolte;
  return base.flatMap(monthToDecades);
}

/** Décades d'une plante pour une action, ajustées à la zone climatique. */
export function adjustedDecades(
  plant: Plant,
  action: ActionType,
  offset: number
): number[] {
  return shiftDecades(decadesForAction(plant, action), offset);
}

/**
 * Décades actives par action pour une plante, en Sets (lookup O(1)), ajustées
 * à la zone. Mutualisé entre la grille annuelle et la fiche plante.
 */
export function adjustedDecadeSets(
  plant: Plant,
  offset: number
): Record<ActionType, Set<number>> {
  return {
    semis: new Set(adjustedDecades(plant, "semis", offset)),
    plantation: new Set(adjustedDecades(plant, "plantation", offset)),
    recolte: new Set(adjustedDecades(plant, "recolte", offset)),
  };
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
