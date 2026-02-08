-- =====================================================
-- DIAGNÓSTICO DETALLADO: PROTOCOLO 30673 Y COTIZACIÓN 5569
-- =====================================================

-- PASO 1: Ver los datos RAW de la cotización 5569
SELECT
  'COTIZACIÓN 5569' as tipo,
  id,
  numero,
  neto,
  monto,
  items,
  adjudicada_a_protocolo,
  estado,
  created_at
FROM cotizaciones
WHERE numero = '5569';

-- PASO 2: Ver los datos RAW del protocolo 30673
SELECT
  'PROTOCOLO 30673' as tipo,
  id,
  folio,
  numero_cotizacion,
  monto_neto,
  monto_total,
  items,
  created_at
FROM protocolos
WHERE folio = '30673';

-- PASO 3: Verificar si existe la vinculación
SELECT
  'VERIFICACIÓN VINCULACIÓN' as paso,
  c.numero as cot_numero,
  c.adjudicada_a_protocolo as cot_adjudicada_a,
  p.folio as prot_folio,
  p.numero_cotizacion as prot_num_cot,
  CASE
    WHEN c.adjudicada_a_protocolo::text = p.folio::text THEN '✅ Vinculados por folio'
    WHEN REGEXP_REPLACE(c.numero, '[^0-9]', '', 'g') = REGEXP_REPLACE(p.numero_cotizacion, '[^0-9]', '', 'g') THEN '✅ Vinculados por número'
    ELSE '❌ NO VINCULADOS'
  END as vinculacion
FROM cotizaciones c
CROSS JOIN protocolos p
WHERE c.numero = '5569' AND p.folio = '30673';

-- PASO 4: Ver si el UPDATE funcionaría con condiciones
SELECT
  'TEST UPDATE' as paso,
  p.folio,
  p.monto_neto as actual,
  c.neto as deberia_ser,
  CASE
    WHEN c.adjudicada_a_protocolo IS NOT NULL THEN 'Tiene adjudicada_a_protocolo: ' || c.adjudicada_a_protocolo
    ELSE 'NO tiene adjudicada_a_protocolo'
  END as estado_adjudicacion,
  CASE
    WHEN c.adjudicada_a_protocolo::text = p.folio::text THEN '✅ Coincide con folio'
    ELSE '❌ NO coincide'
  END as match_folio,
  CASE
    WHEN REGEXP_REPLACE(p.numero_cotizacion, '[^0-9]', '', 'g') = REGEXP_REPLACE(c.numero, '[^0-9]', '', 'g') THEN '✅ Coincide con número'
    ELSE '❌ NO coincide'
  END as match_numero
FROM protocolos p
CROSS JOIN cotizaciones c
WHERE p.folio = '30673' AND c.numero = '5569';

-- PASO 5: Ver TODAS las cotizaciones que apuntan al protocolo 30673
SELECT
  'COTIZACIONES QUE APUNTAN A 30673' as tipo,
  numero,
  neto,
  monto,
  adjudicada_a_protocolo,
  estado
FROM cotizaciones
WHERE adjudicada_a_protocolo = '30673';

-- PASO 6: Ver si la cotización 5569 tiene neto NULL o incorrecto
SELECT
  'VERIFICAR NETO DE COTIZACIÓN' as paso,
  numero,
  neto,
  monto,
  CASE
    WHEN neto IS NULL THEN '❌ NETO ES NULL'
    WHEN neto = 0 THEN '❌ NETO ES 0'
    WHEN neto > 0 THEN '✅ NETO TIENE VALOR: ' || neto
    ELSE '❌ NETO INVÁLIDO'
  END as estado_neto,
  -- Calcular neto desde items si existen
  CASE
    WHEN items IS NOT NULL AND jsonb_array_length(items) > 0 THEN
      (SELECT SUM(
        (COALESCE((item->>'cantidad')::numeric, 0) *
         COALESCE((item->>'valorUnitario')::numeric, 0)) *
        (1 - COALESCE((item->>'descuento')::numeric, 0) / 100)
      )
      FROM jsonb_array_elements(items) item)
    ELSE NULL
  END as neto_calculado_desde_items
FROM cotizaciones
WHERE numero = '5569';

-- =====================================================
-- CORRECCIÓN FORZADA (Ejecutar si el UPDATE no funcionó)
-- =====================================================

-- Opción 1: Update directo sin JOIN (más simple)
UPDATE protocolos
SET monto_neto = 129000
WHERE folio = '30673';

-- Verificar que se actualizó
SELECT
  'DESPUÉS DEL UPDATE' as paso,
  folio,
  numero_cotizacion,
  monto_neto,
  monto_total
FROM protocolos
WHERE folio = '30673';

-- =====================================================
-- SOLUCIÓN ALTERNATIVA: Si la cotización no tiene neto
-- =====================================================

-- Primero asegurar que la cotización 5569 tenga neto
UPDATE cotizaciones
SET neto = 129000
WHERE numero = '5569'
  AND (neto IS NULL OR neto = 0 OR neto != 129000);

-- Verificar
SELECT numero, neto, monto FROM cotizaciones WHERE numero = '5569';

-- Ahora actualizar el protocolo desde la cotización
UPDATE protocolos p
SET monto_neto = c.neto
FROM cotizaciones c
WHERE c.numero = '5569'
  AND p.folio = '30673';

-- Verificar resultado final
SELECT
  'RESULTADO FINAL' as paso,
  c.numero as cotizacion,
  c.neto as cot_neto,
  p.folio as protocolo,
  p.monto_neto as prot_neto,
  CASE
    WHEN c.neto = p.monto_neto THEN '✅ CORRECTO'
    ELSE '❌ AÚN INCORRECTO'
  END as estado
FROM cotizaciones c
CROSS JOIN protocolos p
WHERE c.numero = '5569' AND p.folio = '30673';
