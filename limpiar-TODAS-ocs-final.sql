-- =====================================================
-- LIMPIEZA FINAL: TODAS LAS OCs CON PROBLEMAS
-- =====================================================
-- Este script limpia TODAS las OCs que tienen:
-- 1. Items duplicados
-- 2. Totales descuadrados
-- 3. Items fantasma
-- =====================================================

-- =====================================================
-- DIAGNÓSTICO INICIAL
-- =====================================================

-- Ver cuántas OCs tienen problemas
SELECT
  '🔍 DIAGNÓSTICO INICIAL' as paso,
  COUNT(DISTINCT oc.id) as ocs_con_problemas
FROM ordenes_compra oc
WHERE EXISTS (
  -- Tiene items duplicados
  SELECT 1
  FROM ordenes_compra_items oci
  WHERE oci.orden_id = oc.id
  GROUP BY oci.item, oci.descripcion, oci.cantidad, oci.valor_unitario
  HAVING COUNT(*) > 1
)
OR ABS(oc.total - COALESCE((
  -- O el total está descuadrado
  SELECT SUM(
    (cantidad * valor_unitario) * (1 - COALESCE(descuento, 0) / 100)
  ) * 1.19
  FROM ordenes_compra_items
  WHERE orden_id = oc.id
), 0)) > 100;

-- Listar OCs específicas con problemas conocidos
SELECT
  '📋 OCs CON PROBLEMAS CONOCIDOS' as paso,
  oc.numero,
  oc.codigo_protocolo,
  oc.total as total_actual,
  COALESCE((
    SELECT SUM(
      (cantidad * valor_unitario) * (1 - COALESCE(descuento, 0) / 100)
    ) * 1.19
    FROM ordenes_compra_items
    WHERE orden_id = oc.id
  ), 0) as total_correcto,
  (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id) as cant_items,
  ABS(oc.total - COALESCE((
    SELECT SUM(
      (cantidad * valor_unitario) * (1 - COALESCE(descuento, 0) / 100)
    ) * 1.19
    FROM ordenes_compra_items
    WHERE orden_id = oc.id
  ), 0)) as diferencia
FROM ordenes_compra oc
WHERE oc.numero IN ('17419', '17435', '17438')
ORDER BY oc.numero;

-- =====================================================
-- PARTE 1: ELIMINAR ITEMS DUPLICADOS
-- =====================================================

-- Ver cuántos duplicados hay
SELECT
  '🔄 ITEMS DUPLICADOS A ELIMINAR' as paso,
  COUNT(*) as items_a_eliminar
FROM (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY orden_id, item, descripcion, cantidad, valor_unitario
        ORDER BY id DESC
      ) as rn
    FROM ordenes_compra_items
  ) sub
  WHERE rn > 1
) duplicados;

-- Eliminar duplicados (mantener el más reciente)
WITH items_duplicados AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY orden_id, item, descripcion, cantidad, valor_unitario
      ORDER BY id DESC
    ) as rn
  FROM ordenes_compra_items
)
DELETE FROM ordenes_compra_items
WHERE id IN (
  SELECT id
  FROM items_duplicados
  WHERE rn > 1
);

-- =====================================================
-- PARTE 2: RECALCULAR TOTALES
-- =====================================================

-- Recalcular subtotal, iva y total para TODAS las OCs
UPDATE ordenes_compra oc
SET
  subtotal = (
    SELECT COALESCE(SUM(
      (COALESCE(oci.cantidad, 0) * COALESCE(oci.valor_unitario, 0)) *
      (1 - COALESCE(oci.descuento, 0) / 100)
    ), 0)
    FROM ordenes_compra_items oci
    WHERE oci.orden_id = oc.id
  ),
  iva = (
    SELECT COALESCE(SUM(
      (COALESCE(oci.cantidad, 0) * COALESCE(oci.valor_unitario, 0)) *
      (1 - COALESCE(oci.descuento, 0) / 100)
    ), 0) * 0.19
    FROM ordenes_compra_items oci
    WHERE oci.orden_id = oc.id
  ),
  total = (
    SELECT COALESCE(SUM(
      (COALESCE(oci.cantidad, 0) * COALESCE(oci.valor_unitario, 0)) *
      (1 - COALESCE(oci.descuento, 0) / 100)
    ), 0) * 1.19
    FROM ordenes_compra_items oci
    WHERE oci.orden_id = oc.id
  );

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar OC 17419
SELECT
  '✅ OC 17419' as paso,
  numero,
  subtotal as neto,
  iva,
  total,
  (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id) as items,
  CASE
    WHEN total BETWEEN 288000 AND 290000 THEN '✅ CORRECTO'
    WHEN total > 600000 THEN '❌ TODAVÍA INCORRECTO'
    ELSE '⚠️ REVISAR: ' || total::text
  END as estado
