-- =====================================================
-- LIMPIEZA MASIVA: TODAS LAS OCs CON ITEMS DUPLICADOS
-- =====================================================

-- ADVERTENCIA: Este script eliminará items duplicados de TODAS las OCs
-- Asegúrate de hacer un backup antes de ejecutar

-- =====================================================
-- PASO 1: ELIMINAR ITEMS SOSPECHOSOS (valor <= 10)
-- =====================================================

-- Ver cuántos items se van a eliminar
SELECT
  'ITEMS QUE SE VAN A ELIMINAR' as paso,
  COUNT(*) as total_items,
  COUNT(DISTINCT orden_id) as ocs_afectadas
FROM ordenes_compra_items
WHERE valor_unitario <= 10;

-- Eliminar items con valor unitario <= 10
-- (Comentar esta línea si solo quieres ver el diagnóstico)
DELETE FROM ordenes_compra_items
WHERE valor_unitario <= 10;

-- =====================================================
-- PASO 2: ELIMINAR DUPLICADOS EXACTOS
-- =====================================================

-- Crear tabla temporal con items únicos (mantener el más reciente)
WITH items_duplicados AS (
  SELECT
    id,
    orden_id,
    item,
    descripcion,
    cantidad,
    valor_unitario,
    ROW_NUMBER() OVER (
      PARTITION BY orden_id, item, descripcion, cantidad, valor_unitario
      ORDER BY id DESC
    ) as rn
  FROM ordenes_compra_items
)
-- Eliminar duplicados (mantener solo el primero)
DELETE FROM ordenes_compra_items
WHERE id IN (
  SELECT id
  FROM items_duplicados
  WHERE rn > 1
);

-- =====================================================
-- PASO 3: RECALCULAR TOTALES DE TODAS LAS OCs
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
-- PASO 4: VERIFICACIÓN
-- =====================================================

-- Ver OCs que quedaron sin items
SELECT
  'OCs SIN ITEMS' as tipo,
  oc.numero,
  oc.codigo_protocolo,
  oc.subtotal,
  oc.total
FROM ordenes_compra oc
LEFT JOIN ordenes_compra_items oci ON oci.orden_id = oc.id
WHERE oci.id IS NULL
ORDER BY oc.numero DESC;

-- Ver OCs con totales correctos
SELECT
  'VERIFICACIÓN FINAL' as tipo,
  COUNT(*) as total_ocs,
  SUM(total) as suma_total_ocs,
  AVG(total) as promedio_oc
FROM ordenes_compra;

-- Ver OC 17419 específicamente
SELECT
  'RESULTADO OC 17419' as tipo,
  numero,
  codigo_protocolo,
  subtotal,
  iva,
  total,
  (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id) as cant_items,
  CASE
    WHEN subtotal BETWEEN 242000 AND 243000 THEN '✅ CORRECTO'
    ELSE '❌ VERIFICAR'
  END as estado
FROM ordenes_compra oc
WHERE numero = '17419';

-- =====================================================
-- RESUMEN
-- =====================================================

SELECT
  '✅ LIMPIEZA COMPLETADA' as status,
  COUNT(DISTINCT oc.id) as total_ocs_procesadas,
  COUNT(oci.id) as total_items_restantes,
  SUM(oc.total) as suma_total_ocs
FROM ordenes_compra oc
LEFT JOIN ordenes_compra_items oci ON oci.orden_id = oc.id;
