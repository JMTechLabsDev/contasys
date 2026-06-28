import { describe, it, expect } from "vitest";
import { clienteSchema } from "@/lib/validations/cliente";

describe("clienteSchema", () => {
  const valido = {
    tipoIdentificacion: "cedula",
    identificacion: "1712345678",
    nombre: "Juan Pérez",
    razonSocial: "",
    email: "juan@example.com",
    telefono: "0999999999",
    direccion: "Av. Siempre Viva 123",
    ciudad: "Quito",
    provincia: "Pichincha",
    etiquetas: [],
  };

  it("acepta un cliente válido", () => {
    const result = clienteSchema.safeParse(valido);
    expect(result.success).toBe(true);
  });

  it("rechaza email inválido", () => {
    const result = clienteSchema.safeParse({ ...valido, email: "no-es-email" });
    expect(result.success).toBe(false);
  });

  it("rechaza nombre vacío", () => {
    const result = clienteSchema.safeParse({ ...valido, nombre: "" });
    expect(result.success).toBe(false);
  });

  it("acepta tipoIdentificacion = ruc", () => {
    const result = clienteSchema.safeParse({ ...valido, tipoIdentificacion: "ruc", identificacion: "1712345678001" });
    expect(result.success).toBe(true);
  });

  it("rechaza tipoIdentificacion inválido", () => {
    const result = clienteSchema.safeParse({ ...valido, tipoIdentificacion: "passport" });
    expect(result.success).toBe(false);
  });

  it("acepta campos opcionales vacíos", () => {
    const result = clienteSchema.safeParse({ ...valido, email: "", telefono: "", direccion: "", ciudad: "", provincia: "" });
    expect(result.success).toBe(true);
  });
});
