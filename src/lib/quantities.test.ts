import { describe, it, expect } from "vitest";
import { recommendedQuantity, quantityLabel } from "./quantities";
import { getPlantById } from "./plants";

describe("recommendedQuantity", () => {
  it("multiplie par le nombre de personnes", () => {
    const tomate = getPlantById("tomate")!; // 2/pers
    expect(recommendedQuantity(tomate, 4).count).toBe(8);
  });

  it("utilise le défaut de catégorie pour une plante non listée", () => {
    const sauge = getPlantById("sauge")!; // aromate → défaut 1
    expect(recommendedQuantity(sauge, 3).count).toBe(3);
  });

  it("au moins 1 pied", () => {
    const cassis = getPlantById("cassis")!; // 1/pers
    expect(recommendedQuantity(cassis, 1).count).toBeGreaterThanOrEqual(1);
  });

  it("accorde l'unité selon la catégorie", () => {
    expect(recommendedQuantity(getPlantById("basilic")!, 1).unit).toBe("plant");
    expect(recommendedQuantity(getPlantById("tomate")!, 4).unit).toBe("pieds");
  });

  it("quantityLabel est lisible", () => {
    expect(quantityLabel(getPlantById("tomate")!, 4)).toBe(
      "≈ 8 pieds pour 4 pers."
    );
  });
});
