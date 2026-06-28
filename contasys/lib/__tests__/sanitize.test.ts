import { describe, it, expect } from "vitest";
import { sanitizarString, sanitizarOpcional, limpiarInput } from "@/lib/sanitize";

describe("sanitizarString", () => {
  it("escapa HTML", () => {
    expect(sanitizarString("<script>alert('xss')</script>")).toBe("&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;");
  });

  it("escapa & y comillas", () => {
    expect(sanitizarString('"Hello" & world')).toBe("&quot;Hello&quot; &amp; world");
  });

  it("hace trim del string", () => {
    expect(sanitizarString("  hola  ")).toBe("hola");
  });

  it("mantiene texto normal", () => {
    expect(sanitizarString("Hola mundo")).toBe("Hola mundo");
  });
});

describe("sanitizarOpcional", () => {
  it("retorna null para input nulo", () => {
    expect(sanitizarOpcional(null)).toBeNull();
  });

  it("sanitiza string válido", () => {
    expect(sanitizarOpcional("hola")).toBe("hola");
  });
});

describe("limpiarInput", () => {
  it("sanitiza campos string específicos", () => {
    const input = { nombre: "<b>Juan</b>", edad: 30 };
    const result = limpiarInput(input, ["nombre"]);
    expect(result.nombre).toBe("&lt;b&gt;Juan&lt;/b&gt;");
    expect(result.edad).toBe(30);
  });
});
