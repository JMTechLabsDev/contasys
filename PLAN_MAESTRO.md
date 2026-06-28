# ContaSys — Plan Maestro de Desarrollo
> Sistema de Facturación Electrónica SaaS para Ecuador
> Versión: 1.0 | Fecha: Junio 2025

---

## Índice

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Modelo de Base de Datos](#5-modelo-de-base-de-datos)
6. [Fases de Desarrollo](#6-fases-de-desarrollo)
7. [Detalle por Módulo](#7-detalle-por-módulo)
8. [Seguridad](#8-seguridad)
9. [Despliegue en Producción](#9-despliegue-en-producción)
10. [Estimación de Tiempos](#10-estimación-de-tiempos)

---

## 1. Visión General

**ContaSys** es una plataforma SaaS de facturación electrónica y administración comercial diseñada exclusivamente para el mercado ecuatoriano, con cumplimiento del SRI.

### Objetivos de negocio
- Emisión de comprobantes electrónicos válidos ante el SRI
- Gestión integral de ventas, clientes, productos y cobros
- Multiempresa y multiusuario con permisos granulares
- Suscripciones por planes con pagos via PayPal
- Dashboard administrativo para gestión de la plataforma

### Usuarios objetivo
- Emprendedores y freelancers
- Profesionales independientes
- Comercios y distribuidores
- Agencias y empresas de servicios
- PYMEs y estudios contables

---

## 2. Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| Frontend | Next.js 15 (App Router) | Framework principal |
| Lenguaje | TypeScript | Tipado estático |
| Estilos | Tailwind CSS | Utilidades CSS |
| Componentes | shadcn/ui | Librería de UI |
| Iconos | Lucide Icons | Iconografía |
| Gráficos | Recharts | Visualización de datos |
| Formularios | React Hook Form + Zod | Validación de formularios |
| Estado servidor | React Query (TanStack) | Cache y sincronización |
| ORM | Prisma | Abstracción de base de datos |
| Base de datos | PostgreSQL (Supabase) | Almacenamiento principal |
| Auth | Supabase Auth | Autenticación y sesiones |
| Storage | Supabase Storage | Archivos y PDFs |
| Pagos | PayPal SDK | Suscripciones y cobros |
| Despliegue | Vercel | Hosting frontend + API |
| PDF | React PDF / Puppeteer | Generación de comprobantes |

---

## 3. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENTE                           │
│              Next.js 15 App Router (Vercel)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ Landing  │  │  App     │  │  Admin   │  │  API   │  │
│  │  Page    │  │ Dashboard│  │ ContaSys │  │  Docs  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ Server Actions / Route Handlers
┌───────────────────────▼─────────────────────────────────┐
│                    BACKEND (Vercel)                       │
│  ┌─────────────────┐      ┌──────────────────────────┐  │
│  │  Server Actions │      │    API Route Handlers    │  │
│  │  (Next.js)      │      │    /api/v1/...            │  │
│  └────────┬────────┘      └─────────────┬────────────┘  │
│           │                             │               │
│  ┌────────▼─────────────────────────────▼────────────┐  │
│  │              Capa de Servicios                    │  │
│  │  auth | empresa | factura | cliente | producto    │  │
│  │  suscripcion | reporte | sri | notificacion       │  │
│  └────────────────────────┬──────────────────────────┘  │
└───────────────────────────┼─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│                    SUPABASE                              │
│  ┌──────────────┐  ┌────────────┐  ┌─────────────────┐  │
│  │  PostgreSQL  │  │  Auth      │  │  Storage        │  │
│  │  + RLS       │  │  + MFA     │  │  (PDFs, logos)  │  │
│  └──────────────┘  └────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│               SERVICIOS EXTERNOS                         │
│   PayPal SDK       SRI (futuro)       Email (Resend)     │
└─────────────────────────────────────────────────────────┘
```

### Modelo Multi-Tenant
- Aislamiento por `empresa_id` en todas las tablas
- Row Level Security (RLS) en Supabase para cada tabla
- Cada operación valida `empresa_id` en el servidor
- Nunca se filtra por empresa solo en el frontend

---

## 4. Estructura del Proyecto

```
contasys/
├── app/                          # App Router de Next.js 15
│   ├── (marketing)/              # Grupo: Landing page pública
│   │   ├── page.tsx              # Landing page principal
│   │   ├── precios/page.tsx
│   │   └── layout.tsx
│   ├── (auth)/                   # Grupo: Autenticación
│   │   ├── login/page.tsx
│   │   ├── registro/page.tsx
│   │   ├── recuperar/page.tsx
│   │   ├── verificar/page.tsx
│   │   └── layout.tsx
│   ├── (app)/                    # Grupo: App principal (protegida)
│   │   ├── dashboard/page.tsx
│   │   ├── facturas/
│   │   │   ├── page.tsx
│   │   │   ├── nueva/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── clientes/
│   │   │   ├── page.tsx
│   │   │   ├── nuevo/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── productos/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── cuentas-cobrar/page.tsx
│   │   ├── reportes/page.tsx
│   │   ├── suscripcion/page.tsx
│   │   ├── configuracion/
│   │   │   ├── empresa/page.tsx
│   │   │   ├── usuarios/page.tsx
│   │   │   └── integraciones/page.tsx
│   │   └── layout.tsx
│   ├── (admin)/                  # Grupo: Admin ContaSys (superadmin)
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── usuarios/page.tsx
│   │   │   ├── empresas/page.tsx
│   │   │   ├── planes/page.tsx
│   │   │   ├── finanzas/page.tsx
│   │   │   └── soporte/page.tsx
│   │   └── layout.tsx
│   └── api/                      # Route Handlers
│       ├── v1/
│       │   ├── empresas/route.ts
│       │   ├── clientes/route.ts
│       │   ├── productos/route.ts
│       │   ├── facturas/route.ts
│       │   └── reportes/route.ts
│       ├── webhooks/
│       │   └── paypal/route.ts
│       └── auth/
│           └── callback/route.ts
├── components/                   # Componentes reutilizables
│   ├── ui/                       # shadcn/ui components
│   ├── layout/                   # Sidebar, Navbar, Header
│   ├── dashboard/                # Widgets y KPIs
│   ├── facturas/                 # Componentes de facturación
│   ├── clientes/                 # Componentes de clientes
│   ├── productos/                # Componentes de productos
│   ├── reportes/                 # Gráficos y tablas
│   ├── suscripcion/              # Planes y PayPal
│   └── shared/                   # Componentes genéricos
├── lib/                          # Utilidades y configuraciones
│   ├── supabase/
│   │   ├── client.ts             # Cliente browser
│   │   ├── server.ts             # Cliente server (SSR)
│   │   └── admin.ts             # Cliente admin (service role, solo server)
│   ├── prisma/
│   │   └── client.ts
│   ├── paypal/
│   │   └── client.ts
│   ├── sri/                      # Lógica SRI Ecuador
│   │   ├── xml-generator.ts
│   │   ├── firma-electronica.ts
│   │   └── soap-client.ts
│   ├── pdf/
│   │   └── factura-pdf.tsx
│   ├── validations/              # Schemas Zod
│   │   ├── factura.ts
│   │   ├── cliente.ts
│   │   └── producto.ts
│   └── utils.ts
├── actions/                      # Server Actions
│   ├── auth.ts
│   ├── empresa.ts
│   ├── factura.ts
│   ├── cliente.ts
│   ├── producto.ts
│   ├── suscripcion.ts
│   └── admin.ts
├── hooks/                        # Custom hooks
│   ├── useEmpresa.ts
│   ├── useFacturas.ts
│   └── usePermisos.ts
├── types/                        # Tipos TypeScript globales
│   ├── database.ts               # Tipos generados por Supabase
│   ├── factura.ts
│   └── sri.ts
├── middleware.ts                 # Auth middleware + protección de rutas
├── prisma/
│   └── schema.prisma
├── supabase/
│   ├── migrations/               # Migraciones SQL
│   └── seed.sql
├── public/
│   └── assets/
├── .env.local                    # Variables de entorno locales
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 5. Modelo de Base de Datos

### Tablas principales

#### `usuarios`
```sql
id uuid PRIMARY KEY (ref: auth.users)
nombre text
email text UNIQUE
avatar_url text
rol_plataforma text  -- 'superadmin' | 'usuario'
creado_en timestamptz
```

#### `empresas`
```sql
id uuid PRIMARY KEY
nombre text
razon_social text
ruc text UNIQUE
logo_url text
email text
telefono text
direccion text
ciudad text
provincia text
regimen_tributario text
tipo_contribuyente text
ambiente text  -- 'pruebas' | 'produccion'
estado text    -- 'activa' | 'suspendida' | 'prueba'
creado_en timestamptz
```

#### `empresa_usuarios`
```sql
id uuid PRIMARY KEY
empresa_id uuid FK empresas
usuario_id uuid FK usuarios
rol text  -- 'propietario' | 'administrador' | 'gerente' | 'contador' | 'facturacion' | 'vendedor'
activo boolean
invitado_en timestamptz
aceptado_en timestamptz
```

#### `clientes`
```sql
id uuid PRIMARY KEY
empresa_id uuid FK empresas
tipo_identificacion text  -- 'ruc' | 'cedula' | 'pasaporte'
identificacion text
nombre text
razon_social text
email text
telefono text
direccion text
ciudad text
provincia text
activo boolean
creado_en timestamptz
```

#### `productos`
```sql
id uuid PRIMARY KEY
empresa_id uuid FK empresas
sku text
nombre text
descripcion text
categoria text
precio decimal(10,2)
costo decimal(10,2)
impuesto text  -- '0%' | '15%' | 'exento'
stock integer
activo boolean
creado_en timestamptz
```

#### `facturas`
```sql
id uuid PRIMARY KEY
empresa_id uuid FK empresas
cliente_id uuid FK clientes
numero_factura text
clave_acceso text  -- 49 dígitos SRI
tipo_comprobante text  -- 'factura' | 'nota_credito' | 'nota_debito' | 'retencion' | 'guia_remision'
estado text  -- 'borrador' | 'pendiente' | 'procesando' | 'autorizado' | 'rechazado' | 'anulado'
subtotal decimal(10,2)
descuento decimal(10,2)
subtotal_sin_impuesto decimal(10,2)
iva decimal(10,2)
total decimal(10,2)
metodo_pago text
observaciones text
fecha_emision timestamptz
fecha_autorizacion timestamptz
xml_generado text
pdf_url text
sri_respuesta jsonb
creado_en timestamptz
```

#### `factura_items`
```sql
id uuid PRIMARY KEY
factura_id uuid FK facturas
producto_id uuid FK productos
descripcion text
cantidad decimal(10,2)
precio_unitario decimal(10,2)
descuento decimal(10,2)
subtotal decimal(10,2)
iva decimal(10,2)
total decimal(10,2)
```

#### `pagos`
```sql
id uuid PRIMARY KEY
empresa_id uuid FK empresas
factura_id uuid FK facturas
monto decimal(10,2)
metodo text
referencia text
fecha_pago timestamptz
registrado_por uuid FK usuarios
```

#### `planes`
```sql
id uuid PRIMARY KEY
nombre text  -- 'emprendedor' | 'profesional' | 'empresarial' | 'corporativo'
precio_mensual decimal(10,2)
precio_anual decimal(10,2)
limite_facturas integer  -- NULL = ilimitado
limite_usuarios integer  -- NULL = ilimitado
multiempresa boolean
api_access boolean
reportes_avanzados boolean
auditoria boolean
activo boolean
paypal_plan_id_mensual text
paypal_plan_id_anual text
```

#### `suscripciones`
```sql
id uuid PRIMARY KEY
empresa_id uuid FK empresas
plan_id uuid FK planes
estado text  -- 'trial' | 'activa' | 'cancelada' | 'vencida' | 'pendiente_cambio'
periodo text  -- 'mensual' | 'anual'
fecha_inicio timestamptz
fecha_fin timestamptz
paypal_subscription_id text
paypal_order_id text
plan_pendiente_id uuid FK planes  -- Para cambio programado
periodo_pendiente text
creado_en timestamptz
```

#### `pagos_suscripcion`
```sql
id uuid PRIMARY KEY
empresa_id uuid FK empresas
suscripcion_id uuid FK suscripciones
monto decimal(10,2)
moneda text
paypal_transaction_id text
estado text
periodo_desde timestamptz
periodo_hasta timestamptz
creado_en timestamptz
```

#### `notificaciones`
```sql
id uuid PRIMARY KEY
empresa_id uuid FK empresas
usuario_id uuid FK usuarios
tipo text
titulo text
mensaje text
leida boolean
url text
creado_en timestamptz
```

#### `auditoria`
```sql
id uuid PRIMARY KEY
empresa_id uuid FK empresas
usuario_id uuid FK usuarios
accion text
recurso text
recurso_id text
datos_anteriores jsonb
datos_nuevos jsonb
ip text
user_agent text
creado_en timestamptz
```

#### `api_keys`
```sql
id uuid PRIMARY KEY
empresa_id uuid FK empresas
nombre text
clave_hash text  -- nunca guardar en claro
permisos jsonb
ultimo_uso timestamptz
activa boolean
creado_en timestamptz
```

---

## 6. Fases de Desarrollo

### FASE 0 — Configuración e Infraestructura ✅
**Duración estimada: 3-5 días**

- [x] Crear repositorio en GitHub
- [x] Inicializar proyecto Next.js 15 con TypeScript
- [x] Configurar Tailwind CSS + shadcn/ui
- [x] Configurar ESLint + Prettier
- [x] Configurar Supabase (proyecto, base de datos)
- [x] Ejecutar migraciones iniciales de PostgreSQL
- [x] Configurar Prisma ORM + schema inicial
- [x] Configurar variables de entorno (.env.local, .env.example)
- [ ] Configurar proyecto en Vercel (requiere cuenta)
- [ ] Configurar dominio (opcional en esta fase)
- [ ] Conectar repositorio con Vercel (CI/CD automático)
- [x] Configurar Row Level Security (RLS) base en Supabase

---

### FASE 1 — Autenticación y Onboarding ✅
**Duración estimada: 5-7 días**

- [x] Página de registro (email + contraseña)
- [x] Verificación de correo electrónico
- [x] Página de inicio de sesión
- [x] Recuperación de contraseña (email)
- [x] Restablecimiento de contraseña
- [x] Middleware de autenticación (proteger rutas)
- [x] Gestión de sesiones con Supabase Auth
- [ ] MFA opcional (TOTP) — pendiente
- [x] Cierre de sesión global (revocar todas las sesiones)
- [x] Flujo de onboarding: crear primera empresa
- [x] Asignar rol 'propietario' automáticamente al crear empresa
- [x] Redirect post-login inteligente

---

### FASE 2 — Landing Page ✅
**Duración estimada: 5-7 días**

- [x] Layout marketing (header, footer)
- [x] Sección Hero principal
- [x] Sección Beneficios
- [x] Sección Características con íconos
- [x] Sección Capturas del sistema (mockups)
- [x] Sección Casos de uso
- [x] Comparación vs Excel
- [x] Comparación vs procesos manuales
- [x] Sección Integraciones
- [x] Sección Testimonios
- [x] Sección Planes y Precios
- [x] Sección FAQ
- [x] CTA final
- [x] Diseño responsive (móvil, tablet, escritorio)
- [x] Modo claro / oscuro
- [x] SEO básico (meta tags, OG tags)
- [x] Página de Términos y Condiciones
- [x] Página de Política de Privacidad

---

### FASE 3 — Dashboard Principal ✅
**Duración estimada: 4-5 días**

- [x] Layout de la app (sidebar, topbar, breadcrumbs)
- [x] Componente selector de empresa (multiempresa)
- [x] Centro de notificaciones (campana)
- [x] KPIs: ventas del día, mes, año
- [x] KPIs: facturas emitidas, pendientes
- [x] KPIs: clientes activos, nuevos
- [x] KPIs: cuentas por cobrar
- [x] Gráfico ventas mensuales (Recharts)
- [x] Gráfico facturación por período
- [x] Gráfico clientes nuevos
- [x] Tabla productos más vendidos
- [x] Modo claro / oscuro en app

---

### FASE 4 — Gestión de Clientes ✅
**Duración estimada: 4-5 días**

- [x] Listado de clientes con paginación
- [x] Búsqueda avanzada y filtros
- [x] Etiquetas de clientes
- [x] Formulario crear cliente (validación Zod)
- [x] Formulario editar cliente
- [x] Eliminar cliente (soft delete)
- [x] Perfil de cliente: historial facturas
- [x] Perfil de cliente: historial pagos
- [x] Perfil de cliente: saldo pendiente
- [x] Perfil de cliente: última compra
- [x] Importar clientes desde CSV
- [x] Exportar clientes a CSV
- [x] RLS: solo ver clientes de la empresa activa

### FASE 4b — Configuración Supabase (contasys schema) ✅

- [x] Schema `contasys` con 14 tablas
- [x] RLS policies para todas las tablas
- [x] Trigger auth → contasys.usuarios
- [x] Helper functions (usuario_empresa_ids, usuario_tiene_rol, usuario_en_empresa)

---

### FASE 5 — Gestión de Productos y Servicios ✅
**Duración estimada: 3-4 días**

- [x] Listado de productos con paginación
- [x] Búsqueda y filtros por categoría
- [x] Formulario crear producto/servicio
- [x] Formulario editar producto
- [x] Eliminar producto (soft delete)
- [x] Indicador stock (visual: bajo, normal, agotado)
- [x] Categorías de productos
- [x] Indicadores: más vendidos, menos vendidos
- [x] Cálculo de rentabilidad por producto
- [x] Importar productos desde CSV
- [x] RLS: solo ver productos de la empresa activa

---

### FASE 6 — Módulo de Facturación + SRI
**Duración estimada: 10-12 días**

**Estrategia:**
1. Crear módulo XML (generación de comprobantes)
2. Crear módulo de firmado (certificado .p12)
3. Mockear respuestas del SRI (ambiente pruebas simulado)
4. Probar toda la UX (flujo completo sin SRI real)
5. Desplegar
6. Cuando existan clientes reales → probar con firma real en ambiente de pruebas SRI
7. Finalmente pasar a producción

**Nota:** No requiere certificado SRI personal del desarrollador. Los clientes suben su propia firma. Para desarrollo se usa certificado de pruebas del SRI o firma mockeada.

- [x] Listado de facturas con estados y filtros
- [x] Formulario de nueva factura (líneas dinámicas)
- [x] Búsqueda de cliente en tiempo real
- [x] Búsqueda de producto en tiempo real
- [x] Cálculo automático: subtotal, IVA, descuento, total
- [x] Selección de método de pago
- [x] Observaciones y notas internas
- [x] Guardar como borrador
- [x] Numeración automática de facturas
- [x] Duplicar factura
- [x] Facturación recurrente — modelo Recurrencia + RecurrenciaItem, CRUD completo, ejecución manual, cron API
- [x] Facturación rápida (modo simplificado con un solo item)
- [x] Vista previa de factura (modal)
- [x] Generación de PDF profesional
- [x] Descarga de PDF
- [x] Impresión de factura
- [x] Envío de factura por email al cliente (SMTP / Resend / consola dev)
- [x] Estados de factura (borrador → pendiente → autorizado...)
- [x] Notas de crédito (desde factura autorizada)
- [x] Notas de débito
- [x] Retenciones — modelo con ejercicioFiscal, impuestoRetenido (IVA/ISR), porcentajeRetener, valorRetenido, baseImponibleRet; prefijo RET-; formulario + listado paginado
- [x] Guías de remisión — modelo con puntoPartida, puntoDestino, transportista, placa, fechaInicioTransporte, destinatario; prefijo GUI-; formulario + listado paginado
- [x] Generación XML factura (clave acceso 49 dígitos, importes, impuestos, infoTributaria, infoFactura, detalles)
- [x] Módulo de firmado electrónico (XML-DSig con firma SHA1/SHA256 + envolvente)
- [x] API mock SRI (autorización simulada con respuesta AUTORIZADO/RECHAZADO)
- [x] API real SRI via SOAP (endpoints recepción + autorización, pruebas/producción)
- [x] UI: formulario de configuración SRI (ambiente pruebas/producción, datos fiscales)
- [x] UI: panel de envío SRI en detalle de factura (enviar, autorizado, rechazado, procesando)
- [x] Historial visual de autorizaciones SRI
- [x] Historial visual de rechazos SRI con errores
- [x] Reenvío automático al SRI (hasta 3 intentos con backoff progresivo)
- [x] Reintentar comprobantes rechazados (botón en panel)
- [x] Botones Retención y Guía Rem. desde detalle de factura autorizada + sidebar
- [x] Integración real SRI (SOAP client con fetch + XML, endpoints pruebas + producción)
- [x] RLS: solo ver facturas de la empresa activa

---

### FASE 7 — Cuentas por Cobrar ✅
**Duración estimada: 3-4 días**

- [x] Listado facturas pendientes de cobro
- [x] Indicadores visuales: al día / próximo a vencer / vencido
- [x] Registrar pago manual
- [x] Historial de pagos por factura
- [x] Recordatorios automáticos (email)
- [x] Seguimiento de morosidad
- [x] Resumen total de cuentas por cobrar
- [x] Filtro por cliente, fecha, monto

---

### FASE 8 — Reportes ✅
**Duración estimada: 5-6 días**

- [x] Reporte ventas diario
- [x] Reporte ventas semanal
- [x] Reporte ventas mensual
- [x] Reporte ventas anual
- [x] Reporte top clientes
- [x] Reporte clientes inactivos
- [x] Reporte ticket promedio
- [x] Reporte rentabilidad de productos
- [x] Reporte rotación de productos
- [x] Reporte IVA (declaración)
- [x] Reporte retenciones
- [x] Resúmenes fiscales
- [x] Exportar a PDF (imprimir)
- [x] Exportar a CSV
- [x] Exportar a Excel (CSV)
- [x] Filtros de fecha avanzados

---

### FASE 9 — Multiempresa y Configuración ✅
**Duración estimada: 4-5 días**

- [x] Crear múltiples empresas desde una cuenta (/empresa/nueva)
- [x] Cambio de empresa instantáneo (selector en topbar)
- [x] Configuración independiente por empresa (config JSON)
- [x] Datos completamente aislados por empresa (RLS)
- [x] Configuración general de empresa (nombre, RUC, datos fiscales)
- [x] Configuración de numeración de facturas (prefijo + secuencia por tipo)
- [x] Configuración de impuestos (IVA activación)
- [x] Configuración de métodos de pago
- [x] Configuración de correo de notificaciones (SMTP)
- [x] Gestión de usuarios: invitar colaboradores
- [x] Asignación de roles y permisos (admin, gerente, contador, facturación, vendedor)
- [x] Revocar acceso a colaboradores
- [x] Auditoría de actividad por empresa (/configuracion/auditoria)
- [x] Sidebar: sección Configuración con submenús (Empresa, Usuarios, SRI, Auditoría, + Nueva Empresa)

---

### FASE 10 — Sistema de Suscripciones ✅
**Duración estimada: 6-8 días**

- [x] Página de suscripción en la app (/suscripcion)
- [x] Mostrar plan actual con badge en sidebar
- [x] Botón de suscripción con PayPal (createOrder + capture)
- [x] Checkout PayPal (mensual y anual con selector de período)
- [x] Webhook PayPal: cancelación, suspensión, fallo de pago
- [x] Lógica de cambio de plan segura (Opción A)
  - [x] Bloquear compra si hay suscripción activa (programar cambio)
  - [x] Mostrar fecha de vencimiento actual
  - [x] "Programar cambio de plan"
  - [x] Guardar plan_pendiente_id en BD
  - [x] Mensaje si intenta comprar el mismo plan
- [x] Historial de pagos de suscripción
- [x] Período de prueba gratuito (trial 14 días, auto-creado con plan default)
- [x] Limitar uso según plan (usuarios con verificarLimiteUsuarios)
- [x] Fix bug planId: null → plan default (Emprendedor)
- [x] PayPal client mejorado: createOrder, captureOrder, createSubscription, cancelSubscription, verifyWebhook
- [x] Server actions: crearOrdenPayPal, capturarOrdenPayPal, cancelarSuscripcionPayPal, programarCambioPlan
- [x] API route: POST /api/paypal/webhook

---

### FASE 11 — Centro de Notificaciones ✅
**Duración estimada: 2-3 días**

- [x] Campanita con badge de no leídas (en topbar)
- [x] Panel dropdown de notificaciones con acciones
- [x] Notificación: factura autorizada/rechazada por SRI
- [x] Notificación: pago recibido
- [x] Notificación: usuario invitado
- [x] Notificación: recurrencia ejecutada
- [x] Marcar como leída (al hacer clic en enlace)
- [x] Marcar todas como leídas
- [x] Eliminar notificación individual
- [x] Fecha relativa en cada notificación
- [x] Server actions: crearNotificacion, crearNotificacionEmpresa, marcarLeida, marcarTodasLeidas, eliminarNotificacion
- [x] Layout: notificaciones filtradas por empresaId, take 20

---

### FASE 12 — API REST Pública ✅
**Duración estimada: 5-6 días**

- [x] Arquitectura de API (/api/v1/...)
- [x] Autenticación por API Key (SHA-256 hash en BD, Bearer Token)
- [x] Rate Limiting por API Key (60 req/min in-memory con limpieza)
- [x] Endpoint: GET /api/v1/empresas (listar), GET /empresas/{id}
- [x] Endpoint: CRUD clientes (GET, POST, PATCH, DELETE)
- [x] Endpoint: CRUD productos (GET, POST, PATCH, DELETE)
- [x] Endpoint: CRUD facturas (GET, POST), GET /facturas/{id}
- [x] Endpoint: GET /api/v1/reportes (resumen ventas, clientes, productos, cobrado)
- [x] Versionado de API (v1 en URL)
- [x] Logs de solicitudes (ultimoUso en api_keys)
- [x] Generación de API Keys desde la app (/configuracion/api-keys)
- [x] Revocación de API Keys (soft delete con activa=false)
- [x] Documentación interactiva (/documentacion-api + /api/v1/openapi.json)
- [x] Respuesta consistente: { data, pagination } en listas, { error, code } en errores
- [x] HTTP Status Codes correctos (200, 201, 204, 400, 401, 403, 404, 429)
- [x] Filtros: búsqueda, categoría, estado, fechas, paginación
- [x] Sidebar: "API Keys" y "Docs API" en sección Configuración

---

### FASE 13 — Dashboard Administrativo ContaSys ✅
**Duración estimada: 5-6 días**

- [x] Layout admin separado (rutas /admin/...)
- [x] Protección: solo rol 'superadmin'
- [x] Dashboard: KPIs globales de la plataforma
- [x] Gestión usuarios: listado, buscar, filtrar
- [x] Gestión usuarios: suspender / reactivar / eliminar
- [x] Gestión usuarios: restablecer contraseña
- [x] Gestión empresas: listado con estado de suscripción
- [x] Gestión empresas: activas, suspendidas, en trial
- [x] Gestión planes: crear, editar, activar, desactivar
- [x] Gestión financiera: MRR, ARR, suscripciones activas
- [x] Gestión financiera: tasa de crecimiento
- [x] Gestión financiera: suscripciones canceladas
- [x] Soporte: tickets, solicitudes, historial

---

### FASE 14 — Conversión de Monedas ✅
**Duración estimada: 1-2 días**

- [x] Integración con API de tipo de cambio (Frankfurter.app gratuita, sin API key)
- [x] Mostrar USD como moneda principal
- [x] Conversión referencial a EUR, COP, PEN
- [x] Mostrar fecha de última actualización
- [x] Widget de tipo de cambio en dashboard

---

### FASE 15 — Seguridad y Hardening ✅
**Duración estimada: 3-4 días**

- [x] Auditar y reforzar todas las políticas RLS (recurrencias + recurrencia_items habilitadas; pagos UPDATE/DELETE restringido a prop/admin; api_keys UPDATE policy)
- [x] Verificar que ningún service role key se exponga al cliente → 0 violaciones
- [x] Implementar headers de seguridad (X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, X-XSS-Protection)
- [x] Protección CSRF en formularios (Server Actions de Next.js tienen built-in CSRF vía Origin header)
- [x] Sanitización de entradas en servidor (Zod schemas existentes + lib/sanitize.ts)
- [x] Rate limiting en endpoints críticos (API v1: 60 req/min por API key via lib/api-auth.ts)
- [x] Validación de ownership en cada Server Action (patrón getEmpresaId() + verificación cookie empresa_activa)
- [x] Auditoría de acciones completa (lib/audit.ts creado, integrado en cliente.ts como patrón)
- [x] Variables de entorno: revisar que nada privado se exponga al browser → 0 violaciones

---

### FASE 16 — Optimización y PWA ✅
**Duración estimada: 3-4 días**

- [x] Optimización de imágenes (config `images.formats: ["avif", "webp"]` en next.config.ts)
- [x] Lazy loading de componentes pesados (recharts con `next/dynamic` en dashboard + reportes)
- [x] Paginación eficiente (server-side offset pagination en clientes, productos, facturas, retenciones, guías)
- [x] Configuración PWA (manifest.json, service worker con cache-first, offline page, theme-color, icon SVG)
- [x] Diseño mobile-first revisado (slide-out sidebars, responsive grids, forms adaptativos)

---

### FASE 17 — Testing y QA
**Duración estimada: 4-5 días**

- [ ] Tests unitarios en utilidades críticas (Zod schemas, calculadora IVA)
- [ ] Tests de integración en Server Actions principales
- [ ] Tests E2E: flujo de registro + onboarding
- [ ] Tests E2E: crear factura completa
- [ ] Tests E2E: flujo de suscripción
- [ ] Pruebas de RLS (intentar acceder a datos de otra empresa)
- [ ] Pruebas de roles y permisos
- [ ] Pruebas de webhooks PayPal
- [ ] QA general en todos los módulos
- [ ] Pruebas en distintos navegadores

---

### FASE 18 — Despliegue en Producción
**Duración estimada: 2-3 días**

- [ ] Configurar variables de entorno en Vercel (producción)
- [ ] Configurar variables de entorno en Supabase (producción)
- [ ] Ejecutar migraciones en base de datos de producción
- [ ] Configurar dominio personalizado en Vercel
- [ ] Configurar SSL (automático con Vercel)
- [ ] Configurar planes reales en PayPal (producción)
- [ ] Activar webhooks de PayPal en producción
- [ ] Configurar Supabase Auth con dominio de producción
- [ ] Configurar emails transaccionales (Resend o similar)
- [ ] Crear cuenta superadmin inicial
- [ ] Smoke testing en producción
- [ ] Configurar monitoreo (Vercel Analytics)
- [ ] Configurar alertas de errores (Sentry opcional)
- [ ] Documentación de despliegue

---

## 7. Detalle por Módulo

### Roles y Permisos

| Permiso | Propietario | Admin | Gerente | Contador | Facturación | Vendedor |
|---------|------------|-------|---------|----------|-------------|---------|
| Ver dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear facturas | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Anular facturas | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver reportes | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Reportes fiscales | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Gestionar clientes | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Gestionar productos | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Gestionar usuarios | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Configuración empresa | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gestión suscripción | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ver API Keys | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Flujo SRI Ecuador
```
Empresa crea factura
      ↓
Generar XML RIDE (estructura SRI)
      ↓
Firmar electrónicamente (certificado .p12)
      ↓
Enviar a SRI via SOAP (ambiente pruebas/producción)
      ↓
SRI responde: AUTORIZADO / RECHAZADO
      ↓
Si AUTORIZADO → guardar clave de acceso + PDF RIDE
Si RECHAZADO → mostrar error + reintentar
      ↓
Enviar comprobante al cliente por email
```

### Lógica de Suscripción (Opción A)
```
Usuario quiere cambiar plan
      ↓
¿Tiene suscripción activa?
  SÍ → Mostrar: "Tu plan X está activo hasta [fecha]"
       Mostrar botón: "Programar cambio de plan"
       Guardar plan_pendiente en BD
       NO cancelar ni reemplazar nada
  NO → Mostrar botón de suscripción normal
       Checkout con PayPal
       Webhook activa la suscripción
      ↓
Al finalizar período actual
      ↓
Cron job / webhook PayPal detecta renovación
      ↓
¿Hay plan pendiente?
  SÍ → Aplicar nuevo plan
       Crear nueva suscripción con plan pendiente
       Cancelar suscripción anterior en PayPal
  NO → Renovar automáticamente el plan actual
```

---

## 8. Seguridad

### Variables de Entorno

**Solo en servidor (nunca NEXT_PUBLIC_):**
```
SUPABASE_SERVICE_ROLE_KEY
PAYPAL_CLIENT_SECRET
CLAVE_FIRMA_SRI
DATABASE_URL
NEXTAUTH_SECRET
```

**Pueden ser públicas (NEXT_PUBLIC_):**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_PAYPAL_CLIENT_ID
NEXT_PUBLIC_APP_URL
```

### RLS Ejemplo
```sql
-- Política RLS para tabla facturas
CREATE POLICY "usuarios_solo_ven_sus_facturas"
ON facturas
FOR ALL
USING (
  empresa_id IN (
    SELECT empresa_id FROM empresa_usuarios
    WHERE usuario_id = auth.uid()
    AND activo = true
  )
);
```

### Checklist de Seguridad por Server Action
1. Verificar `auth.uid()` → usuario autenticado
2. Verificar que `empresa_id` pertenece al usuario
3. Verificar rol del usuario → tiene permiso
4. Validar todos los inputs con Zod
5. Ejecutar operación en BD
6. Registrar en auditoría

---

## 9. Despliegue en Producción

### Servicios requeridos
| Servicio | Tier recomendado | Costo aproximado |
|---------|-----------------|-----------------|
| Vercel | Pro | $20/mes |
| Supabase | Pro | $25/mes |
| PayPal | Standard (comisión por transacción) | Variable |
| Dominio | - | ~$12/año |
| Email (Resend) | Free → Pro | $0-20/mes |

### Pasos de despliegue
1. `git push` a rama `main` → Vercel despliega automáticamente
2. Variables de entorno en Vercel Dashboard (Settings → Environment Variables)
3. Supabase: proyecto de producción separado del de desarrollo
4. Ejecutar `npx prisma db push` o migraciones SQL contra producción
5. Seed inicial: crear usuario superadmin
6. Configurar DNS del dominio apuntando a Vercel
7. Activar modo producción en PayPal

### CI/CD con GitHub + Vercel
```
Push a feature/* → Preview deployment automático
Push a main     → Production deployment automático
Push a develop  → Staging deployment (opcional)
```

---

## 10. Estimación de Tiempos

| Fase | Descripción | Días estimados |
|------|-------------|----------------|
| 0 | Configuración e Infraestructura | 3-5 |
| 1 | Autenticación y Onboarding | 5-7 |
| 2 | Landing Page | 5-7 |
| 3 | Dashboard Principal | 4-5 |
| 4 | Gestión de Clientes | 4-5 |
| 5 | Gestión de Productos | 3-4 |
| 6 | Módulo de Facturación | 8-10 |
| 7 | Cuentas por Cobrar | 3-4 |
| 8 | Reportes | 5-6 |
| 9 | Multiempresa y Configuración | 4-5 |
| 10 | Sistema de Suscripciones | 6-8 |
| 11 | Centro de Notificaciones | 2-3 |
| 12 | API REST Pública | 5-6 |
| 13 | Dashboard Admin ContaSys | 5-6 ✅ |
| 14 | Conversión de Monedas | 1-2 ✅ |
| 15 | Seguridad y Hardening | 3-4 ✅ |
| 16 | Optimización y PWA | 3-4 ✅ |
| 17 | Testing y QA | 4-5 |
| 18 | Despliegue en Producción | 2-3 |
| **TOTAL** | | **~80-104 días** |

> **Nota:** Estimación para un desarrollador full-stack trabajando a tiempo completo. Con equipo de 2-3 personas el tiempo se reduce considerablemente.

---

*Documento generado: Junio 2025*
*Versión: 1.0*
*Proyecto: ContaSys — Facturación Electrónica Ecuador*
