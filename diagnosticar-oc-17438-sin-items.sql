-- =====================================================
-- DIAGNÓSTICO: OC 17438 sin items
-- =====================================================

-- PASO 1: Verificar que la OC existe
SELECT
  '🔍 OC 17438 - INFO' as paso,
  id,
  numero,
  codigo_protocolo,
  fecha,
  proveedor_id,
  subtotal,
  iva,
  total,
  estado
FROM ordenes_compra
WHERE numero = '17438';

-- PASO 2: Buscar items (debería estar vacío)
SELECT
  '📋 ITEMS EN ordenes_compra_items' as paso,
  COUNT(*) as cantidad_items
FROM ordenes_compra_items
WHERE orden_id = (SELECT id FROM ordenes_compra WHERE numero = '17438');

-- PASO 3: Ver el protocolo asociado
SELECT
  '📄 PROTOCOLO ASOCIADO' as paso,
  folio,
  numero_cotizacion,
  monto_neto,
  monto_total,
  cliente_id
FROM protocolos
WHERE folio = (SELECT codigo_protocolo FROM ordenes_compra WHERE numero = '17438');

-- PASO 4: Ver la cotización asociada al protocolo
SELECT
  '💰 COTIZACIÓN DEL PROTOCOLO' as paso,
  c.numero,
  c.neto,
  c.monto,
  c.estado,
  c.items
FROM cotizaciones c
WHERE c.numero = (
  SELECT numero_cotizacion
  FROM protocolos
  WHERE folio = (SELECT codigo_protocolo FROM ordenes_compra WHERE numero = '17438')
);

-- PASO 5: Ver items de la cotización (si tiene en JSONB)
SELECT
  '📦 ITEMS DE LA COTIZACIÓN (JSONB)' as paso,
  jsonb_array_elements(items) as item
FROM cotizaciones
WHERE numero = (
  SELECT numero_cotizacion
  FROM protocolos
  WHERE folio = (SELECT codigo_protocolo FROM ordenes_compra WHERE numero = '17438')
);
