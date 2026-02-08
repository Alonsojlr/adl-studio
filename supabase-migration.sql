-- =====================================================
-- MIGRACIÓN SUPABASE - KURION/BUILDING ME
-- Correcciones de estructura para manejo correcto de NETO vs TOTAL
-- Fecha: 2026-02-02
-- =====================================================

-- =====================================================
-- 1. TABLA COTIZACIONES
-- =====================================================

-- Agregar columna neto (valor sin IVA)
ALTER TABLE cotizaciones
ADD COLUMN IF NOT EXISTS neto DECIMAL(12,2);

-- Migrar datos existentes: monto actual contiene TOTAL (con IVA)
-- Calculamos neto = total / 1.19
UPDATE cotizaciones
SET neto = ROUND(monto / 1.19, 2)
WHERE neto IS NULL AND monto IS NOT NULL;

-- Para cotizaciones con items, recalcular neto desde items
UPDATE cotizaciones c
SET neto = (
  SELECT SUM(
    (COALESCE((item->>'cantidad')::numeric, 0) *
     COALESCE((item->>'valorUnitario')::numeric, 0)) *
    (1 - COALESCE((item->>'descuento')::numeric, 0) / 100)
  )
  FROM jsonb_array_elements(c.items) item
)
WHERE items IS NOT NULL
  AND jsonb_array_length(items) > 0;

-- Agregar índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_cotizaciones_neto ON cotizaciones(neto);

-- =====================================================
-- 2. TABLA PROTOCOLOS
-- =====================================================

-- Agregar columna monto_neto explícita
ALTER TABLE protocolos
ADD COLUMN IF NOT EXISTS monto_neto DECIMAL(12,2);

-- Actualizar protocolos con neto de cotización vinculada (por folio)
UPDATE protocolos p
SET monto_neto = c.neto
FROM cotizaciones c
WHERE c.adjudicada_a_protocolo IS NOT NULL
  AND p.folio::text = c.adjudicada_a_protocolo::text
  AND p.monto_neto IS NULL;

-- Actualizar protocolos con neto de cotización vinculada (por número)
UPDATE protocolos p
SET monto_neto = c.neto
FROM cotizaciones c
WHERE p.numero_cotizacion IS NOT NULL
  AND REGEXP_REPLACE(p.numero_cotizacion, '[^0-9]', '', 'g') = REGEXP_REPLACE(c.numero, '[^0-9]', '', 'g')
  AND p.monto_neto IS NULL;

-- Para protocolos sin cotización vinculada, calcular desde items si existen
UPDATE protocolos p
SET monto_neto = (
  SELECT SUM(
    (COALESCE((item->>'cantidad')::numeric, 0) *
     COALESCE((item->>'valorUnitario')::numeric, (item->>'valor_unitario')::numeric, 0)) *
    (1 - COALESCE((item->>'descuento')::numeric, 0) / 100)
  )
  FROM jsonb_array_elements(p.items) item
)
WHERE p.monto_neto IS NULL
  AND p.items IS NOT NULL
  AND jsonb_array_length(p.items) > 0;

-- Para protocolos restantes, usar monto_total / 1.19 como estimación
UPDATE protocolos
SET monto_neto = ROUND(monto_total / 1.19, 2)
WHERE monto_neto IS NULL
  AND monto_total IS NOT NULL;

-- CORRECCIÓN ADICIONAL: Re-vincular protocolos que ya tienen monto_neto pero está incorrecto
-- Esto corrige casos donde el protocolo tiene un monto diferente al de su cotización
UPDATE protocolos p
SET monto_neto = c.neto
FROM cotizaciones c
WHERE (
  c.adjudicada_a_protocolo IS NOT NULL AND c.adjudicada_a_protocolo::text = p.folio::text
)
AND c.neto IS NOT NULL
AND p.monto_neto IS NOT NULL
AND ABS(c.neto - p.monto_neto) > 1000;  -- Solo corregir si la diferencia es significativa (más de $1.000)

-- También corregir vinculación por número de cotización
UPDATE protocolos p
SET monto_neto = c.neto
FROM cotizaciones c
WHERE p.numero_cotizacion IS NOT NULL
  AND REGEXP_REPLACE(p.numero_cotizacion, '[^0-9]', '', 'g') = REGEXP_REPLACE(c.numero, '[^0-9]', '', 'g')
  AND c.neto IS NOT NULL
  AND p.monto_neto IS NOT NULL
  AND ABS(c.neto - p.monto_neto) > 1000
  AND NOT EXISTS (
    -- Evitar duplicados: no actualizar si ya se actualizó por folio
    SELECT 1 FROM cotizaciones c2
    WHERE c2.adjudicada_a_protocolo::text = p.folio::text
  );

-- Agregar índice
CREATE INDEX IF NOT EXISTS idx_protocolos_monto_neto ON protocolos(monto_neto);
CREATE INDEX IF NOT EXISTS idx_protocolos_folio ON protocolos(folio);
CREATE INDEX IF NOT EXISTS idx_protocolos_numero_cotizacion ON protocolos(numero_cotizacion);

-- =====================================================
-- 3. TABLA ORDENES_COMPRA
-- =====================================================

-- Verificar que las columnas existen (deberían existir ya)
-- subtotal = neto, iva = impuesto, total = subtotal + iva

-- Actualizar órdenes que tienen total pero no tienen subtotal
UPDATE ordenes_compra
SET subtotal = ROUND(total / 1.19, 2),
    iva = ROUND(total - (total / 1.19), 2)
