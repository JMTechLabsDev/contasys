-- ============================================
-- ContaSys - Row Level Security (RLS)
-- ============================================

-- ============================================
-- Helper: función para obtener empresa_ids del usuario
-- ============================================
CREATE OR REPLACE FUNCTION usuario_empresa_ids()
RETURNS SETOF UUID
LANGUAGE SQL
STABLE
AS $$
  SELECT empresa_id FROM empresa_usuarios
  WHERE usuario_id = auth.uid() AND activo = true;
$$;

-- ============================================
-- Helper: verificar si usuario tiene rol en empresa
-- ============================================
CREATE OR REPLACE FUNCTION usuario_tiene_rol(p_empresa_id UUID, p_rol rol_empresa)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM empresa_usuarios
    WHERE empresa_id = p_empresa_id
      AND usuario_id = auth.uid()
      AND rol = p_rol
      AND activo = true
  );
$$;

-- ============================================
-- Helper: verificar si usuario tiene al menos un rol
-- ============================================
CREATE OR REPLACE FUNCTION usuario_en_empresa(p_empresa_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM empresa_usuarios
    WHERE empresa_id = p_empresa_id
      AND usuario_id = auth.uid()
      AND activo = true
  );
$$;

-- ============================================
-- RLS: usuarios
-- ============================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_ver_propio"
  ON usuarios FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "usuarios_ver_de_mis_empresas"
  ON usuarios FOR SELECT
  USING (
    id IN (
      SELECT usuario_id FROM empresa_usuarios
      WHERE empresa_id IN (SELECT usuario_empresa_ids())
    )
  );

CREATE POLICY "usuarios_actualizar_propio"
  ON usuarios FOR UPDATE
  USING (id = auth.uid());

-- ============================================
-- RLS: empresas
-- ============================================
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresas_ver_mias"
  ON empresas FOR SELECT
  USING (id IN (SELECT usuario_empresa_ids()));

CREATE POLICY "empresas_insertar"
  ON empresas FOR INSERT
  WITH CHECK (true);  -- El trigger de onboarding asigna propietario

CREATE POLICY "empresas_actualizar"
  ON empresas FOR UPDATE
  USING (usuario_tiene_rol(id, 'propietario') OR usuario_tiene_rol(id, 'administrador'));

-- ============================================
-- RLS: empresa_usuarios
-- ============================================
ALTER TABLE empresa_usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eu_ver_de_mis_empresas"
  ON empresa_usuarios FOR SELECT
  USING (empresa_id IN (SELECT usuario_empresa_ids()));

CREATE POLICY "eu_insertar_propietario_admin"
  ON empresa_usuarios FOR INSERT
  WITH CHECK (
    empresa_id IN (SELECT usuario_empresa_ids())
    AND (usuario_tiene_rol(empresa_id, 'propietario') OR usuario_tiene_rol(empresa_id, 'administrador'))
  );

CREATE POLICY "eu_actualizar_propietario_admin"
  ON empresa_usuarios FOR UPDATE
  USING (
    empresa_id IN (SELECT usuario_empresa_ids())
    AND (usuario_tiene_rol(empresa_id, 'propietario') OR usuario_tiene_rol(empresa_id, 'administrador'))
  );

CREATE POLICY "eu_eliminar_propietario_admin"
  ON empresa_usuarios FOR DELETE
  USING (
    empresa_id IN (SELECT usuario_empresa_ids())
    AND (usuario_tiene_rol(empresa_id, 'propietario') OR usuario_tiene_rol(empresa_id, 'administrador'))
  );

-- ============================================
-- RLS: clientes
-- ============================================
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clientes_ver_de_mi_empresa"
  ON clientes FOR SELECT
  USING (empresa_id IN (SELECT usuario_empresa_ids()));

CREATE POLICY "clientes_insertar"
  ON clientes FOR INSERT
  WITH CHECK (empresa_id IN (SELECT usuario_empresa_ids()));

CREATE POLICY "clientes_actualizar"
  ON clientes FOR UPDATE
  USING (empresa_id IN (SELECT usuario_empresa_ids()));

CREATE POLICY "clientes_eliminar"
  ON clientes FOR DELETE
  USING (empresa_id IN (SELECT usuario_empresa_ids()));

-- ============================================
-- RLS: productos
-- ============================================
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "productos_ver_de_mi_empresa"
  ON productos FOR SELECT
  USING (empresa_id IN (SELECT usuario_empresa_ids()));

CREATE POLICY "productos_insertar"
  ON productos FOR INSERT
  WITH CHECK (empresa_id IN (SELECT usuario_empresa_ids()));

