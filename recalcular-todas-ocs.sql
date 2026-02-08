-- =====================================================
-- RECALCULAR TOTALES DE TODAS LAS OCs
-- Este script actualiza subtotal, iva y total para TODAS las OCs
-- basándose en los items actuales en ordenes_compra_items
-- =====================================================

-- PASO 1: Ver cuántas OCs tienen totales descuadrados
SELECT
  '🔍 OCs CON TOTALES DESCUADRADOS' as paso,
  COUNT(*) as total_ocs_descuadradas,
  SUM(ABS(oc.total - COALESCE((
    SELECT SUM(
      (oci.cantidad * oci.valor_unitario) * (1 - COALESCE(oci.descuento, 0) / 100)
    ) * 1.19
    FROM ordenes_compra_items oci
    WHERE oci.orden_id = oc.id
  ), 0))) as diferencia_total
FROM ordenes_compra oc
WHERE ABS(oc.total - COALESCE((
  SELECT SUM(
    (oci.cantidad * oci.valor_unitario) * (1 - COALESCE(oci.descuento, 0) / 100)
  ) * 1.19
  FROM ordenes_compra_items oci
  WHERE oci.orden_id = oc.id
), 0)) > 100;

-- PASO 2: Listar las OCs que serán corregidas
SELECT
  '📋 DETALLE DE OCs A CORREGIR' as paso,
  oc.numero,
  oc.total as total_actual,
  COALESCE((
    SELECT SUM(
      (oci.cantidad * oci.valor_unitario) * (1 - COALESCE(oci.descuento, 0) / 100)
    ) * 1.19
    FROM ordenes_compra_items oci
    WHERE oci.orden_id = oc.id
  ), 0) as total_correcto,
  ABS(oc.total - COALESCE((
    SELECT SUM(
      (oci.cantidad * oci.valor_unitario) * (1 - COALESCE(oci.descuento, 0) / 100)
    ) * 1.19
    FROM ordenes_compra_items oci
    WHERE oci.orden_id = oc.id
  ), 0)) as diferencia
FROM ordenes_compra oc
WHERE ABS(oc.total - COALESCE((
  SELECT SUM(
    (oci.cantidad * oci.valor_unitario) * (1 - COALESCE(oci.descuento, 0) / 100)
  ) * 1.19
  FROM ordenes_compra_items oci
  WHERE oci.orden_id = oc.id
), 0)) > 100
ORDER BY diferencia DESC
LIMIT 20;

-- PASO 3: RECALCULAR TODAS LAS OCs
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

-- PASO 4: Verificar resultado
SELECT
  '✅ RESULTADO' as paso,
  COUNT(*) as total_ocs_procesadas,
  SUM(total) as suma_total_ocs,
  AVG(total) as promedio_por_oc
FROM ordenes_compra;

-- PASO 5: Verificar que no quedan OCs descuadradas
SELECT
  '✅ VERIFICACIÓN FINAL' as paso,
  COUNT(*) as ocs_descuadradas_restantes
FROM ordenes_compra oc
WHERE ABS(oc.total - COALESCE((
  SELECT SUM(
    (oci.cantidad * oci.valor_unitario) * (1 - COALESCE(oci.descuento, 0) / 100)
  ) * 1.19
  FROM ordenes_compra_items oci
  WHERE oci.orden_id = oc.id
), 0)) > 100;

-- PASO 6: Ver OC 17419 específicamente
SELECT
  '🎯 OC 17419 FINAL' as paso,
  numero,
  subtotal as neto,
  iva,
  total,
  (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id) as cant_items,
  CASE
    WHEN total BETWEEN 288000 AND 290000 THEN '✅ CORRECTO'
    ELSE '❌ INCORRECTO: ' || total::text
  END as estado
FROM ordenes_compra oc
WHERE numero = '17419';
