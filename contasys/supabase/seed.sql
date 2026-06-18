-- ============================================
-- ContaSys - Seed Data
-- ============================================

-- Planes de suscripción
INSERT INTO planes (nombre, precio_mensual, precio_anual, limite_facturas, limite_usuarios, multiempresa, api_access, reportes_avanzados, auditoria, activo) VALUES
  ('Emprendedor', 9.99, 99.99, 50, 1, false, false, false, false, true),
  ('Profesional', 19.99, 199.99, 200, 3, false, false, true, false, true),
  ('Empresarial', 39.99, 399.99, 1000, 10, true, true, true, true, true),
  ('Corporativo', 79.99, 799.99, NULL, NULL, true, true, true, true, true);
