import { describe, it, expect } from "vitest";
import { facturaSchema, facturaItemSchema } from "@/lib/validations/factura";

describe("facturaItemSchema", () => {
  it("acepta un item válido", () => {
    const result = facturaItemSchema.safeParse({
      descripcion: "Producto de prueba",
      cantidad: 2,
      precioUnitario: 25.50,
      descuento: 0,
      impuesto: "15%",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza cantidad negativa", () => {
    const result = facturaItemSchema.safeParse({
      descripcion: "Test",
      cantidad: -1,
      precioUnitario: 10,
      descuento: 0,
      impuesto: "15%",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza precio unitario negativo", () => {
    const result = facturaItemSchema.safeParse({
      descripcion: "Test",
      cantidad: 1,
      precioUnitario: -5,
      descuento: 0,
      impuesto: "15%",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza descuento negativo", () => {
    const result = facturaItemSchema.safeParse({
      descripcion: "Test",
      cantidad: 1,
      precioUnitario: 10,
      descuento: -1,
      impuesto: "15%",
    });
    expect(result.success).toBe(false);
  });
});

describe("facturaSchema", () => {
  const valida = {
    clienteId: "uuid-cliente",
    metodoPago: "transferencia",
    observaciones: "",
    items: [
      { descripcion: "Item 1", cantidad: 1, precioUnitario: 100, descuento: 0, impuesto: "15%" },
    ],
  };

  it("acepta una factura válida", () => {
    const result = facturaSchema.safeParse(valida);
    expect(result.success).toBe(true);
  });

  it("rechaza factura sin items", () => {
    const result = facturaSchema.safeParse({ ...valida, items: [] });
    expect(result.success).toBe(false);
  });

  it("rechaza descuentoGlobal negativo", () => {
    const result = facturaSchema.safeParse({ ...valida, descuentoGlobal: -1 });
    expect(result.success).toBe(false);
  });

  it("asigna valores por defecto", () => {
    const result = facturaSchema.safeParse({ clienteId: "x", items: [{ descripcion: "A", cantidad: 1, precioUnitario: 10 }] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tipoComprobante).toBe("factura");
      expect(result.data.descuentoGlobal).toBe(0);
    }
  });
});
