-- =====================================================
-- LIMPIEZA: ORDEN DE COMPRA 17419
-- Eliminar items duplicados/incorrectos (3 x $10)
-- Mantener solo el item correcto ($242.352)
-- =====================================================

-- PASO 1: VER ITEMS ANTES DE LIMPIAR
SELECT
  'ANTES DE LIMPIAR' as estado,
  id,
  item,
  descripcion,
  cantidad,
  valor_unitario,
  (cantidad * valor_unitario) as total_item
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17419')
ORDER BY valor_unitario DESC;

-- PASO 2: ELIMINAR items incorrectos (los 3 items por $10 o menos)
DELETE FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17419')
  AND valor_unitario <= 10;

-- PASO 3: VER ITEMS DESPUÉS DE LIMPIAR
SELECT
  'DESPUÉS DE LIMPIAR' as estado,
  id,
  item,
  descripcion,
  cantidad,
  valor_unitario,
  (cantidad * valor_unitario) as total_item,
  (cantidad * valor_unitario * (1 - descuento / 100)) as subtotal_item
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17419')
ORDER BY id;

-- PASO 4: RECALCULAR totales de la OC
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
  )
WHERE numero = '17419';

-- PASO 5: VERIFICAR RESULTADO FINAL
SELECT
  'RESULTADO FINAL' as paso,
  numero,
  subtotal,
  iva,
  total,
  CASE
    WHEN subtotal BETWEEN 242000 AND 243000 THEN '✅ CORRECTO'
    ELSE '❌ INCORRECTO'
  END as estado_subtotal,
  CASE
    WHEN total BETWEEN 288000 AND 290000 THEN '✅ CORRECTO'
    ELSE '❌ INCORRECTO'
  END as estado_total
FROM ordenes_compra
WHERE numero = '17419';

-- PASO 6: Contar items finales
SELECT
  'ITEMS FINALES' as paso,
  COUNT(*) as total_items,
  SUM(cantidad * valor_unitario) as suma_items
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17419');

-- =====================================================
-- RESUMEN
-- =====================================================
SELECT
  'RESUMEN FINAL' as tipo,
  'OC 17419' as orden,
  oc.subtotal as neto,
  oc.iva,
  oc.total,
  COUNT(oci.id) as cant_items
FROM ordenes_compra oc
LEFT JOIN ordenes_compra_items oci ON oci.orden_id = oc.id
WHERE oc.numero = '17419'
GROUP BY oc.id, oc.numero, oc.subtotal, oc.iva, oc.total;
