-- =====================================================
-- ENCONTRAR TODAS LAS OCs CON ITEMS DUPLICADOS
-- =====================================================

-- PASO 1: OCs con items sospechosos (valor muy bajo como $10)
SELECT
  'OCs CON ITEMS SOSPECHOSOS' as tipo,
  oc.numero,
  oc.codigo_protocolo,
  oc.subtotal as oc_subtotal,
  oc.total as oc_total,
  COUNT(oci.id) as total_items,
  COUNT(CASE WHEN oci.valor_unitario <= 10 THEN 1 END) as items_sospechosos,
  SUM(oci.cantidad * oci.valor_unitario) as suma_items
FROM ordenes_compra oc
INNER JOIN ordenes_compra_items oci ON oci.orden_id = oc.id
GROUP BY oc.id, oc.numero, oc.codigo_protocolo, oc.subtotal, oc.total
HAVING COUNT(CASE WHEN oci.valor_unitario <= 10 THEN 1 END) > 0
ORDER BY items_sospechosos DESC, oc.numero DESC;

-- PASO 2: OCs con items exactamente duplicados
SELECT
  'OCs CON ITEMS DUPLICADOS' as tipo,
  oc.numero,
  oc.codigo_protocolo,
  oci.item,
  oci.descripcion,
  oci.cantidad,
  oci.valor_unitario,
  COUNT(*) as veces_repetido
FROM ordenes_compra oc
INNER JOIN ordenes_compra_items oci ON oci.orden_id = oc.id
GROUP BY oc.id, oc.numero, oc.codigo_protocolo, oci.item, oci.descripcion, oci.cantidad, oci.valor_unitario
HAVING COUNT(*) > 1
ORDER BY veces_repetido DESC, oc.numero DESC;

-- PASO 3: OCs donde el total calculado NO coincide con el total guardado
SELECT
  'OCs CON TOTALES DESCUADRADOS' as tipo,
  oc.numero,
  oc.codigo_protocolo,
  oc.subtotal as subtotal_guardado,
  oc.total as total_guardado,
  COALESCE(SUM(
    (oci.cantidad * oci.valor_unitario) * (1 - oci.descuento / 100)
  ), 0) as subtotal_calculado,
  COALESCE(SUM(
    (oci.cantidad * oci.valor_unitario) * (1 - oci.descuento / 100)
  ), 0) * 1.19 as total_calculado,
  ABS(oc.total - COALESCE(SUM(
    (oci.cantidad * oci.valor_unitario) * (1 - oci.descuento / 100)
  ), 0) * 1.19) as diferencia
FROM ordenes_compra oc
LEFT JOIN ordenes_compra_items oci ON oci.orden_id = oc.id
GROUP BY oc.id, oc.numero, oc.codigo_protocolo, oc.subtotal, oc.total
HAVING ABS(oc.total - COALESCE(SUM(
  (oci.cantidad * oci.valor_unitario) * (1 - oci.descuento / 100)
), 0) * 1.19) > 100
ORDER BY diferencia DESC;

-- PASO 4: Detalle de la OC 17419 específicamente
SELECT
  'DETALLE OC 17419' as tipo,
  oci.id,
  oci.item,
  oci.descripcion,
  oci.cantidad,
  oci.valor_unitario,
  oci.descuento,
  (oci.cantidad * oci.valor_unitario) as subtotal,
  (oci.cantidad * oci.valor_unitario * (1 - oci.descuento / 100)) as subtotal_con_desc
FROM ordenes_compra oc
INNER JOIN ordenes_compra_items oci ON oci.orden_id = oc.id
WHERE oc.numero = '17419'
ORDER BY oci.valor_unitario DESC;

-- PASO 5: Resumen por protocolo
SELECT
  'RESUMEN POR PROTOCOLO' as tipo,
  oc.codigo_protocolo,
  COUNT(DISTINCT oc.id) as total_ocs,
  SUM(oc.total) as suma_total_ocs,
  SUM(
    (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id)
  ) as total_items
FROM ordenes_compra oc
WHERE oc.codigo_protocolo = '30666'
GROUP BY oc.codigo_protocolo;
