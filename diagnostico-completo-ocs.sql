-- =====================================================
-- DIAGNÓSTICO COMPLETO - OCs CON PROBLEMAS
-- =====================================================

-- PASO 1: Verificar OC 17419 - ¿Los valores se actualizaron?
SELECT
  '🔍 OC 17419 - VALORES EN BD' as paso,
  oc.numero,
  oc.id as orden_id,
  oc.subtotal as subtotal_en_bd,
  oc.iva as iva_en_bd,
  oc.total as total_en_bd,
  (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id) as cant_items,
  CASE
    WHEN oc.total > 600000 THEN '❌ NO SE ACTUALIZÓ - SIGUE CON VALOR VIEJO'
    WHEN oc.total BETWEEN 288000 AND 290000 THEN '✅ ACTUALIZADO CORRECTAMENTE'
    ELSE '⚠️ VALOR INESPERADO'
  END as estado
FROM ordenes_compra oc
WHERE oc.numero = '17419';

-- PASO 2: Ver items de OC 17419
SELECT
  '📋 OC 17419 - ITEMS' as paso,
  id,
  item,
  descripcion,
  cantidad,
  valor_unitario,
  descuento,
  (cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as subtotal_item
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17419')
ORDER BY valor_unitario DESC;

-- PASO 3: Calcular manualmente el total de OC 17419
SELECT
  '🧮 OC 17419 - CÁLCULO MANUAL' as paso,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as subtotal_calculado,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) * 0.19 as iva_calculado,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) * 1.19 as total_calculado
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17419');

-- =====================================================
-- DIAGNÓSTICO OC 17435
-- =====================================================

-- PASO 4: Verificar OC 17435 - Estado actual
SELECT
  '🔍 OC 17435 - VALORES EN BD' as paso,
  oc.numero,
  oc.id as orden_id,
  oc.subtotal as subtotal_en_bd,
  oc.total as total_en_bd,
  (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id) as cant_items,
  CASE
    WHEN oc.total = 4700000 THEN '❌ VALOR INCORRECTO (DUPLICADO)'
    WHEN oc.total BETWEEN 2300000 AND 2400000 THEN '✅ VALOR CORRECTO'
    ELSE '⚠️ OTRO VALOR: ' || oc.total::text
  END as estado
FROM ordenes_compra oc
WHERE oc.numero = '17435';

-- PASO 5: Ver items de OC 17435 (buscar duplicados)
SELECT
  '📋 OC 17435 - ITEMS' as paso,
  id,
  item,
  descripcion,
  cantidad,
  valor_unitario,
  descuento,
  (cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as subtotal_item
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17435')
ORDER BY item, valor_unitario DESC;

-- PASO 6: Buscar items duplicados en OC 17435
SELECT
  '🔄 OC 17435 - DUPLICADOS' as paso,
  item,
  descripcion,
  cantidad,
  valor_unitario,
  COUNT(*) as veces_repetido,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as subtotal_total
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17435')
GROUP BY item, descripcion, cantidad, valor_unitario
HAVING COUNT(*) > 1;

-- PASO 7: Calcular total correcto de OC 17435
SELECT
  '🧮 OC 17435 - CÁLCULO MANUAL' as paso,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as subtotal_calculado,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) * 1.19 as total_calculado
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17435');

-- =====================================================
-- BUSCAR TODAS LAS OCs CON ITEMS DUPLICADOS
-- =====================================================

-- PASO 8: Encontrar todas las OCs con items duplicados exactos
WITH duplicados AS (
  SELECT
    oci.orden_id,
    oci.item,
    oci.descripcion,
    oci.cantidad,
    oci.valor_unitario,
    COUNT(*) as veces_repetido
  FROM ordenes_compra_items oci
  GROUP BY oci.orden_id, oci.item, oci.descripcion, oci.cantidad, oci.valor_unitario
  HAVING COUNT(*) > 1
)
SELECT
  '🔄 TODAS LAS OCs CON DUPLICADOS' as paso,
  oc.numero,
  oc.codigo_protocolo,
  oc.total as total_actual,
  COUNT(DISTINCT d.item) as items_duplicados,
  SUM(d.veces_repetido) as total_repeticiones
FROM duplicados d
INNER JOIN ordenes_compra oc ON oc.id = d.orden_id
GROUP BY oc.id, oc.numero, oc.codigo_protocolo, oc.total
ORDER BY total_repeticiones DESC;

-- PASO 9: Ver si el UPDATE del script anterior se ejecutó
SELECT
  '⚙️ VERIFICAR SI SE EJECUTÓ EL UPDATE' as paso,
  COUNT(*) as total_ocs,
  COUNT(CASE WHEN oc.total = COALESCE((
    SELECT SUM(
      (oci.cantidad * oci.valor_unitario) * (1 - COALESCE(oci.descuento, 0) / 100)
    ) * 1.19
    FROM ordenes_compra_items oci
    WHERE oci.orden_id = oc.id
  ), 0) THEN 1 END) as ocs_con_total_correcto,
  COUNT(CASE WHEN ABS(oc.total - COALESCE((
    SELECT SUM(
      (oci.cantidad * oci.valor_unitario) * (1 - COALESCE(oci.descuento, 0) / 100)
    ) * 1.19
    FROM ordenes_compra_items oci
    WHERE oci.orden_id = oc.id
  ), 0)) > 100 THEN 1 END) as ocs_descuadradas
FROM ordenes_compra oc;
