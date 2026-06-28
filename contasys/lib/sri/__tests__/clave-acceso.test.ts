import { describe, it, expect } from "vitest";
import { generarClaveAcceso } from "@/lib/sri/clave-acceso";

describe("generarClaveAcceso", () => {
  it("genera clave de 48 caracteres (47 base + dígito verificador)", () => {
    const clave = generarClaveAcceso({
      ruc: "1792294726001",
      tipoComprobante: "factura",
      serie: "001",
      numeroFactura: "000000001",
      fechaEmision: new Date("2026-06-26"),
      ambiente: "pruebas",
    });
    expect(clave).toHaveLength(48);
    expect(clave).toMatch(/^\d{48}$/);
  });

  it("incluye los primeros 8 dígitos como fecha (DDMMYYYY)", () => {
    const clave = generarClaveAcceso({
      ruc: "1792294726001",
      tipoComprobante: "factura",
      serie: "001",
      numeroFactura: "000000001",
      fechaEmision: new Date("2026-12-25T12:00:00"),
      ambiente: "pruebas",
    });
    expect(clave.startsWith("25122026")).toBe(true);
  });

  it("usa código 01 para factura", () => {
    const clave = generarClaveAcceso({
      ruc: "1792294726001",
      tipoComprobante: "factura",
      serie: "001",
      numeroFactura: "000000001",
      fechaEmision: new Date("2026-06-26"),
      ambiente: "pruebas",
    });
    expect(clave.slice(8, 10)).toBe("01");
  });

  it("usa código 04 para nota_credito", () => {
    const clave = generarClaveAcceso({
      ruc: "1792294726001",
      tipoComprobante: "nota_credito",
      serie: "001",
      numeroFactura: "000000001",
      fechaEmision: new Date("2026-06-26"),
      ambiente: "pruebas",
    });
    expect(clave.slice(8, 10)).toBe("04");
  });

  it("usa ambiente 2 para pruebas", () => {
    const clave = generarClaveAcceso({
      ruc: "1792294726001",
      tipoComprobante: "factura",
      serie: "001",
      numeroFactura: "000000001",
      fechaEmision: new Date("2026-06-26"),
      ambiente: "pruebas",
    });
    expect(clave[23]).toBe("2");
  });

  it("usa ambiente 1 para produccion", () => {
    const clave = generarClaveAcceso({
      ruc: "1792294726001",
      tipoComprobante: "factura",
      serie: "001",
      numeroFactura: "000000001",
      fechaEmision: new Date("2026-06-26"),
      ambiente: "produccion",
    });
    expect(clave[23]).toBe("1");
  });

  it("genera claves diferentes en dos llamadas (random interno)", () => {
    const opts = {
      ruc: "1792294726001",
      tipoComprobante: "factura",
      serie: "001",
      numeroFactura: "000000001",
      fechaEmision: new Date("2026-06-26"),
      ambiente: "pruebas",
    };
    const a = generarClaveAcceso(opts);
    const b = generarClaveAcceso(opts);
    expect(a).not.toBe(b);
  });
});
