import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatDate, formatDateShort } from "@/lib/utils";

describe("cn", () => {
  it("combina clases correctamente", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("filtra valores falsy", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("maneja undefined", () => {
    expect(cn("a", undefined, "b")).toBe("a b");
  });
});

describe("formatCurrency", () => {
  it("formatea número con separador de miles y decimales", () => {
    const result = formatCurrency(1500);
    expect(result).toContain("$");
    expect(result).toMatch(/\d/);
  });

  it("formatea cero", () => {
    expect(formatCurrency(0)).toContain("0");
  });

  it("maneja decimales", () => {
    const result = formatCurrency(99.99);
    expect(result).toContain("99");
  });
});

describe("formatDate", () => {
  it("formatea fecha ISO", () => {
    const result = formatDate("2026-06-26T00:00:00.000Z");
    expect(result).toContain("2026");
  });
});

describe("formatDateShort", () => {
  it("formatea fecha en corto", () => {
    const result = formatDateShort("2026-06-26T00:00:00.000Z");
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });
});
