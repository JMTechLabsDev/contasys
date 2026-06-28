import { describe, it, expect } from "vitest";
import { hashString, generateApiKey } from "@/lib/hash";

describe("hashString", () => {
  it("genera hash SHA-256 de 64 caracteres hex", () => {
    const hash = hashString("test-key");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("produce el mismo hash para el mismo input", () => {
    const a = hashString("hello");
    const b = hashString("hello");
    expect(a).toBe(b);
  });

  it("produce diferente hash para diferentes inputs", () => {
    const a = hashString("abc");
    const b = hashString("xyz");
    expect(a).not.toBe(b);
  });
});

describe("generateApiKey", () => {
  it("genera una clave de 64 caracteres hex", () => {
    const key = generateApiKey();
    expect(key.length).toBeGreaterThanOrEqual(64);
    expect(key).toMatch(/^[a-f0-9]+$/);
  });

  it("genera claves diferentes cada vez", () => {
    const a = generateApiKey();
    const b = generateApiKey();
    expect(a).not.toBe(b);
  });
});
