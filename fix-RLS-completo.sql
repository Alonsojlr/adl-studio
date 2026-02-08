-- =====================================================
-- FIX RLS COMPLETO: Habilitar todas las operaciones
-- =====================================================

-- Ver políticas actuales
SELECT
  '🔍 POLÍTICAS ACTUALES' as paso,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('ordenes_compra', 'ordenes_compra_items')
ORDER BY tablename, cmd;

-- =====================================================
-- TABLA: ordenes_compra
-- =====================================================

-- Eliminar políticas existentes si hay conflicto
DROP POLICY IF EXISTS "Enable SELECT for all users" ON ordenes_compra;
DROP POLICY IF EXISTS "Enable INSERT for all users" ON ordenes_compra;
DROP POLICY IF EXISTS "Enable UPDATE for all users" ON ordenes_compra;
DROP POLICY IF EXISTS "Enable DELETE for all users" ON ordenes_compra;

-- Crear políticas para todas las operaciones
CREATE POLICY "Enable SELECT for all users" ON ordenes_compra
FOR SELECT
USING (true);

CREATE POLICY "Enable INSERT for all users" ON ordenes_compra
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable UPDATE for all users" ON ordenes_compra
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable DELETE for all users" ON ordenes_compra
FOR DELETE
USING (true);

-- =====================================================
-- TABLA: ordenes_compra_items
-- =====================================================

-- Eliminar políticas existentes si hay conflicto
DROP POLICY IF EXISTS "Enable SELECT for all users" ON ordenes_compra_items;
DROP POLICY IF EXISTS "Enable INSERT for all users" ON ordenes_compra_items;
DROP POLICY IF EXISTS "Enable UPDATE for all users" ON ordenes_compra_items;
DROP POLICY IF EXISTS "Enable DELETE for all users" ON ordenes_compra_items;

-- Crear políticas para todas las operaciones
CREATE POLICY "Enable SELECT for all users" ON ordenes_compra_items
FOR SELECT
USING (true);

CREATE POLICY "Enable INSERT for all users" ON ordenes_compra_items
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable UPDATE for all users" ON ordenes_compra_items
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable DELETE for all users" ON ordenes_compra_items
FOR DELETE
USING (true);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver políticas creadas
SELECT
  '✅ POLÍTICAS FINALES' as paso,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('ordenes_compra', 'ordenes_compra_items')
ORDER BY tablename, cmd;

-- Verificar que RLS está habilitado
SELECT
  '✅ RLS STATUS' as paso,
  tablename,
  CASE
    WHEN rowsecurity THEN '✅ HABILITADO'
    ELSE '❌ DESHABILITADO'
  END as estado_rls
FROM pg_tables
WHERE tablename IN ('ordenes_compra', 'ordenes_compra_items');
