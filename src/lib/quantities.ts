import type { Plant } from "./types";

/**
 * Quantités indicatives à cultiver, en « pieds » (ou plants) par personne.
 * Valeurs approximatives pour un foyer qui consomme régulièrement le légume.
 */
const PER_PERSON: Record<string, number> = {
  tomate: 2,
  courgette: 1,
  concombre: 1,
  poivron: 2,
  aubergine: 2,
  laitue: 4,
  radis: 20,
  carotte: 15,
  "haricot-vert": 10,
  "petit-pois": 15,
  "pomme-de-terre": 8,
  oignon: 15,
  poireau: 10,
  betterave: 8,
  epinard: 6,
  chou: 2,
  courge: 1,
  melon: 1,
  navet: 8,
  blette: 2,
  celeri: 2,
  fenouil: 3,
  mache: 10,
  roquette: 8,
  ail: 10,
  echalote: 8,
  fraise: 6,
  framboise: 2,
  cassis: 1,
  groseille: 1,
  rhubarbe: 1,
};

const CATEGORY_DEFAULT: Record<Plant["category"], number> = {
  legume: 4,
  aromate: 1,
  fruit: 1,
};

export interface QuantityHint {
  count: number;
  unit: string;
}

/** Quantité conseillée pour `people` personnes. */
export function recommendedQuantity(
  plant: Plant,
  people: number
): QuantityHint {
  const perPerson = PER_PERSON[plant.id] ?? CATEGORY_DEFAULT[plant.category];
  const count = Math.max(1, Math.round(perPerson * Math.max(1, people)));
  const unit =
    plant.category === "aromate"
      ? count > 1
        ? "plants"
        : "plant"
      : count > 1
        ? "pieds"
        : "pied";
  return { count, unit };
}

/** Phrase prête à afficher : « ≈ 8 pieds pour 4 pers. ». */
export function quantityLabel(plant: Plant, people: number): string {
  const { count, unit } = recommendedQuantity(plant, people);
  return `≈ ${count} ${unit} pour ${people} pers.`;
}
