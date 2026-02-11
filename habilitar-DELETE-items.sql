-- =====================================================
-- HABILITAR DELETE para ordenes_compra_items
-- =====================================================

-- Ver políticas actuales de ordenes_compra_items
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual::text as using_expression,
  with_check::text as with_check_expression
FROM pg_policies
WHERE tablename = 'ordenes_compra_items';

-- Ver si RLS está habilitado
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'ordenes_compra_items';

-- Crear política para permitir DELETE a todos los usuarios
DROP POLICY IF EXISTS "Enable DELETE for all users" ON ordenes_compra_items;
CREATE POLICY "Enable DELETE for all users" ON ordenes_compra_items
FOR DELETE
USING (true);

-- Verificar que se creó
SELECT
  '✅ POLÍTICA CREADA' as resultado,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'ordenes_compra_items'
  AND cmd = 'DELETE';
