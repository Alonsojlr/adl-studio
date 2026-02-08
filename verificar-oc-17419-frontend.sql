-- =====================================================
-- VERIFICAR POR QUÉ EL FRONTEND MUESTRA 619.720
-- =====================================================

-- PASO 1: Ver los valores ACTUALES en la tabla ordenes_compra
SELECT
  'VALORES EN TABLA ordenes_compra' as paso,
  numero,
  subtotal,
  iva,
  total,
  CASE
    WHEN total BETWEEN 288000 AND 290000 THEN '✅ CORRECTO'
    WHEN total = 619720 OR total = 619840 THEN '❌ TODAVÍA TIENE VALOR VIEJO'
    ELSE '⚠️ OTRO VALOR'
  END as estado
FROM ordenes_compra
WHERE numero = '17419';

-- PASO 2: Ver los items que tiene
SELECT
  'ITEMS EN ordenes_compra_items' as paso,
  COUNT(*) as cantidad_items,
  SUM(cantidad * valor_unitario) as suma_bruta,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as suma_neta,
  SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) * 1.19 as total_con_iva
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17419');

-- PASO 3: Ver detalle de cada item
SELECT
  'DETALLE DE ITEMS' as paso,
  id,
  item,
  descripcion,
  cantidad,
  valor_unitario,
  descuento,
  (cantidad * valor_unitario) as subtotal_bruto,
  (cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as subtotal_neto
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17419')
ORDER BY valor_unitario DESC;

-- PASO 4: FORZAR RECALCULO (si el UPDATE anterior no se ejecutó)
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

-- PASO 5: VERIFICAR RESULTADO DESPUÉS DEL UPDATE
SELECT
  'RESULTADO DESPUÉS DEL UPDATE' as paso,
  numero,
  subtotal as neto,
  iva,
  total,
  CASE
    WHEN subtotal BETWEEN 242000 AND 243000 THEN '✅ NETO CORRECTO'
    ELSE '❌ NETO INCORRECTO: ' || subtotal
  END as estado_neto,
  CASE
    WHEN total BETWEEN 288000 AND 290000 THEN '✅ TOTAL CORRECTO'
    ELSE '❌ TOTAL INCORRECTO: ' || total
  END as estado_total
FROM ordenes_compra
WHERE numero = '17419';

-- =====================================================
-- RESUMEN
-- =====================================================
-- Si después de ejecutar este script el total sigue siendo 619.720:
-- 1. Verifica que los items duplicados se hayan eliminado
-- 2. Ejecuta el PASO 4 para forzar el recálculo
-- 3. Refresca la página del frontend (Ctrl+Shift+R o Cmd+Shift+R)
-- 4. Si es necesario, reinicia el servidor npm run dev
