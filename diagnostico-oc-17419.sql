-- =====================================================
-- DIAGNÓSTICO: ORDEN DE COMPRA 17419
-- =====================================================

-- PASO 1: Ver la OC completa
SELECT
  'OC 17419 - INFO PRINCIPAL' as paso,
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
WHERE numero = '17419';

-- PASO 2: Ver TODOS los items de esta OC
SELECT
  'OC 17419 - ITEMS' as paso,
  id,
  orden_id,
  item,
  descripcion,
  cantidad,
  valor_unitario,
  descuento,
  (cantidad * valor_unitario) as subtotal_item,
  (cantidad * valor_unitario * (1 - descuento / 100)) as subtotal_con_descuento
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17419')
ORDER BY id;

-- PASO 3: Ver items duplicados (3 items por $10)
SELECT
  'ITEMS DUPLICADOS/INCORRECTOS' as paso,
  id,
  item,
  descripcion,
  cantidad,
  valor_unitario,
  (cantidad * valor_unitario) as total_item
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17419')
  AND valor_unitario <= 10
ORDER BY id;

-- PASO 4: Ver el item correcto ($242.352)
SELECT
  'ITEM CORRECTO' as paso,
  id,
  item,
  descripcion,
  cantidad,
  valor_unitario,
  (cantidad * valor_unitario) as total_item
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17419')
  AND valor_unitario > 1000
ORDER BY id;

-- PASO 5: Calcular el total CORRECTO (solo item válido)
SELECT
  'CÁLCULO CORRECTO' as paso,
  SUM(cantidad * valor_unitario * (1 - descuento / 100)) as subtotal_correcto,
  SUM(cantidad * valor_unitario * (1 - descuento / 100)) * 0.19 as iva_correcto,
  SUM(cantidad * valor_unitario * (1 - descuento / 100)) * 1.19 as total_correcto
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17419')
  AND valor_unitario > 1000;

-- PASO 6: Calcular el total ACTUAL (con items duplicados)
SELECT
  'CÁLCULO ACTUAL (con duplicados)' as paso,
  SUM(cantidad * valor_unitario * (1 - descuento / 100)) as subtotal_actual,
  SUM(cantidad * valor_unitario * (1 - descuento / 100)) * 0.19 as iva_actual,
  SUM(cantidad * valor_unitario * (1 - descuento / 100)) * 1.19 as total_actual
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17419');

-- PASO 7: Ver el protocolo asociado
SELECT
  'PROTOCOLO 30666' as paso,
  folio,
  numero_cotizacion,
  monto_neto,
  monto_total,
  cliente_id
FROM protocolos
WHERE folio = '30666';

-- PASO 8: Ver si hay duplicados exactos
SELECT
  'BUSCAR DUPLICADOS EXACTOS' as paso,
  item,
  descripcion,
  cantidad,
  valor_unitario,
  COUNT(*) as veces_repetido
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17419')
GROUP BY item, descripcion, cantidad, valor_unitario
HAVING COUNT(*) > 1;
