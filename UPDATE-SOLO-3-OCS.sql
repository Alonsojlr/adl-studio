-- =====================================================
-- SOLO UPDATES - Sin diagnósticos
-- Ejecutar ESTE BLOQUE COMPLETO
-- =====================================================

-- 1. Eliminar duplicados de las 3 OCs
WITH items_duplicados AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY orden_id, item, descripcion, cantidad, valor_unitario
      ORDER BY id DESC
    ) as rn
  FROM ordenes_compra_items
  WHERE orden_id IN (
    SELECT id FROM ordenes_compra WHERE numero IN ('17419', '17435', '17438')
  )
)
DELETE FROM ordenes_compra_items
WHERE id IN (
  SELECT id
  FROM items_duplicados
  WHERE rn > 1
);

-- 2. UPDATE OC 17419
UPDATE ordenes_compra
SET
  subtotal = (SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0) FROM ordenes_compra_items WHERE orden_id = ordenes_compra.id),
  iva = (SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0) * 0.19 FROM ordenes_compra_items WHERE orden_id = ordenes_compra.id),
  total = (SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0) * 1.19 FROM ordenes_compra_items WHERE orden_id = ordenes_compra.id)
WHERE numero = '17419';

-- 3. UPDATE OC 17435
UPDATE ordenes_compra
SET
  subtotal = (SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0) FROM ordenes_compra_items WHERE orden_id = ordenes_compra.id),
  iva = (SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0) * 0.19 FROM ordenes_compra_items WHERE orden_id = ordenes_compra.id),
  total = (SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0) * 1.19 FROM ordenes_compra_items WHERE orden_id = ordenes_compra.id)
WHERE numero = '17435';

-- 4. UPDATE OC 17438
UPDATE ordenes_compra
SET
  subtotal = (SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0) FROM ordenes_compra_items WHERE orden_id = ordenes_compra.id),
  iva = (SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0) * 0.19 FROM ordenes_compra_items WHERE orden_id = ordenes_compra.id),
  total = (SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0) * 1.19 FROM ordenes_compra_items WHERE orden_id = ordenes_compra.id)
WHERE numero = '17438';

-- 5. Verificar (esto sí mostrará resultado)
SELECT
  numero,
  subtotal,
  iva,
  total
FROM ordenes_compra
WHERE numero IN ('17419', '17435', '17438')
ORDER BY numero;
