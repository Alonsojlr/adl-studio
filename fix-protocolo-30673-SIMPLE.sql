-- =====================================================
-- CORRECCIÓN DIRECTA Y SIMPLE
-- Protocolo 30673 debe tener neto = 129.000
-- =====================================================

-- VER ANTES
SELECT
  folio,
  numero_cotizacion,
  monto_neto as neto_actual,
  monto_total as total_actual
FROM protocolos
WHERE folio = '30673';

-- CORREGIR DIRECTAMENTE
UPDATE protocolos
SET monto_neto = 129000
WHERE folio = '30673';

-- VER DESPUÉS
SELECT
  folio,
  numero_cotizacion,
  monto_neto as neto_corregido,
  monto_total as total_actual,
  CASE
    WHEN monto_neto = 129000 THEN '✅ CORRECTO'
    ELSE '❌ ERROR'
  END as estado
FROM protocolos
WHERE folio = '30673';

-- VERIFICAR TAMBIÉN QUE LA COTIZACIÓN TENGA NETO CORRECTO
SELECT
  numero,
  neto,
  monto,
  adjudicada_a_protocolo
FROM cotizaciones
WHERE numero = '5569';

-- SI LA COTIZACIÓN NO TIENE NETO, CORREGIRLO TAMBIÉN
UPDATE cotizaciones
SET neto = 129000
WHERE numero = '5569'
  AND (neto IS NULL OR neto != 129000);

-- RESULTADO FINAL
SELECT
  'Cotización' as tipo,
  numero as codigo,
  neto as valor_neto
FROM cotizaciones
WHERE numero = '5569'
UNION ALL
SELECT
  'Protocolo' as tipo,
  folio as codigo,
  monto_neto as valor_neto
FROM protocolos
WHERE folio = '30673';
