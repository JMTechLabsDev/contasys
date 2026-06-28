import { describe, it, expect, vi, beforeEach } from "vitest";

describe("fetchExchangeRates", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna datos de la API exitosamente", async () => {
    const mockData = {
      base: "USD",
      date: "2026-06-26",
      rates: { EUR: 0.9245, COP: 4150, PEN: 3.75 },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { fetchExchangeRates } = await import("@/lib/exchange-rates");
    const result = await fetchExchangeRates();

    expect(result.base).toBe("USD");
    expect(result.rates.EUR).toBe(0.9245);
    expect(result.rates.COP).toBe(4150);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.frankfurter.app/latest?from=USD&to=EUR,COP,PEN",
      expect.objectContaining({ next: { revalidate: 3600 } }),
    );
  });

  it("lanza error cuando la API falla", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const { fetchExchangeRates } = await import("@/lib/exchange-rates");
    await expect(fetchExchangeRates()).rejects.toThrow("Error al obtener tipos de cambio");
  });

  it("lanza error cuando hay network failure", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const { fetchExchangeRates } = await import("@/lib/exchange-rates");
    await expect(fetchExchangeRates()).rejects.toThrow("Network error");
  });
});
