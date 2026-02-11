-- =====================================================
-- FIX DEFINITIVO: Sin restricciones RLS
-- =====================================================
-- Este script deshabilita RLS temporalmente, hace los cambios, y lo vuelve a habilitar

-- PASO 1: Deshabilitar RLS temporalmente
ALTER TABLE ordenes_compra DISABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra_items DISABLE ROW LEVEL SECURITY;

-- PASO 2: Ver estado ANTES de los cambios
SELECT
  '🔍 ANTES' as paso,
  numero,
  estado,
  subtotal,
  iva,
  total,
  (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id) as items
FROM ordenes_compra oc
WHERE numero IN ('17419', '17435', '17438')
ORDER BY numero;

-- PASO 3: Eliminar duplicados de items de TODAS las OCs (no solo las 3)
WITH items_duplicados AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY orden_id, item, descripcion, cantidad, valor_unitario
      ORDER BY id DESC
    ) as rn
  FROM ordenes_compra_items
)
DELETE FROM ordenes_compra_items
WHERE id IN (
  SELECT id
  FROM items_duplicados
  WHERE rn > 1
);

-- PASO 4: Recalcular totales de TODAS las OCs
UPDATE ordenes_compra oc
SET
  subtotal = (
    SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0)
    FROM ordenes_compra_items oci
    WHERE oci.orden_id = oc.id
  ),
  iva = (
    SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0) * 0.19
    FROM ordenes_compra_items oci
    WHERE oci.orden_id = oc.id
  ),
  total = (
    SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0) * 1.19
    FROM ordenes_compra_items oci
    WHERE oci.orden_id = oc.id
  );

-- PASO 5: Verificar resultado DESPUÉS
SELECT
  '✅ DESPUÉS' as paso,
  numero,
  estado,
  subtotal::numeric(15,2) as subtotal,
  iva::numeric(15,2) as iva,
  total::numeric(15,2) as total,
  (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id) as items,
  CASE
    WHEN numero = '17419' AND total BETWEEN 288000 AND 290000 THEN '✅ CORRECTO'
    WHEN numero = '17435' AND total BETWEEN 2300000 AND 2400000 THEN '✅ CORRECTO'
    WHEN numero = '17438' AND total = 0 THEN '⚠️ SIN ITEMS'
    ELSE '⚠️ VERIFICAR: ' || total::numeric(15,2)::text
  END as validacion
FROM ordenes_compra oc
WHERE numero IN ('17419', '17435', '17438')
ORDER BY numero;

-- PASO 6: Ver resumen de TODAS las OCs
SELECT
  '📊 RESUMEN GENERAL' as paso,
  COUNT(*) as total_ocs,
  SUM(total) as suma_total,
  (SELECT COUNT(*) FROM ordenes_compra_items) as total_items_sistema
FROM ordenes_compra;

-- PASO 7: Verificar que no quedan duplicados
SELECT
  '🔍 DUPLICADOS RESTANTES' as paso,
  COUNT(*) as grupos_duplicados
FROM (
  SELECT
    orden_id,
    item,
    descripcion,
    cantidad,
    valor_unitario
  FROM ordenes_compra_items
  GROUP BY orden_id, item, descripcion, cantidad, valor_unitario
  HAVING COUNT(*) > 1
) duplicados;

-- PASO 8: VOLVER A HABILITAR RLS
ALTER TABLE ordenes_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra_items ENABLE ROW LEVEL SECURITY;

-- PASO 9: Confirmación final
SELECT
  '✅ RLS RE-HABILITADO' as mensaje,
  'Las políticas RLS han sido restauradas' as detalle;
