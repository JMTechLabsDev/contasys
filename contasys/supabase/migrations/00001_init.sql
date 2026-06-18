-- ============================================
-- ContaSys - Migración Inicial
-- ============================================

-- Crear extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE rol_plataforma AS ENUM ('superadmin', 'usuario');
CREATE TYPE rol_empresa AS ENUM ('propietario', 'administrador', 'gerente', 'contador', 'facturacion', 'vendedor');
CREATE TYPE estado_empresa AS ENUM ('activa', 'suspendida', 'prueba');
CREATE TYPE ambiente AS ENUM ('pruebas', 'produccion');
CREATE TYPE tipo_comprobante AS ENUM ('factura', 'nota_credito', 'nota_debito', 'retencion', 'guia_remision');
CREATE TYPE estado_factura AS ENUM ('borrador', 'pendiente', 'procesando', 'autorizado', 'rechazado', 'anulado');
CREATE TYPE estado_suscripcion AS ENUM ('trial', 'activa', 'cancelada', 'vencida', 'pendiente_cambio');
CREATE TYPE periodo AS ENUM ('mensual', 'anual');

-- ============================================
-- TABLAS
-- ============================================

-- Usuarios (sincronizado con auth.users)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  rol_plataforma rol_plataforma DEFAULT 'usuario',
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Empresas
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  razon_social TEXT NOT NULL,
  ruc TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  ciudad TEXT,
  provincia TEXT,
  regimen_tributario TEXT,
  tipo_contribuyente TEXT,
  ambiente ambiente DEFAULT 'pruebas',
  estado estado_empresa DEFAULT 'prueba',
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Empresa-Usuarios (relación N:N con roles)
CREATE TABLE empresa_usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  rol rol_empresa NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  invitado_en TIMESTAMPTZ DEFAULT NOW(),
  aceptado_en TIMESTAMPTZ,
  UNIQUE(empresa_id, usuario_id)
);

-- Clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo_identificacion TEXT NOT NULL,
  identificacion TEXT NOT NULL,
  nombre TEXT NOT NULL,
  razon_social TEXT,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  ciudad TEXT,
  provincia TEXT,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Productos
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sku TEXT,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT,
  precio DECIMAL(10,2) NOT NULL,
  costo DECIMAL(10,2),
  impuesto TEXT DEFAULT '15%',
  stock INTEGER,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Facturas
CREATE TABLE facturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  numero_factura TEXT NOT NULL,
  clave_acceso TEXT,
  tipo_comprobante tipo_comprobante DEFAULT 'factura',
  estado estado_factura DEFAULT 'borrador',
  subtotal DECIMAL(10,2) NOT NULL,
  descuento DECIMAL(10,2) DEFAULT 0,
  subtotal_sin_impuesto DECIMAL(10,2) NOT NULL,
  iva DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago TEXT,
  observaciones TEXT,
  fecha_emision TIMESTAMPTZ DEFAULT NOW(),
  fecha_autorizacion TIMESTAMPTZ,
  xml_generado TEXT,
  pdf_url TEXT,
  sri_respuesta JSONB,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Items de factura
CREATE TABLE factura_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factura_id UUID NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  descripcion TEXT NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  descuento DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  iva DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL
);

-- Pagos de facturas
CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  factura_id UUID NOT NULL REFERENCES facturas(id),
  monto DECIMAL(10,2) NOT NULL,
  metodo TEXT,
  referencia TEXT,
  fecha_pago TIMESTAMPTZ DEFAULT NOW(),
  registrado_por UUID NOT NULL REFERENCES usuarios(id)
);

-- Planes de suscripción
CREATE TABLE planes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  precio_mensual DECIMAL(10,2) NOT NULL,
  precio_anual DECIMAL(10,2) NOT NULL,
  limite_facturas INTEGER,
  limite_usuarios INTEGER,
  multiempresa BOOLEAN DEFAULT FALSE,
  api_access BOOLEAN DEFAULT FALSE,
  reportes_avanzados BOOLEAN DEFAULT FALSE,
  auditoria BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  paypal_plan_id_mensual TEXT,
  paypal_plan_id_anual TEXT
);

-- Suscripciones
CREATE TABLE suscripciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES planes(id),
  estado estado_suscripcion DEFAULT 'trial',
  periodo periodo DEFAULT 'mensual',
  fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
  fecha_fin TIMESTAMPTZ,
  paypal_subscription_id TEXT,
  paypal_order_id TEXT,
  plan_pendiente_id UUID REFERENCES planes(id),
  periodo_pendiente periodo,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Pagos de suscripción
CREATE TABLE pagos_suscripcion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  suscripcion_id UUID NOT NULL REFERENCES suscripciones(id),
  monto DECIMAL(10,2) NOT NULL,
  moneda TEXT DEFAULT 'USD',
  paypal_transaction_id TEXT,
  estado TEXT,
  periodo_desde TIMESTAMPTZ,
  periodo_hasta TIMESTAMPTZ,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Notificaciones
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  tipo TEXT,
  titulo TEXT NOT NULL,
  mensaje TEXT,
  leida BOOLEAN DEFAULT FALSE,
  url TEXT,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Auditoría
CREATE TABLE auditoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  accion TEXT NOT NULL,
  recurso TEXT NOT NULL,
  recurso_id TEXT,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  ip TEXT,
  user_agent TEXT,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  clave_hash TEXT NOT NULL,
  permisos JSONB,
  ultimo_uso TIMESTAMPTZ,
  activa BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX idx_empresa_usuarios_usuario ON empresa_usuarios(usuario_id);
CREATE INDEX idx_empresa_usuarios_empresa ON empresa_usuarios(empresa_id);
CREATE INDEX idx_clientes_empresa ON clientes(empresa_id);
CREATE INDEX idx_productos_empresa ON productos(empresa_id);
CREATE INDEX idx_facturas_empresa ON facturas(empresa_id);
CREATE INDEX idx_facturas_cliente ON facturas(cliente_id);
CREATE INDEX idx_facturas_estado ON facturas(estado);
CREATE INDEX idx_factura_items_factura ON factura_items(factura_id);
CREATE INDEX idx_pagos_factura ON pagos(factura_id);
CREATE INDEX idx_suscripciones_empresa ON suscripciones(empresa_id);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_auditoria_empresa ON auditoria(empresa_id);
CREATE INDEX idx_api_keys_empresa ON api_keys(empresa_id);
