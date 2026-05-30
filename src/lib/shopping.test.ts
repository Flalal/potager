import { describe, it, expect } from "vitest";
import { buyLinks, searchTerm } from "./shopping";
import { getPlantById } from "./plants";

describe("searchTerm", () => {
  it("utilise « graines de » pour un légume", () => {
    const carotte = getPlantById("carotte")!;
    expect(searchTerm(carotte)).toBe("graines de Carotte");
  });

  it("utilise « plant de » pour un fruit", () => {
    const framboise = getPlantById("framboise")!;
    expect(searchTerm(framboise)).toBe("plant de Framboise");
  });

  it("ne garde que la première partie d'un nom composé", () => {
    const courge = getPlantById("courge")!; // « Courge / Potimarron »
    expect(searchTerm(courge)).toBe("graines de Courge");
  });
});

describe("buyLinks", () => {
  it("renvoie un comparateur en premier", () => {
    const links = buyLinks(getPlantById("tomate")!);
    expect(links[0].compare).toBe(true);
    expect(links[0].url).toContain("tbm=shop");
  });

  it("encode le terme de recherche dans chaque URL", () => {
    const links = buyLinks(getPlantById("tomate")!);
    for (const l of links) {
      expect(l.url).toContain(encodeURIComponent("graines de Tomate"));
    }
    expect(links.length).toBeGreaterThanOrEqual(3);
  });
});
