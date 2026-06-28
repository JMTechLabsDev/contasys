import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, empresaSchema } from "@/lib/validations/auth";

describe("loginSchema", () => {
  it("acepta credenciales válidas", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "123456" });
    expect(result.success).toBe(true);
  });

  it("rechaza email inválido", () => {
    const result = loginSchema.safeParse({ email: "invalido", password: "123456" });
    expect(result.success).toBe(false);
  });

  it("rechaza password corto", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "123" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("acepta registro válido", () => {
    const result = registerSchema.safeParse({
      nombre: "Juan Pérez",
      email: "juan@example.com",
      password: "Password123!",
      confirmarPassword: "Password123!",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza contraseñas que no coinciden", () => {
    const result = registerSchema.safeParse({
      nombre: "Juan",
      email: "juan@example.com",
      password: "Password123!",
      confirmarPassword: "Diferente123!",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza nombre muy corto", () => {
    const result = registerSchema.safeParse({
      nombre: "A",
      email: "juan@example.com",
      password: "Password123!",
      confirmarPassword: "Password123!",
    });
    expect(result.success).toBe(false);
  });
});

describe("empresaSchema", () => {
  it("acepta empresa válida", () => {
    const result = empresaSchema.safeParse({
      nombre: "Mi Empresa",
      razonSocial: "Mi Empresa S.A.S.",
      ruc: "1712345678001",
      email: "info@empresa.com",
      telefono: "0999999999",
      direccion: "Av. Principal",
      ciudad: "Quito",
      provincia: "Pichincha",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza RUC inválido (corto)", () => {
    const result = empresaSchema.safeParse({ nombre: "Test", razonSocial: "Test S.A.", ruc: "12345" });
    expect(result.success).toBe(false);
  });
});