CREATE POLICY "productos_actualizar"
  ON productos FOR UPDATE
  USING (empresa_id IN (SELECT usuario_empresa_ids()));

CREATE POLICY "productos_eliminar"
  ON productos FOR DELETE
  USING (empresa_id IN (SELECT usuario_empresa_ids()));

-- ============================================
-- RLS: facturas
-- ============================================
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "facturas_ver_de_mi_empresa"
  ON facturas FOR SELECT
  USING (empresa_id IN (SELECT usuario_empresa_ids()));

CREATE POLICY "facturas_insertar"
  ON facturas FOR INSERT
  WITH CHECK (empresa_id IN (SELECT usuario_empresa_ids()));

CREATE POLICY "facturas_actualizar"
  ON facturas FOR UPDATE
  USING (empresa_id IN (SELECT usuario_empresa_ids()));

CREATE POLICY "facturas_eliminar"
  ON facturas FOR DELETE
  USING (empresa_id IN (SELECT usuario_empresa_ids()));

-- ============================================
-- RLS: factura_items
-- ============================================
ALTER TABLE factura_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fi_ver_de_mi_empresa"
  ON factura_items FOR SELECT
  USING (
    factura_id IN (
      SELECT id FROM facturas WHERE empresa_id IN (SELECT usuario_empresa_ids())
    )
  );

CREATE POLICY "fi_insertar"
  ON factura_items FOR INSERT
  WITH CHECK (
    factura_id IN (
      SELECT id FROM facturas WHERE empresa_id IN (SELECT usuario_empresa_ids())
    )
  );

CREATE POLICY "fi_actualizar"
  ON factura_items FOR UPDATE
  USING (
    factura_id IN (
      SELECT id FROM facturas WHERE empresa_id IN (SELECT usuario_empresa_ids())
    )
  );

CREATE POLICY "fi_eliminar"
  ON factura_items FOR DELETE
  USING (
    factura_id IN (
      SELECT id FROM facturas WHERE empresa_id IN (SELECT usuario_empresa_ids())
    )
  );

-- ============================================
-- RLS: pagos
-- ============================================
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pagos_ver_de_mi_empresa"
  ON pagos FOR SELECT
  USING (empresa_id IN (SELECT usuario_empresa_ids()));

CREATE POLICY "pagos_insertar"
  ON pagos FOR INSERT
  WITH CHECK (empresa_id IN (SELECT usuario_empresa_ids()));

-- ============================================
-- RLS: suscripciones
-- ============================================
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suscripciones_ver_de_mi_empresa"
  ON suscripciones FOR SELECT
  USING (empresa_id IN (SELECT usuario_empresa_ids()));

-- Solo propietario puede ver/modificar suscripción
CREATE POLICY "suscripciones_actualizar"
  ON suscripciones FOR UPDATE
  USING (usuario_tiene_rol(empresa_id, 'propietario'));

-- ============================================
-- RLS: pagos_suscripcion
-- ============================================
ALTER TABLE pagos_suscripcion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ps_ver_de_mi_empresa"
  ON pagos_suscripcion FOR SELECT
  USING (empresa_id IN (SELECT usuario_empresa_ids()));

-- ============================================
-- RLS: notificaciones
-- ============================================
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notificaciones_ver_mias"
  ON notificaciones FOR SELECT
  USING (usuario_id = auth.uid());

CREATE POLICY "notificaciones_actualizar_mias"
  ON notificaciones FOR UPDATE
  USING (usuario_id = auth.uid());

-- ============================================
-- RLS: auditoria
-- ============================================
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auditoria_ver_de_mi_empresa"
  ON auditoria FOR SELECT
  USING (empresa_id IN (SELECT usuario_empresa_ids()));

-- ============================================
-- RLS: api_keys
-- ============================================
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_keys_ver_de_mi_empresa"
  ON api_keys FOR SELECT
  USING (empresa_id IN (SELECT usuario_empresa_ids()));

CREATE POLICY "api_keys_insertar"
  ON api_keys FOR INSERT
  WITH CHECK (
    empresa_id IN (SELECT usuario_empresa_ids())
    AND (usuario_tiene_rol(empresa_id, 'propietario') OR usuario_tiene_rol(empresa_id, 'administrador'))
  );

CREATE POLICY "api_keys_eliminar"
  ON api_keys FOR DELETE
  USING (
    empresa_id IN (SELECT usuario_empresa_ids())
    AND (usuario_tiene_rol(empresa_id, 'propietario') OR usuario_tiene_rol(empresa_id, 'administrador'))
  );

-- ============================================
-- RLS: planes (todos pueden ver, solo admin puede modificar)
-- ============================================
ALTER TABLE planes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planes_ver_todos"
  ON planes FOR SELECT
  USING (true);
