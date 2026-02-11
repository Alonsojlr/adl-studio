-- ============================================================
-- MIGRACIÓN A SUPABASE AUTH
-- Ejecutar en Supabase SQL Editor ANTES de deploy del frontend
-- ============================================================

-- ============================================================
-- PASO 1: Agregar columna auth_id a tabla usuarios
-- ============================================================
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id ON usuarios(auth_id);

-- ============================================================
-- PASO 2: Actualizar políticas RLS en TODAS las tablas
-- Reemplazar USING(true) por USING(auth.uid() IS NOT NULL)
-- Esto requiere estar autenticado para cualquier operación
-- ============================================================

-- --- cotizaciones ---
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable SELECT for all users" ON cotizaciones;
DROP POLICY IF EXISTS "Enable INSERT for all users" ON cotizaciones;
DROP POLICY IF EXISTS "Enable UPDATE for all users" ON cotizaciones;
DROP POLICY IF EXISTS "Enable DELETE for all users" ON cotizaciones;
DROP POLICY IF EXISTS "Authenticated full access" ON cotizaciones;
CREATE POLICY "Authenticated full access" ON cotizaciones
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- --- protocolos ---
ALTER TABLE protocolos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable SELECT for all users" ON protocolos;
DROP POLICY IF EXISTS "Enable INSERT for all users" ON protocolos;
DROP POLICY IF EXISTS "Enable UPDATE for all users" ON protocolos;
DROP POLICY IF EXISTS "Enable DELETE for all users" ON protocolos;
DROP POLICY IF EXISTS "Authenticated full access" ON protocolos;
CREATE POLICY "Authenticated full access" ON protocolos
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- --- protocolos_facturas ---
ALTER TABLE protocolos_facturas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable SELECT for all users" ON protocolos_facturas;
DROP POLICY IF EXISTS "Enable INSERT for all users" ON protocolos_facturas;
DROP POLICY IF EXISTS "Enable UPDATE for all users" ON protocolos_facturas;
DROP POLICY IF EXISTS "Enable DELETE for all users" ON protocolos_facturas;
DROP POLICY IF EXISTS "Authenticated full access" ON protocolos_facturas;
CREATE POLICY "Authenticated full access" ON protocolos_facturas
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- --- ordenes_compra ---
ALTER TABLE ordenes_compra ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable SELECT for all users" ON ordenes_compra;
DROP POLICY IF EXISTS "Enable INSERT for all users" ON ordenes_compra;
DROP POLICY IF EXISTS "Enable UPDATE for all users" ON ordenes_compra;
DROP POLICY IF EXISTS "Enable DELETE for all users" ON ordenes_compra;
DROP POLICY IF EXISTS "Enable DELETE for authenticated users" ON ordenes_compra;
DROP POLICY IF EXISTS "Authenticated full access" ON ordenes_compra;
CREATE POLICY "Authenticated full access" ON ordenes_compra
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- --- ordenes_compra_items ---
ALTER TABLE ordenes_compra_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable SELECT for all users" ON ordenes_compra_items;
DROP POLICY IF EXISTS "Enable INSERT for all users" ON ordenes_compra_items;
DROP POLICY IF EXISTS "Enable UPDATE for all users" ON ordenes_compra_items;
DROP POLICY IF EXISTS "Enable DELETE for all users" ON ordenes_compra_items;
DROP POLICY IF EXISTS "Enable DELETE for authenticated users" ON ordenes_compra_items;
DROP POLICY IF EXISTS "Authenticated full access" ON ordenes_compra_items;
CREATE POLICY "Authenticated full access" ON ordenes_compra_items
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- --- clientes ---
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable SELECT for all users" ON clientes;
DROP POLICY IF EXISTS "Enable INSERT for all users" ON clientes;
DROP POLICY IF EXISTS "Enable UPDATE for all users" ON clientes;
DROP POLICY IF EXISTS "Enable DELETE for all users" ON clientes;
DROP POLICY IF EXISTS "Authenticated full access" ON clientes;
CREATE POLICY "Authenticated full access" ON clientes
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- --- proveedores ---
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable SELECT for all users" ON proveedores;
DROP POLICY IF EXISTS "Enable INSERT for all users" ON proveedores;
DROP POLICY IF EXISTS "Enable UPDATE for all users" ON proveedores;
DROP POLICY IF EXISTS "Enable DELETE for all users" ON proveedores;
DROP POLICY IF EXISTS "Authenticated full access" ON proveedores;
CREATE POLICY "Authenticated full access" ON proveedores
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- --- usuarios ---
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable SELECT for all users" ON usuarios;
DROP POLICY IF EXISTS "Enable INSERT for all users" ON usuarios;
DROP POLICY IF EXISTS "Enable UPDATE for all users" ON usuarios;
DROP POLICY IF EXISTS "Enable DELETE for all users" ON usuarios;
DROP POLICY IF EXISTS "Authenticated full access" ON usuarios;
DROP POLICY IF EXISTS "Service role full access" ON usuarios;

-- Usuarios autenticados pueden leer y actualizar
CREATE POLICY "Authenticated full access" ON usuarios
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Service role necesita acceso para la Edge Function de crear usuarios
CREATE POLICY "Service role full access" ON usuarios
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- --- administracion_gastos ---
ALTER TABLE administracion_gastos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable SELECT for all users" ON administracion_gastos;
DROP POLICY IF EXISTS "Enable INSERT for all users" ON administracion_gastos;
DROP POLICY IF EXISTS "Enable UPDATE for all users" ON administracion_gastos;
DROP POLICY IF EXISTS "Enable DELETE for all users" ON administracion_gastos;
DROP POLICY IF EXISTS "Authenticated full access" ON administracion_gastos;
CREATE POLICY "Authenticated full access" ON administracion_gastos
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- --- Tabla items (inventario) ---
-- Nota: el nombre de la tabla tiene espacios y paréntesis
ALTER TABLE "Tabla items (inventario)" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable SELECT for all users" ON "Tabla items (inventario)";
DROP POLICY IF EXISTS "Enable INSERT for all users" ON "Tabla items (inventario)";
DROP POLICY IF EXISTS "Enable UPDATE for all users" ON "Tabla items (inventario)";
DROP POLICY IF EXISTS "Enable DELETE for all users" ON "Tabla items (inventario)";
DROP POLICY IF EXISTS "Authenticated full access" ON "Tabla items (inventario)";
CREATE POLICY "Authenticated full access" ON "Tabla items (inventario)"
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- --- Tabla reservas (inventario_reservas) ---
ALTER TABLE "Tabla reservas (inventario_reservas)" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable SELECT for all users" ON "Tabla reservas (inventario_reservas)";
DROP POLICY IF EXISTS "Enable INSERT for all users" ON "Tabla reservas (inventario_reservas)";
DROP POLICY IF EXISTS "Enable UPDATE for all users" ON "Tabla reservas (inventario_reservas)";
DROP POLICY IF EXISTS "Enable DELETE for all users" ON "Tabla reservas (inventario_reservas)";
DROP POLICY IF EXISTS "Authenticated full access" ON "Tabla reservas (inventario_reservas)";
CREATE POLICY "Authenticated full access" ON "Tabla reservas (inventario_reservas)"
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
