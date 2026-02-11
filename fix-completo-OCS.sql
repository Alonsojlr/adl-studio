-- =====================================================
-- FIX COMPLETO: ELIMINAR DUPLICADOS Y RECALCULAR TODAS LAS OCs
-- =====================================================
-- Este script hace 2 cosas:
-- 1. Elimina items duplicados de TODAS las OCs
-- 2. Recalcula los totales correctamente
-- =====================================================

-- =====================================================
-- PARTE 1: DIAGNÓSTICO INICIAL
-- =====================================================

-- Ver cuántos items duplicados hay
SELECT
  '🔍 DIAGNÓSTICO INICIAL' as paso,
  COUNT(*) as total_items_duplicados,
  COUNT(DISTINCT orden_id) as ocs_afectadas
FROM (
  SELECT
    orden_id,
    item,
    descripcion,
    cantidad,
    valor_unitario,
    COUNT(*) as repeticiones
  FROM ordenes_compra_items
  GROUP BY orden_id, item, descripcion, cantidad, valor_unitario
  HAVING COUNT(*) > 1
) duplicados;

-- Ver OCs específicas con problemas
SELECT
  '📋 OCs CON PROBLEMAS CONOCIDOS' as paso,
  oc.numero,
  oc.total as total_actual,
  (SELECT SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) * 1.19
   FROM ordenes_compra_items WHERE orden_id = oc.id) as total_calculado,
  (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id) as cant_items
FROM ordenes_compra oc
WHERE oc.numero IN ('17419', '17435')
ORDER BY oc.numero;

-- =====================================================
-- PARTE 2: ELIMINAR DUPLICADOS
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
-- Eliminar duplicados (mantener solo el primero = más reciente)
DELETE FROM ordenes_compra_items
WHERE id IN (
  SELECT id
  FROM items_duplicados
  WHERE rn > 1
);

-- Ver cuántos items se eliminaron
SELECT
  '🗑️ ITEMS ELIMINADOS' as paso,
  (SELECT COUNT(*) FROM ordenes_compra_items) as items_restantes;

-- =====================================================
-- PARTE 3: RECALCULAR TOTALES DE TODAS LAS OCs
-- =====================================================

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
-- PARTE 4: VERIFICACIÓN FINAL
-- =====================================================

-- Verificar OC 17419
SELECT
  '✅ VERIFICACIÓN OC 17419' as paso,
  numero,
  subtotal as neto,
  iva,
  total,
  (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id) as cant_items,
  CASE
    WHEN total BETWEEN 288000 AND 290000 THEN '✅ CORRECTO (~288,399)'
    WHEN total > 600000 THEN '❌ TODAVÍA INCORRECTO (619,720)'
    ELSE '⚠️ VALOR: ' || total::text
  END as estado
FROM ordenes_compra oc
WHERE numero = '17419';

-- Verificar OC 17435
SELECT
  '✅ VERIFICACIÓN OC 17435' as paso,
  numero,
  subtotal as neto,
  iva,
  total,
  (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id) as cant_items,
  CASE
    WHEN total BETWEEN 2300000 AND 2400000 THEN '✅ CORRECTO (~2,350,000)'
    WHEN total = 4700000 THEN '❌ TODAVÍA INCORRECTO (4,700,000)'
    ELSE '⚠️ VALOR: ' || total::text
  END as estado
FROM ordenes_compra oc
WHERE numero = '17435';

-- Ver items finales de OC 17419
SELECT
  '📋 OC 17419 - ITEMS FINALES' as paso,
  id,
  item,
  cantidad,
  valor_unitario,
  (cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as subtotal_item
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17419');

-- Ver items finales de OC 17435
SELECT
  '📋 OC 17435 - ITEMS FINALES' as paso,
  id,
  item,
  cantidad,
  valor_unitario,
  (cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as subtotal_item
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17435')
ORDER BY valor_unitario DESC
LIMIT 10;

-- Resumen general
SELECT
  '📊 RESUMEN GENERAL' as paso,
  COUNT(*) as total_ocs,
  SUM(total) as suma_total,
  (SELECT COUNT(*) FROM ordenes_compra_items) as total_items_en_sistema
FROM ordenes_compra;

-- Verificar que no quedan duplicados
SELECT
  '🔍 DUPLICADOS RESTANTES' as paso,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ NO HAY DUPLICADOS'
    ELSE '❌ TODAVÍA HAY ' || COUNT(*)::text || ' DUPLICADOS'
  END as resultado
FROM (
  SELECT
    orden_id,
    item,
    descripcion,
    cantidad,
    valor_unitario,
    COUNT(*) as repeticiones
  FROM ordenes_compra_items
  GROUP BY orden_id, item, descripcion, cantidad, valor_unitario
  HAVING COUNT(*) > 1
) duplicados;
