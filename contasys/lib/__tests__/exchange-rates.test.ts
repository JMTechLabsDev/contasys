import { describe, it, expect } from "vitest";
import { convertirMonto } from "@/lib/exchange-rates";

describe("convertirMonto", () => {
  it("convierte USD a EUR correctamente", () => {
    expect(convertirMonto(100, 0.9245)).toBeCloseTo(92.45, 2);
  });

  it("retorna 0 para monto 0", () => {
    expect(convertirMonto(0, 4150)).toBe(0);
  });

  it("maneja tasa 1 (misma moneda)", () => {
    expect(convertirMonto(50, 1)).toBe(50);
  });
});
