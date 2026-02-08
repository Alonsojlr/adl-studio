-- =====================================================
-- VERIFICAR Y CORREGIR NETOS EN COTIZACIONES
-- =====================================================

-- PASO 1: Ver cotizaciones que NO tienen neto o está en 0
SELECT
  numero,
  neto,
  monto,
  estado,
  CASE
    WHEN neto IS NULL THEN '❌ NETO NULL'
    WHEN neto = 0 THEN '❌ NETO EN 0'
    WHEN neto > 0 THEN '✅ TIENE NETO'
    ELSE '❌ NETO INVÁLIDO'
  END as estado_neto,
  -- Calcular neto desde items
  CASE
    WHEN items IS NOT NULL AND jsonb_array_length(items) > 0 THEN
      (SELECT SUM(
        (COALESCE((item->>'cantidad')::numeric, 0) *
         COALESCE((item->>'valorUnitario')::numeric, 0)) *
        (1 - COALESCE((item->>'descuento')::numeric, 0) / 100)
      )
      FROM jsonb_array_elements(items) item)
    ELSE monto / 1.19
  END as neto_calculado
FROM cotizaciones
WHERE neto IS NULL OR neto = 0
ORDER BY numero DESC
LIMIT 50;

-- PASO 2: CORREGIR cotizaciones que tienen items pero neto NULL o 0
UPDATE cotizaciones c
SET neto = (
  SELECT COALESCE(SUM(
    (COALESCE((item->>'cantidad')::numeric, 0) *
     COALESCE((item->>'valorUnitario')::numeric, 0)) *
    (1 - COALESCE((item->>'descuento')::numeric, 0) / 100)
  ), 0)
  FROM jsonb_array_elements(c.items) item
)
WHERE (neto IS NULL OR neto = 0)
  AND items IS NOT NULL
  AND jsonb_array_length(items) > 0;

-- PASO 3: CORREGIR cotizaciones que NO tienen items, usar monto / 1.19
UPDATE cotizaciones
SET neto = ROUND(monto / 1.19, 2)
WHERE (neto IS NULL OR neto = 0)
  AND monto > 0
  AND (items IS NULL OR jsonb_array_length(items) = 0);

-- PASO 4: Ver resultado
SELECT
  COUNT(*) as total_cotizaciones,
  COUNT(CASE WHEN neto IS NULL THEN 1 END) as sin_neto,
  COUNT(CASE WHEN neto = 0 THEN 1 END) as neto_en_0,
  COUNT(CASE WHEN neto > 0 THEN 1 END) as con_neto
FROM cotizaciones;

-- PASO 5: Verificar cotización específica 5569
SELECT
  numero,
  neto,
  monto,
  estado,
  adjudicada_a_protocolo,
  CASE
    WHEN neto = 129000 THEN '✅ CORRECTO'
    WHEN neto IS NULL THEN '❌ NULL'
    WHEN neto = 0 THEN '❌ EN 0'
    ELSE '⚠️ OTRO VALOR: ' || neto
  END as estado_neto
FROM cotizaciones
WHERE numero = '5569';
