-- =====================================================
-- FIX: Actualizar OCs cambiando estado temporalmente
-- =====================================================
-- Este script cambia el estado temporalmente para permitir UPDATEs

-- PASO 1: Guardar estados originales para restaurar después
CREATE TEMP TABLE estados_originales AS
SELECT numero, estado, estado_pago
FROM ordenes_compra
WHERE numero IN ('17419', '17435', '17438');

-- PASO 2: Cambiar estado a 'Emitida' temporalmente
UPDATE ordenes_compra
SET estado = 'Emitida'
WHERE numero IN ('17419', '17435', '17438');

-- PASO 3: Eliminar duplicados de items
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

-- PASO 4: Actualizar totales de las 3 OCs
UPDATE ordenes_compra oc
SET
  subtotal = (
    SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0)
    FROM ordenes_compra_items
    WHERE orden_id = oc.id
  ),
  iva = (
    SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0) * 0.19
    FROM ordenes_compra_items
    WHERE orden_id = oc.id
  ),
  total = (
    SELECT COALESCE(SUM(cantidad * valor_unitario * (1 - COALESCE(descuento, 0) / 100)), 0) * 1.19
    FROM ordenes_compra_items
    WHERE orden_id = oc.id
  )
WHERE numero IN ('17419', '17435', '17438');

-- PASO 5: Restaurar estados originales
UPDATE ordenes_compra oc
SET
  estado = eo.estado,
  estado_pago = eo.estado_pago
FROM estados_originales eo
WHERE oc.numero = eo.numero;

-- PASO 6: Verificar resultado
SELECT
  '✅ RESULTADO FINAL' as paso,
  numero,
  estado,
  subtotal,
  iva,
  total,
  (SELECT COUNT(*) FROM ordenes_compra_items WHERE orden_id = oc.id) as items
FROM ordenes_compra oc
WHERE numero IN ('17419', '17435', '17438')
ORDER BY numero;

-- PASO 7: Limpiar tabla temporal
DROP TABLE estados_originales;
