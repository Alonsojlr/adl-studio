-- =====================================================
-- VERIFICAR TRIGGERS Y RESTRICCIONES POR ESTADO
-- =====================================================

-- 1. Ver el estado actual de las 3 OCs
SELECT
  numero,
  estado,
  estado_pago,
  subtotal,
  total
FROM ordenes_compra
WHERE numero IN ('17419', '17435', '17438')
ORDER BY numero;

-- 2. Ver si hay triggers en la tabla ordenes_compra
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'ordenes_compra';

-- 3. Ver políticas RLS que usen el campo 'estado'
SELECT
  policyname,
  cmd,
  qual::text as using_expression,
  with_check::text as with_check_expression
FROM pg_policies
WHERE tablename = 'ordenes_compra'
  AND (qual::text LIKE '%estado%' OR with_check::text LIKE '%estado%');

-- 4. PROBAR: Cambiar estado a 'Emitida' temporalmente
UPDATE ordenes_compra
SET estado = 'Emitida'
WHERE numero = '17419';

-- 5. PROBAR: Ahora intentar actualizar subtotal
UPDATE ordenes_compra
SET subtotal = 999999
WHERE numero = '17419';

-- 6. Verificar si funcionó
SELECT numero, estado, subtotal
FROM ordenes_compra
WHERE numero = '17419';

-- 7. Si funcionó, volver a dejar como estaba
UPDATE ordenes_compra
SET estado = 'Facturada'
WHERE numero = '17419';
