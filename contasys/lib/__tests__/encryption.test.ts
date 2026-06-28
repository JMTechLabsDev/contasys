import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "@/lib/encryption";

describe("encrypt / decrypt", () => {
  const mensaje = "datos-sensibles-ejemplo";

  it("encripta y desencripta correctamente", () => {
    const encrypted = encrypt(mensaje);
    expect(encrypted).not.toBe(mensaje);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(mensaje);
  });

  it("produce diferentes ciphertexts para el mismo mensaje (IV único)", () => {
    const a = encrypt(mensaje);
    const b = encrypt(mensaje);
    expect(a).not.toBe(b);
  });

  it("lanza error al desencriptar con datos corruptos", () => {
    expect(() => decrypt("datos-invalidos")).toThrow();
  });
});
