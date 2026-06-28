import { describe, it, expect } from "vitest";
import { facturaIdFromNumero, generarXMLFactura } from "@/lib/sri/xml-generator";

describe("facturaIdFromNumero", () => {
  it("formatea número + serie correctamente", () => {
    expect(facturaIdFromNumero("1", "001")).toBe("001-000000001");
  });

  it("pads número a 9 dígitos", () => {
    expect(facturaIdFromNumero("12345", "002")).toBe("002-000012345");
  });
});

describe("generarXMLFactura", () => {
  const data = {
    numeroFactura: "1",
    fechaEmision: new Date("2026-06-26"),
    tipoComprobante: "factura",
    subtotal: 100,
    descuento: 0,
    subtotalSinImpuesto: 100,
    iva: 15,
    total: 115,
    metodoPago: "transferencia",
    cliente: {
      tipoIdentificacion: "cedula",
      identificacion: "1712345678",
      nombre: "Juan Pérez",
      direccion: "Av. Principal",
    },
    items: [
      { descripcion: "Producto A", cantidad: 2, precioUnitario: 50, descuento: 0, subtotal: 100, iva: 15, total: 115 },
    ],
    empresa: {
      ruc: "1792294726001",
      razonSocial: "Mi Empresa S.A.S.",
      nombreComercial: "Mi Empresa",
      direccion: "Av. Siempre Viva 123",
      ciudad: "Quito",
      provincia: "Pichincha",
      obligadoContabilidad: true,
    },
    ambiente: "pruebas" as const,
    serie: "001",
  };

  it("genera XML con declaración", () => {
    const xml = generarXMLFactura(data);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  });

  it("incluye clave de acceso de 48 dígitos", () => {
    const xml = generarXMLFactura(data);
    const match = xml.match(/<claveAcceso>(\d+)<\/claveAcceso>/);
    expect(match).not.toBeNull();
    expect(match![1]).toHaveLength(48);
  });

  it("incluye datos del cliente", () => {
    const xml = generarXMLFactura(data);
    expect(xml).toContain("Juan Pérez");
    expect(xml).toContain("1712345678");
  });

  it("incluye datos de la empresa", () => {
    const xml = generarXMLFactura(data);
    expect(xml).toContain("Mi Empresa S.A.S.");
    expect(xml).toContain("1792294726001");
  });

  it("incluye items del detalle", () => {
    const xml = generarXMLFactura(data);
    expect(xml).toContain("Producto A");
    expect(xml).toContain("50.00");
    expect(xml).toContain("2");
  });

  it("incluye totales", () => {
    const xml = generarXMLFactura(data);
    expect(xml).toContain("115.00");
    expect(xml).toContain("15.00");
  });

  it("escapa caracteres XML especiales", () => {
    const dataConEspeciales = {
      ...data,
      cliente: { ...data.cliente, nombre: 'Juan & "Pepe" Pérez <test>' },
    };
    const xml = generarXMLFactura(dataConEspeciales);
    expect(xml).toContain("&amp;");
    expect(xml).toContain("&quot;");
    expect(xml).toContain("&lt;");
    expect(xml).not.toContain("<test>");
  });

  it("incluye info adicional cuando hay observaciones", () => {
    const xml = generarXMLFactura({ ...data, observaciones: "Factura de prueba" });
    expect(xml).toContain("infoAdicional");
    expect(xml).toContain("Factura de prueba");
  });

  it("no incluye info adicional sin observaciones", () => {
    const xml = generarXMLFactura(data);
    expect(xml).not.toContain("infoAdicional");
  });
});
