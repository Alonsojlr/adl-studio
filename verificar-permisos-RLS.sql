-- =====================================================
-- VERIFICAR POLÍTICAS RLS Y PERMISOS
-- =====================================================

-- 1. Ver políticas RLS de ordenes_compra
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'ordenes_compra';

-- 2. Ver si RLS está habilitado
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('ordenes_compra', 'ordenes_compra_items');

-- 3. Intentar UPDATE directo con valores fijos (para probar si funciona)
UPDATE ordenes_compra
SET subtotal = 999999
WHERE numero = '17419';

-- 4. Verificar si el UPDATE funcionó
SELECT numero, subtotal, iva, total
FROM ordenes_compra
WHERE numero = '17419';
