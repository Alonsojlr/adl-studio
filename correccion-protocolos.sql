-- =====================================================
-- CORRECCIÓN URGENTE - PROTOCOLOS CON NETO INCORRECTO
-- =====================================================
-- Este script corrige protocolos que tienen un monto_neto diferente
-- al neto de su cotización asociada
-- =====================================================

-- PASO 1: IDENTIFICAR CASOS PROBLEMÁTICOS
-- =====================================================

-- Ver protocolos con diferencias significativas
SELECT
  p.folio as protocolo_folio,
  p.numero_cotizacion,
  c.numero as cotizacion_numero,
  c.neto as cotizacion_neto,
  p.monto_neto as protocolo_neto_actual,
  p.monto_total as protocolo_total,
  ABS(COALESCE(c.neto, 0) - COALESCE(p.monto_neto, 0)) as diferencia,
  CASE
    WHEN ABS(COALESCE(c.neto, 0) - COALESCE(p.monto_neto, 0)) > 10000 THEN '⚠️ REVISAR URGENTE'
    WHEN ABS(COALESCE(c.neto, 0) - COALESCE(p.monto_neto, 0)) > 1000 THEN '⚠️ REVISAR'
    ELSE '✅ OK'
  END as estado
FROM protocolos p
LEFT JOIN cotizaciones c ON (
  (c.adjudicada_a_protocolo IS NOT NULL AND c.adjudicada_a_protocolo::text = p.folio::text)
  OR (p.numero_cotizacion IS NOT NULL AND REGEXP_REPLACE(c.numero, '[^0-9]', '', 'g') = REGEXP_REPLACE(p.numero_cotizacion, '[^0-9]', '', 'g'))
)
WHERE c.neto IS NOT NULL
  AND p.monto_neto IS NOT NULL
  AND ABS(c.neto - p.monto_neto) > 1000
ORDER BY diferencia DESC;


-- =====================================================
-- PASO 2: CORREGIR CASOS ESPECÍFICOS
-- =====================================================

-- Caso específico: Protocolo 30673 y Cotización 5569
UPDATE protocolos
SET monto_neto = (
  SELECT neto
  FROM cotizaciones
  WHERE numero = '5569'
  LIMIT 1
)
WHERE folio = '30673';


-- =====================================================
-- PASO 3: CORRECCIÓN MASIVA DE TODOS LOS CASOS
-- =====================================================

-- Corregir todos los protocolos vinculados por folio (adjudicada_a_protocolo)
UPDATE protocolos p
SET monto_neto = c.neto
FROM cotizaciones c
WHERE c.adjudicada_a_protocolo IS NOT NULL
  AND c.adjudicada_a_protocolo::text = p.folio::text
  AND c.neto IS NOT NULL
  AND (p.monto_neto IS NULL OR ABS(c.neto - p.monto_neto) > 100);

-- Corregir protocolos vinculados por número de cotización
UPDATE protocolos p
SET monto_neto = c.neto
FROM cotizaciones c
WHERE p.numero_cotizacion IS NOT NULL
  AND REGEXP_REPLACE(p.numero_cotizacion, '[^0-9]', '', 'g') = REGEXP_REPLACE(c.numero, '[^0-9]', '', 'g')
  AND c.neto IS NOT NULL
  AND (p.monto_neto IS NULL OR ABS(c.neto - p.monto_neto) > 100)
  AND NOT EXISTS (
    -- Evitar duplicados: no actualizar si ya se actualizó por folio
    SELECT 1 FROM cotizaciones c2
    WHERE c2.adjudicada_a_protocolo IS NOT NULL
      AND c2.adjudicada_a_protocolo::text = p.folio::text
  );


-- =====================================================
-- PASO 4: VERIFICACIÓN FINAL
-- =====================================================

-- Contar protocolos corregidos
SELECT
  COUNT(*) as total_protocolos_con_cotizacion,
  COUNT(CASE WHEN ABS(COALESCE(c.neto, 0) - COALESCE(p.monto_neto, 0)) < 100 THEN 1 END) as correctos,
  COUNT(CASE WHEN ABS(COALESCE(c.neto, 0) - COALESCE(p.monto_neto, 0)) >= 100 THEN 1 END) as con_diferencias
FROM protocolos p
LEFT JOIN cotizaciones c ON (
  (c.adjudicada_a_protocolo IS NOT NULL AND c.adjudicada_a_protocolo::text = p.folio::text)
  OR (p.numero_cotizacion IS NOT NULL AND REGEXP_REPLACE(c.numero, '[^0-9]', '', 'g') = REGEXP_REPLACE(p.numero_cotizacion, '[^0-9]', '', 'g'))
)
WHERE c.neto IS NOT NULL AND p.monto_neto IS NOT NULL;

-- Ver casos que aún tienen problemas (si quedan)
SELECT
  p.folio,
  p.numero_cotizacion,
  c.numero as cot_num,
  c.neto as cot_neto,
  p.monto_neto as prot_neto,
  ABS(c.neto - p.monto_neto) as diferencia
FROM protocolos p
LEFT JOIN cotizaciones c ON (
  (c.adjudicada_a_protocolo IS NOT NULL AND c.adjudicada_a_protocolo::text = p.folio::text)
  OR (p.numero_cotizacion IS NOT NULL AND REGEXP_REPLACE(c.numero, '[^0-9]', '', 'g') = REGEXP_REPLACE(p.numero_cotizacion, '[^0-9]', '', 'g'))
)
WHERE c.neto IS NOT NULL
  AND p.monto_neto IS NOT NULL
  AND ABS(c.neto - p.monto_neto) > 100
ORDER BY diferencia DESC
LIMIT 20;

-- =====================================================
-- RESUMEN
-- =====================================================

SELECT
  '✅ Corrección completada' as status,
  COUNT(*) as protocolos_revisados
FROM protocolos
WHERE monto_neto IS NOT NULL;
