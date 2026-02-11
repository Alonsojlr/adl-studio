-- ============================================================
-- SETUP COMPLETO PARA NUEVA EMPRESA
-- Ejecutar en Supabase SQL Editor del nuevo proyecto
-- Crea TODAS las tablas, funciones, triggers y políticas RLS
-- ============================================================

-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABLA CLIENTES
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR UNIQUE,
  razon_social VARCHAR NOT NULL,
  rut VARCHAR,
  giro VARCHAR,
  direccion VARCHAR,
  ciudad VARCHAR,
  comuna VARCHAR,
  telefono VARCHAR,
  email VARCHAR,
  contacto VARCHAR,
  persona_encargada VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. TABLA PROVEEDORES
-- ============================================================
CREATE TABLE IF NOT EXISTS proveedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR UNIQUE,
  razon_social VARCHAR NOT NULL,
  rut VARCHAR,
  giro VARCHAR,
  direccion VARCHAR,
  ciudad VARCHAR,
  comuna VARCHAR,
  pais VARCHAR,
  telefono VARCHAR,
  email VARCHAR,
  contacto VARCHAR,
  condiciones_pago VARCHAR,
  banco VARCHAR,
  numero_cuenta VARCHAR,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. TABLA USUARIOS (perfiles vinculados a Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE,
  email VARCHAR NOT NULL,
  nombre VARCHAR,
  rol VARCHAR DEFAULT 'admin',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id ON usuarios(auth_id);

-- ============================================================
-- 4. TABLA COTIZACIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS cotizaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR,
  cliente_id UUID REFERENCES clientes(id),
  nombre_proyecto VARCHAR,
  estado VARCHAR DEFAULT 'emitida',
  fecha DATE,
  monto DECIMAL(12,2),
  neto DECIMAL(12,2),
  total DECIMAL(12,2),
  items JSONB,
  condiciones TEXT,
  adjudicada_a_protocolo VARCHAR,
  contacto VARCHAR,
  rut VARCHAR,
  unidad VARCHAR,
  cotizado VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cotizaciones_neto ON cotizaciones(neto);

-- ============================================================
-- 5. TABLA PROTOCOLOS
-- ============================================================
CREATE TABLE IF NOT EXISTS protocolos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folio VARCHAR UNIQUE,
  numero_cotizacion VARCHAR,
  cliente_id UUID REFERENCES clientes(id),
  fecha DATE,
  estado VARCHAR DEFAULT 'Abierto',
  monto_total DECIMAL(12,2),
  monto_neto DECIMAL(12,2),
  items JSONB,
  tipo VARCHAR,
  nombre VARCHAR,
  oc_cliente VARCHAR,
  factura_bm VARCHAR,
  fecha_factura_bm DATE,
  rut VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_protocolos_monto_neto ON protocolos(monto_neto);
CREATE INDEX IF NOT EXISTS idx_protocolos_folio ON protocolos(folio);
CREATE INDEX IF NOT EXISTS idx_protocolos_numero_cotizacion ON protocolos(numero_cotizacion);

-- ============================================================
-- 6. TABLA PROTOCOLOS_FACTURAS
-- ============================================================
CREATE TABLE IF NOT EXISTS protocolos_facturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocolo_id UUID REFERENCES protocolos(id) ON DELETE CASCADE,
  numero VARCHAR,
  tipo_doc VARCHAR DEFAULT 'Factura',
  fecha DATE,
  monto_neto DECIMAL(12,2),
  iva DECIMAL(12,2),
  total DECIMAL(12,2),
  estado VARCHAR DEFAULT 'Emitida',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 7. TABLA ORDENES_COMPRA
-- ============================================================
CREATE TABLE IF NOT EXISTS ordenes_compra (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR,
  codigo_protocolo VARCHAR,
  proveedor_id UUID REFERENCES proveedores(id),
  fecha DATE,
  estado VARCHAR DEFAULT 'Pendiente',
  subtotal DECIMAL(12,2),
  iva DECIMAL(12,2),
  total DECIMAL(12,2),
  numero_factura VARCHAR,
  fecha_factura DATE,
  estado_pago VARCHAR DEFAULT 'Pendiente',
  fecha_pago DATE,
  tipo_costo VARCHAR,
  centro_costo VARCHAR,
  actividad_uso VARCHAR,
  responsable VARCHAR,
  contacto VARCHAR,
  direccion VARCHAR,
  rut VARCHAR,
  forma VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ordenes_compra_proveedor_id ON ordenes_compra(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_compra_codigo_protocolo ON ordenes_compra(codigo_protocolo);
CREATE INDEX IF NOT EXISTS idx_ordenes_compra_subtotal ON ordenes_compra(subtotal);

-- ============================================================
-- 8. TABLA ORDENES_COMPRA_ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS ordenes_compra_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_id UUID REFERENCES ordenes_compra(id) ON DELETE CASCADE,
  item VARCHAR,
  descripcion VARCHAR,
  cantidad NUMERIC,
  valor_unitario DECIMAL(12,2),
  descuento NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ordenes_compra_items_orden_id ON ordenes_compra_items(orden_id);

-- ============================================================
-- 9. TABLA ADMINISTRACION_GASTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS administracion_gastos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR,
  fecha DATE,
  nombre VARCHAR,
  monto DECIMAL(12,2),
  monto_neto DECIMAL(12,2),
  iva DECIMAL(12,2),
  total DECIMAL(12,2),
  tipo VARCHAR,
  tipo_costo VARCHAR,
  centro_costo VARCHAR,
  actividad_uso VARCHAR,
  medio_pago VARCHAR,
  proveedor VARCHAR,
  observaciones TEXT,
  pagado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 10. TABLA INVENTARIO - ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS "Tabla items (inventario)" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR,
  nombre VARCHAR,
  descripcion VARCHAR,
  categoria VARCHAR,
  especificaciones TEXT,
  unidad_medida VARCHAR,
  stock_total NUMERIC DEFAULT 0,
  stock_minimo NUMERIC DEFAULT 0,
  ubicacion VARCHAR,
  proveedor_principal VARCHAR,
  precio_costo DECIMAL(12,2),
  precio_venta DECIMAL(12,2),
  foto_url VARCHAR,
  actividad_uso VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 11. TABLA INVENTARIO - RESERVAS
-- ============================================================
CREATE TABLE IF NOT EXISTS "Tabla reservas (inventario_reservas)" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES "Tabla items (inventario)"(id),
  protocolo VARCHAR,
  cantidad NUMERIC,
  fecha_desde DATE,
  fecha_hasta DATE,
  devuelto BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 12. FUNCIONES Y TRIGGERS
-- ============================================================

-- Función para calcular neto desde items JSONB
CREATE OR REPLACE FUNCTION calcular_neto_desde_items(items_json jsonb)
RETURNS DECIMAL(12,2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  neto DECIMAL(12,2);
BEGIN
  SELECT SUM(
    (COALESCE((item->>'cantidad')::numeric, 0) *
     COALESCE((item->>'valorUnitario')::numeric, (item->>'valor_unitario')::numeric, 0)) *
    (1 - COALESCE((item->>'descuento')::numeric, 0) / 100)
  ) INTO neto
  FROM jsonb_array_elements(items_json) item;

  RETURN COALESCE(neto, 0);
END;
$$;

-- Trigger para actualizar neto en cotizaciones
CREATE OR REPLACE FUNCTION actualizar_neto_cotizacion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.items IS NOT NULL AND jsonb_array_length(NEW.items) > 0 THEN
    NEW.neto := calcular_neto_desde_items(NEW.items);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_neto_cotizacion ON cotizaciones;
CREATE TRIGGER trigger_actualizar_neto_cotizacion
  BEFORE INSERT OR UPDATE OF items ON cotizaciones
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_neto_cotizacion();

-- ============================================================
-- 13. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocolos ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocolos_facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE administracion_gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tabla items (inventario)" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tabla reservas (inventario_reservas)" ENABLE ROW LEVEL SECURITY;

-- Políticas: usuarios autenticados tienen acceso completo
CREATE POLICY "Authenticated full access" ON clientes FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON proveedores FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON cotizaciones FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON protocolos FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON protocolos_facturas FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON ordenes_compra FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON ordenes_compra_items FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON administracion_gastos FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON "Tabla items (inventario)" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON "Tabla reservas (inventario_reservas)" FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Usuarios: acceso para authenticated + service_role (Edge Function)
CREATE POLICY "Authenticated full access" ON usuarios FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Service role full access" ON usuarios FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
