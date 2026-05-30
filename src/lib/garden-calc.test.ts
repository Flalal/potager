import { describe, it, expect } from "vitest";
import { expectedHarvestMonth } from "./garden-calc";
import { getPlantById } from "./plants";
import type { Plant } from "./types";

const base = getPlantById("tomate")!;

describe("expectedHarvestMonth", () => {
  it("renvoie le mois de récolte le plus proche après plantation", () => {
    const plant: Plant = { ...base, recolte: [7, 8, 9] };
    // planté en mai (05) → première récolte en juillet (7)
    expect(expectedHarvestMonth(plant, "2026-05-15", 0)).toBe(7);
  });

  it("gère le passage à l'année suivante", () => {
    const plant: Plant = { ...base, recolte: [2] };
    // planté en novembre → récolte en février (cyclique)
    expect(expectedHarvestMonth(plant, "2026-11-01", 0)).toBe(2);
  });

  it("applique le décalage de zone", () => {
    const plant: Plant = { ...base, recolte: [7] };
    // offset +1 décale la récolte à août → planté en mai → 8
    expect(expectedHarvestMonth(plant, "2026-05-01", 1)).toBe(8);
  });

  it("renvoie null sans récolte ou date invalide", () => {
    expect(expectedHarvestMonth({ ...base, recolte: [] }, "2026-05-01", 0)).toBeNull();
    expect(expectedHarvestMonth(base, "pas-une-date", 0)).toBeNull();
  });
});
