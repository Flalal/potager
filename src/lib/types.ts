export type Category = "legume" | "fruit" | "aromate";
export type Exposition = "soleil" | "mi-ombre" | "ombre";
export type Difficulty = "facile" | "moyen" | "difficile";
export type BesoinEau = "faible" | "moyen" | "eleve";

/** Mois codés de 1 (janvier) à 12 (décembre). */
export type Month = number;

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
