import { describe, it, expect } from "vitest";
import { productoSchema } from "@/lib/validations/producto";

describe("productoSchema", () => {
  const valido = {
    sku: "PROD-001",
    nombre: "Laptop Pro",
    descripcion: "Laptop de alta gama",
    precio: 1500.00,
    costo: 1000.00,
    categoria: "Electrónicos",
    impuesto: "15%",
    stock: 10,
  };

  it("acepta un producto válido", () => {
    const result = productoSchema.safeParse(valido);
    expect(result.success).toBe(true);
  });

  it("rechaza precio negativo", () => {
    const result = productoSchema.safeParse({ ...valido, precio: -10 });
    expect(result.success).toBe(false);
  });

  it("rechaza impuesto inválido", () => {
    const result = productoSchema.safeParse({ ...valido, impuesto: "25%" });
    expect(result.success).toBe(false);
  });

  it("acepta costo opcional", () => {
    const result = productoSchema.safeParse({ ...valido, costo: undefined });
    expect(result.success).toBe(true);
  });

  it("rechaza nombre vacío", () => {
    const result = productoSchema.safeParse({ ...valido, nombre: "" });
    expect(result.success).toBe(false);
  });

  it("acepta stock en 0", () => {
    const result = productoSchema.safeParse({ ...valido, stock: 0 });
    expect(result.success).toBe(true);
  });

  it("rechaza stock negativo", () => {
    const result = productoSchema.safeParse({ ...valido, stock: -5 });
    expect(result.success).toBe(false);
  });
});
