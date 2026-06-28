type ExchangeRates = {
  base: string;
  date: string;
  rates: Record<string, number>;
};

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=EUR,COP,PEN", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Error al obtener tipos de cambio");
  return res.json();
}

export function convertirMonto(monto: number, tasa: number): number {
  return monto * tasa;
}
