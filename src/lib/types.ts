export type Category = "legume" | "fruit" | "aromate";
export type Exposition = "soleil" | "mi-ombre" | "ombre";
export type Difficulty = "facile" | "moyen" | "difficile";
export type BesoinEau = "faible" | "moyen" | "eleve";

/** Mois codés de 1 (janvier) à 12 (décembre). */
export type Month = number;

/**
 * Décade : tiers de mois, codée de 1 à 36. Pour un mois `m` :
 * `3m-2` = début (1-10), `3m-1` = mi (11-20), `3m` = fin (21-fin du mois).
 */
export type Decade = number;

export type DecadePart = "debut" | "milieu" | "fin";

/** Libellés courts des tiers de mois (pour les info-bulles et la légende). */
export const DECADE_PART_LABELS: Record<DecadePart, string> = {
  debut: "début",
  milieu: "mi",
  fin: "fin",
};

/** Ordre canonique des tiers de mois (début → mi → fin). */
export const DECADE_PARTS: DecadePart[] = ["debut", "milieu", "fin"];

/** Les 3 décades d'un mois (début, mi, fin), en codage 1..36. */
export function monthToDecades(month: number): number[] {
  const base = (month - 1) * 3;
  return [base + 1, base + 2, base + 3];
}

/** Mois (1..12) auquel appartient une décade (1..36). */
export function decadeMonth(decade: number): number {
  return Math.floor((decade - 1) / 3) + 1;
}

/** Tiers du mois d'une décade : 0 = début, 1 = mi, 2 = fin. */
export function decadePart(decade: number): number {
  return (decade - 1) % 3;
}

/** Tâche d'entretien récurrente, déclenchée certains mois de l'année. */
export interface CareTask {
  mois: Month[];
  titre: string;
}

export interface Plant {
  id: string;
  nom: string;
  category: Category;
  emoji: string;
  difficulty: Difficulty;
  exposition: Exposition;
  /** Mois où semer les graines (sous abri ou en pleine terre, précisé dans conseils). */
  semis: Month[];
  /** Mois où mettre en terre les plants / bulbes (repiquage, plantation). */
  plantation: Month[];
  /** Mois de récolte. */
  recolte: Month[];
  /**
   * Précision décadaire optionnelle (tiers de mois, 1..36). Si fournie, elle
   * affine l'affichage du calendrier ; sinon le mois plein est utilisé.
   * Les mois couverts doivent correspondre exactement au tableau `semis`.
   */
  semisD?: Decade[];
  /** Précision décadaire optionnelle de la plantation (voir `semisD`). */
  plantationD?: Decade[];
  /** Précision décadaire optionnelle de la récolte (voir `semisD`). */
  recolteD?: Decade[];
  arrosage: string;
  sol: string;
  espacement: string;
  /** Plantes qui s'entendent bien à proximité. */
  compagnonsFavorables: string[];
  /** Plantes à éviter à proximité. */
  compagnonsDefavorables: string[];
  conseils: string;
  /** Famille botanique, utile pour la rotation des cultures. */
  famille: string;
  /** Temps de levée / germination indicatif. */
  levee: string;
  /** Ravageurs et maladies courants. */
  ravageurs: string[];
  /** Besoin en eau, pour les rappels d'arrosage. */
  besoinEau: BesoinEau;
  /** Tâches d'entretien au fil de la saison. */
  soins: CareTask[];
}

export const BESOIN_EAU_LABELS: Record<BesoinEau, string> = {
  faible: "Faible",
  moyen: "Modéré",
  eleve: "Élevé",
};

export type ActionType = "semis" | "plantation" | "recolte";

/** Ordre canonique des actions (semis → plantation → récolte). */
export const ACTION_ORDER: ActionType[] = ["semis", "plantation", "recolte"];

export const CATEGORY_LABELS: Record<Category, string> = {
  legume: "Légume",
  fruit: "Fruit",
  aromate: "Aromate",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  facile: "Facile",
  moyen: "Moyen",
  difficile: "Difficile",
};

export const EXPOSITION_LABELS: Record<Exposition, string> = {
  soleil: "Plein soleil",
  "mi-ombre": "Mi-ombre",
  ombre: "Ombre",
};

export const ACTION_LABELS: Record<ActionType, string> = {
  semis: "Semis",
  plantation: "Plantation",
  recolte: "Récolte",
};

export const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export const MONTHS_SHORT = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];
