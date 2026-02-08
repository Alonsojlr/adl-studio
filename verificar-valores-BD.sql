-- =====================================================
-- VERIFICAR: ¿Los valores SE ACTUALIZARON en la BD?
-- =====================================================

-- Ver EXACTAMENTE qué valores tiene la BD ahora
SELECT
  '🔍 VALORES ACTUALES EN BD' as verificacion,
  numero,
  subtotal::numeric(15,2) as subtotal_en_bd,
  iva::numeric(15,2) as iva_en_bd,
  total::numeric(15,2) as total_en_bd,
  (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id) as cant_items
FROM ordenes_compra oc
WHERE numero IN ('17419', '17435', '17438')
ORDER BY numero;

-- Calcular lo que DEBERÍA ser según los items
SELECT
  '🧮 VALORES QUE DEBERÍAN SER' as verificacion,
  oc.numero,
  COALESCE(SUM(oci.cantidad * oci.valor_unitario * (1 - COALESCE(oci.descuento, 0) / 100)), 0)::numeric(15,2) as subtotal_calculado,
  (COALESCE(SUM(oci.cantidad * oci.valor_unitario * (1 - COALESCE(oci.descuento, 0) / 100)), 0) * 0.19)::numeric(15,2) as iva_calculado,
  (COALESCE(SUM(oci.cantidad * oci.valor_unitario * (1 - COALESCE(oci.descuento, 0) / 100)), 0) * 1.19)::numeric(15,2) as total_calculado
FROM ordenes_compra oc
LEFT JOIN ordenes_compra_items oci ON oci.orden_id = oc.id
WHERE oc.numero IN ('17419', '17435', '17438')
GROUP BY oc.numero
ORDER BY oc.numero;

-- Comparar: ¿Coinciden?
SELECT
  '✅ COMPARACIÓN' as verificacion,
  oc.numero,
  oc.total::numeric(15,2) as total_guardado,
  (COALESCE(SUM(oci.cantidad * oci.valor_unitario * (1 - COALESCE(oci.descuento, 0) / 100)), 0) * 1.19)::numeric(15,2) as total_calculado,
  CASE
    WHEN ABS(oc.total - COALESCE(SUM(oci.cantidad * oci.valor_unitario * (1 - COALESCE(oci.descuento, 0) / 100)) * 1.19, 0)) < 1 THEN '✅ COINCIDEN'
    ELSE '❌ NO COINCIDEN - Diferencia: ' || ABS(oc.total - COALESCE(SUM(oci.cantidad * oci.valor_unitario * (1 - COALESCE(oci.descuento, 0) / 100)) * 1.19, 0))::numeric(15,2)::text
  END as estado
FROM ordenes_compra oc
LEFT JOIN ordenes_compra_items oci ON oci.orden_id = oc.id
WHERE oc.numero IN ('17419', '17435', '17438')
GROUP BY oc.numero, oc.total, oc.subtotal, oc.iva
ORDER BY oc.numero;
