-- =====================================================
-- FIX DEFINITIVO: OC 17419
-- Este script fuerza la actualización de los totales
-- =====================================================

-- PASO 1: Verificar estado actual
SELECT
  '🔍 ANTES DEL FIX' as paso,
  numero,
  subtotal as neto_actual,
  iva as iva_actual,
  total as total_actual,
  (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id) as cant_items
FROM ordenes_compra oc
WHERE numero = '17419';

-- PASO 2: Ver items actuales
SELECT
  '📋 ITEMS ACTUALES' as paso,
  id,
  item,
  cantidad,
  valor_unitario,
  descuento,
  (cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)) as subtotal_neto
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17419');

-- PASO 3: FORZAR RECÁLCULO de totales
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

-- PASO 4: Verificar resultado
SELECT
  '✅ DESPUÉS DEL FIX' as paso,
  numero,
  subtotal as neto_nuevo,
  iva as iva_nuevo,
  total as total_nuevo,
  (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id) as cant_items,
  CASE
    WHEN subtotal BETWEEN 242000 AND 243000 THEN '✅ NETO CORRECTO (~242,352)'
    ELSE '❌ NETO INCORRECTO: ' || subtotal::text
  END as validacion_neto,
  CASE
    WHEN total BETWEEN 288000 AND 290000 THEN '✅ TOTAL CORRECTO (~288,399)'
    WHEN total > 600000 THEN '❌ TODAVÍA TIENE VALOR VIEJO (619,720)'
    ELSE '⚠️ TOTAL INESPERADO: ' || total::text
  END as validacion_total
FROM ordenes_compra oc
WHERE numero = '17419';

-- =====================================================
-- INSTRUCCIONES POST-SCRIPT
-- =====================================================
-- Después de ejecutar este script:
-- 1. ✅ Verifica que el "validacion_total" diga "TOTAL CORRECTO"
-- 2. 🔄 Ve al frontend y presiona Ctrl+Shift+R (o Cmd+Shift+R en Mac) para refrescar
-- 3. ✅ El total debería mostrar ~$288,399 en vez de $619,720
-- 4. Si aún no funciona, reinicia el servidor: npm run dev
