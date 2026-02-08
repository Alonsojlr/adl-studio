-- =====================================================
-- DIAGNÓSTICO: OC 17438
-- Ver el item fantasma por 403,003 que no se puede borrar
-- =====================================================

-- PASO 1: Ver la OC completa
SELECT
  '🔍 OC 17438 - INFO PRINCIPAL' as paso,
  id,
  numero,
  codigo_protocolo,
  proveedor_id,
  subtotal,
  iva,
  total,
  fecha,
  estado
FROM ordenes_compra
WHERE numero = '17438';

-- PASO 2: Ver TODOS los items de esta OC
SELECT
  '📋 OC 17438 - TODOS LOS ITEMS' as paso,
  id,
  orden_id,
  item,
  descripcion,
  cantidad,
  valor_unitario,
  descuento,
  (cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as subtotal_item,
  created_at
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17438')
ORDER BY created_at DESC;

-- PASO 3: Buscar el item por 403,003
SELECT
  '🎯 ITEM PROBLEMÁTICO (403,003)' as paso,
  id,
  item,
  descripcion,
  cantidad,
  valor_unitario,
  descuento,
  (cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as subtotal_item,
  created_at
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17438')
  AND (
    valor_unitario BETWEEN 403000 AND 403010
    OR cantidad * valor_unitario BETWEEN 403000 AND 403010
  );

-- PASO 4: Ver items duplicados
SELECT
  '🔄 ITEMS DUPLICADOS' as paso,
  item,
  descripcion,
  cantidad,
  valor_unitario,
  COUNT(*) as veces_repetido
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17438')
GROUP BY item, descripcion, cantidad, valor_unitario
HAVING COUNT(*) > 1;

-- PASO 5: Calcular total correcto
SELECT
  '🧮 CÁLCULO DEL TOTAL' as paso,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as subtotal_calculado,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) * 0.19 as iva_calculado,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) * 1.19 as total_calculado,
  (SELECT total FROM ordenes_compra WHERE numero = '17438') as total_en_bd,
  ABS((SELECT total FROM ordenes_compra WHERE numero = '17438') -
      SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) * 1.19) as diferencia
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17438');

-- PASO 6: Ver historial de cambios (si hay timestamps)
SELECT
  '⏰ ORDEN CRONOLÓGICO DE ITEMS' as paso,
  id,
  item,
  valor_unitario,
  created_at,
  CASE
    WHEN valor_unitario BETWEEN 403000 AND 403010 THEN '❌ ITEM VIEJO QUE DEBERÍA BORRARSE'
    ELSE '✅ ITEM ACTUAL'
  END as estado
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17438')
ORDER BY created_at;