FROM ordenes_compra oc
WHERE numero = '17419';

-- Verificar OC 17435
SELECT
  '✅ OC 17435' as paso,
  numero,
  subtotal as neto,
  iva,
  total,
  (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id) as items,
  CASE
    WHEN total BETWEEN 2300000 AND 2400000 THEN '✅ CORRECTO'
    WHEN total = 4700000 THEN '❌ TODAVÍA INCORRECTO'
    ELSE '⚠️ REVISAR: ' || total::text
  END as estado
FROM ordenes_compra oc
WHERE numero = '17435';

-- Verificar OC 17438
SELECT
  '✅ OC 17438' as paso,
  numero,
  subtotal as neto,
  iva,
  total,
  (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id) as items,
  -- Buscar si todavía existe el item por 403,003
  (SELECT COUNT(*)
   FROM ordenes_compra_items
   WHERE orden_id = oc.id
     AND (valor_unitario BETWEEN 403000 AND 403010
          OR cantidad * valor_unitario BETWEEN 403000 AND 403010)
  ) as tiene_item_403003
FROM ordenes_compra oc
WHERE numero = '17438';

-- Items de OC 17438 (verificar que no esté el 403,003)
SELECT
  '📋 OC 17438 - ITEMS ACTUALES' as paso,
  id,
  item,
  cantidad,
  valor_unitario,
  (cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as subtotal
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17438')
ORDER BY valor_unitario DESC;

-- Resumen final
SELECT
  '📊 RESUMEN FINAL' as paso,
  COUNT(*) as total_ocs,
  SUM(total) as suma_total,
  (SELECT COUNT(*) FROM ordenes_compra_items) as total_items,
  COUNT(CASE WHEN total = 0 THEN 1 END) as ocs_en_cero
FROM ordenes_compra;

-- Verificar que no quedan duplicados
SELECT
  '🔍 VERIFICACIÓN DUPLICADOS' as paso,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ NO HAY DUPLICADOS'
    ELSE '❌ TODAVÍA HAY ' || COUNT(*)::text || ' GRUPOS DUPLICADOS'
  END as resultado,
  COUNT(*) as grupos_duplicados
FROM (
  SELECT
    orden_id,
    item,
    descripcion,
    cantidad,
    valor_unitario
  FROM ordenes_compra_items
  GROUP BY orden_id, item, descripcion, cantidad, valor_unitario
  HAVING COUNT(*) > 1
) duplicados;

-- Ver si hay OCs con totales descuadrados
SELECT
  '🔍 VERIFICACIÓN TOTALES' as paso,
  COUNT(*) as ocs_descuadradas
FROM ordenes_compra oc
WHERE ABS(oc.total - COALESCE((
  SELECT SUM(
    (cantidad * valor_unitario) * (1 - COALESCE(descuento, 0) / 100)
  ) * 1.19
  FROM ordenes_compra_items
  WHERE orden_id = oc.id
), 0)) > 100;

-- =====================================================
-- INSTRUCCIONES POST-EJECUCIÓN
-- =====================================================
-- Después de ejecutar este script:
-- 1. ✅ Verifica que las 3 OCs (17419, 17435, 17438) estén correctas
-- 2. 🔄 Ve al frontend y presiona Ctrl+Shift+R para refrescar
-- 3. ✅ Los totales deberían ser correctos
-- 4. 🧪 Prueba editando una OC - ahora debería funcionar correctamente
-- 5. 🧪 Prueba eliminando un item - debería eliminarse sin volver
