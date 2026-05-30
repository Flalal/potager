import { describe, it, expect } from "vitest";
import { wateringAdvice, summarize, openMeteoUrl } from "./weather";

describe("wateringAdvice", () => {
  it("inutile d'arroser si pluie abondante", () => {
    expect(wateringAdvice({ precipitationMm: 8, tempMaxC: 20 }).level).toBe(
      "skip"
    );
  });

  it("urgent si chaud et sec", () => {
    expect(wateringAdvice({ precipitationMm: 0, tempMaxC: 31 }).level).toBe(
      "urgent"
    );
  });

  it("arrosage léger si pluie modérée", () => {
    expect(wateringAdvice({ precipitationMm: 2, tempMaxC: 22 }).level).toBe(
      "ok"
    );
  });

  it("arroser si sec mais pas caniculaire", () => {
    expect(wateringAdvice({ precipitationMm: 0, tempMaxC: 22 }).level).toBe(
      "water"
    );
  });

  it("la pluie l'emporte même par forte chaleur", () => {
    expect(wateringAdvice({ precipitationMm: 6, tempMaxC: 33 }).level).toBe(
      "skip"
    );
  });
});

describe("summarize", () => {
  it("cumule la pluie et prend la T° max", () => {
    const res = summarize({
      daily: {
        precipitation_sum: [1.5, 2.5],
        temperature_2m_max: [24, 27],
      },
    });
    expect(res).toEqual({ precipitationMm: 4, tempMaxC: 27 });
  });

  it("renvoie null si données manquantes", () => {
    expect(summarize({})).toBeNull();
    expect(summarize({ daily: { precipitation_sum: [1] } })).toBeNull();
  });
});

describe("openMeteoUrl", () => {
  it("construit une URL Open-Meteo valide", () => {
    const url = openMeteoUrl(48.8566, 2.3522);
    expect(url).toContain("api.open-meteo.com");
    expect(url).toContain("latitude=48.857");
    expect(url).toContain("daily=precipitation_sum");
  });
});