WHERE subtotal IS NULL
  AND total IS NOT NULL;

-- Recalcular desde items cuando existen (ordenes_compra_items es tabla relacional, no JSONB)
UPDATE ordenes_compra oc
SET subtotal = (
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
)
WHERE EXISTS (
  SELECT 1 FROM ordenes_compra_items WHERE orden_id = oc.id
);

-- Recalcular total
UPDATE ordenes_compra
SET total = subtotal + iva
WHERE subtotal IS NOT NULL AND iva IS NOT NULL;

-- Agregar índices si no existen
CREATE INDEX IF NOT EXISTS idx_ordenes_compra_proveedor_id ON ordenes_compra(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_compra_codigo_protocolo ON ordenes_compra(codigo_protocolo);
CREATE INDEX IF NOT EXISTS idx_ordenes_compra_subtotal ON ordenes_compra(subtotal);

-- =====================================================
-- 4. TABLA ORDENES_COMPRA_ITEMS
-- =====================================================

-- Agregar índice para mejorar performance de replaceOrdenCompraItems
CREATE INDEX IF NOT EXISTS idx_ordenes_compra_items_orden_id ON ordenes_compra_items(orden_id);

-- =====================================================
-- 5. VERIFICACIÓN DE POLÍTICAS RLS
-- =====================================================

-- Verificar que las políticas de seguridad permitan DELETE en ordenes_compra
-- (Para que la función eliminar OC funcione correctamente)

-- Listar políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('ordenes_compra', 'ordenes_compra_items', 'cotizaciones', 'protocolos')
ORDER BY tablename, policyname;

-- Si las políticas no permiten DELETE, agregar:
-- NOTA: Ajusta según tus necesidades de seguridad

-- Política para eliminar items de OC
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON ordenes_compra_items;
CREATE POLICY "Enable delete for authenticated users"
ON ordenes_compra_items
FOR DELETE
TO authenticated
USING (true);

-- Política para eliminar OC
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON ordenes_compra;
CREATE POLICY "Enable delete for authenticated users"
ON ordenes_compra
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- 6. COMENTARIOS EN COLUMNAS (Documentación)
-- =====================================================

COMMENT ON COLUMN cotizaciones.neto IS 'Valor neto de la cotización (sin IVA)';
COMMENT ON COLUMN cotizaciones.monto IS 'DEPRECADO: Contiene total con IVA. Usar columna neto';
COMMENT ON COLUMN protocolos.monto_neto IS 'Valor neto del protocolo (sin IVA), heredado de cotización';
COMMENT ON COLUMN protocolos.monto_total IS 'Valor total del protocolo (neto + IVA)';
COMMENT ON COLUMN ordenes_compra.subtotal IS 'Valor neto de la OC (sin IVA)';
COMMENT ON COLUMN ordenes_compra.iva IS 'IVA calculado (subtotal * 0.19)';
COMMENT ON COLUMN ordenes_compra.total IS 'Total de la OC (subtotal + iva)';

-- =====================================================
-- 7. FUNCIÓN HELPER PARA CALCULAR NETO DESDE ITEMS
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_neto_desde_items(items_json jsonb)
RETURNS DECIMAL(12,2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  neto DECIMAL(12,2);
BEGIN
  SELECT SUM(
    (COALESCE((item->>'cantidad')::numeric, 0) *
     COALESCE((item->>'valorUnitario')::numeric, (item->>'valor_unitario')::numeric, 0)) *
    (1 - COALESCE((item->>'descuento')::numeric, 0) / 100)
  ) INTO neto
  FROM jsonb_array_elements(items_json) item;

  RETURN COALESCE(neto, 0);
END;
$$;

-- =====================================================
-- 8. TRIGGERS PARA MANTENER CONSISTENCIA
-- =====================================================

-- Trigger para actualizar neto automáticamente en cotizaciones cuando cambian items
CREATE OR REPLACE FUNCTION actualizar_neto_cotizacion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.items IS NOT NULL AND jsonb_array_length(NEW.items) > 0 THEN
    NEW.neto := calcular_neto_desde_items(NEW.items);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_neto_cotizacion ON cotizaciones;
CREATE TRIGGER trigger_actualizar_neto_cotizacion
  BEFORE INSERT OR UPDATE OF items ON cotizaciones
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_neto_cotizacion();

-- =====================================================
-- 9. VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todas las cotizaciones tienen neto
SELECT
  COUNT(*) as total_cotizaciones,
  COUNT(neto) as con_neto,
  COUNT(*) - COUNT(neto) as sin_neto
FROM cotizaciones;

-- Verificar que todos los protocolos tienen monto_neto
SELECT
  COUNT(*) as total_protocolos,
  COUNT(monto_neto) as con_monto_neto,
  COUNT(*) - COUNT(monto_neto) as sin_monto_neto
FROM protocolos;

-- Verificar que todas las OC tienen subtotal
SELECT
  COUNT(*) as total_oc,
  COUNT(subtotal) as con_subtotal,
  COUNT(*) - COUNT(subtotal) as sin_subtotal
FROM ordenes_compra;

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================

-- INSTRUCCIONES:
-- 1. Ejecutar este script en el SQL Editor de Supabase
-- 2. Verificar los resultados de las consultas de verificación
-- 3. Proceder con los cambios en el código de la aplicación
