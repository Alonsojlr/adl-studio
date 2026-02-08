-- =====================================================
-- FIX DIRECTO: Actualizar OCs 17419, 17435, 17438
-- =====================================================

-- PASO 1: Ver estado ANTES
SELECT
  '🔍 ANTES DEL FIX' as paso,
  numero,
  id,
  subtotal,
  iva,
  total,
  (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id) as items
FROM ordenes_compra oc
WHERE numero IN ('17419', '17435', '17438')
ORDER BY numero;

-- PASO 2: Ver items de cada OC
SELECT
  '📋 ITEMS OC 17419' as paso,
  id,
  item,
  cantidad,
  valor_unitario,
  descuento,
  (cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as subtotal_item
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17419');

SELECT
  '📋 ITEMS OC 17435' as paso,
  id,
  item,
  cantidad,
  valor_unitario,
  descuento,
  (cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as subtotal_item
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17435')
ORDER BY valor_unitario DESC
LIMIT 10;

SELECT
  '📋 ITEMS OC 17438' as paso,
  id,
  item,
  cantidad,
  valor_unitario,
  descuento,
  (cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as subtotal_item
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17438')
ORDER BY valor_unitario DESC
LIMIT 10;

-- PASO 3: ELIMINAR DUPLICADOS primero
WITH items_duplicados AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY orden_id, item, descripcion, cantidad, valor_unitario
      ORDER BY id DESC
    ) as rn
  FROM ordenes_compra_items
  WHERE orden_id IN (
    SELECT id FROM ordenes_compra WHERE numero IN ('17419', '17435', '17438')
  )
)
DELETE FROM ordenes_compra_items
WHERE id IN (
  SELECT id
  FROM items_duplicados
  WHERE rn > 1
);

-- PASO 4: ACTUALIZAR OC 17419 directamente
UPDATE ordenes_compra
SET
  subtotal = (
    SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0)
    FROM ordenes_compra_items
    WHERE orden_id = ordenes_compra.id
  ),
  iva = (
    SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0) * 0.19
    FROM ordenes_compra_items
    WHERE orden_id = ordenes_compra.id
  ),
  total = (
    SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0) * 1.19
    FROM ordenes_compra_items
    WHERE orden_id = ordenes_compra.id
  )
WHERE numero = '17419';

-- PASO 5: ACTUALIZAR OC 17435 directamente
UPDATE ordenes_compra
SET
  subtotal = (
    SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0)
    FROM ordenes_compra_items
    WHERE orden_id = ordenes_compra.id
  ),
  iva = (
    SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0) * 0.19
    FROM ordenes_compra_items
    WHERE orden_id = ordenes_compra.id
  ),
  total = (
    SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0) * 1.19
    FROM ordenes_compra_items
    WHERE orden_id = ordenes_compra.id
  )
WHERE numero = '17435';

-- PASO 6: ACTUALIZAR OC 17438 directamente
UPDATE ordenes_compra
SET
  subtotal = (
    SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0)
    FROM ordenes_compra_items
    WHERE orden_id = ordenes_compra.id
  ),
  iva = (
    SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0) * 0.19
    FROM ordenes_compra_items
    WHERE orden_id = ordenes_compra.id
  ),
  total = (
    SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0) * 1.19
    FROM ordenes_compra_items
    WHERE orden_id = ordenes_compra.id
  )
WHERE numero = '17438';

-- PASO 7: VERIFICAR resultado DESPUÉS
SELECT
  '✅ DESPUÉS DEL FIX' as paso,
  numero,
  subtotal as neto,
  iva,
  total,
  (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id) as items,
  CASE
    WHEN numero = '17419' AND total BETWEEN 288000 AND 290000 THEN '✅ CORRECTO'
    WHEN numero = '17435' AND total BETWEEN 2300000 AND 2400000 THEN '✅ CORRECTO'
    WHEN numero = '17438' THEN '✅ VERIFICAR MANUALMENTE'
    ELSE '❌ REVISAR: ' || total::text
  END as estado
FROM ordenes_compra oc
WHERE numero IN ('17419', '17435', '17438')
ORDER BY numero;

-- PASO 8: Calcular manualmente para verificar
SELECT
  '🧮 CÁLCULO MANUAL OC 17419' as paso,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as subtotal_calculado,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) * 0.19 as iva_calculado,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) * 1.19 as total_calculado
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17419');

SELECT
  '🧮 CÁLCULO MANUAL OC 17435' as paso,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as subtotal_calculado,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) * 0.19 as iva_calculado,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) * 1.19 as total_calculado
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17435');

SELECT
  '🧮 CÁLCULO MANUAL OC 17438' as paso,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as subtotal_calculado,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) * 0.19 as iva_calculado,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) * 1.19 as total_calculado
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17438');
