-- =====================================================
-- VERIFICAR Y ELIMINAR ÍNDICES Y CONSTRAINTS UNIQUE
-- =====================================================

-- PASO 1: Ver TODOS los índices de la tabla
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'ordenes_compra_items';

-- PASO 2: Ver índices UNIQUE específicamente
SELECT
  i.relname as index_name,
  a.attname as column_name,
  ix.indisunique as is_unique
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
WHERE t.relname = 'ordenes_compra_items'
  AND ix.indisunique = true
ORDER BY i.relname, a.attnum;

-- PASO 3: Ver constraints UNIQUE
SELECT
  conname,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'ordenes_compra_items'::regclass
  AND contype = 'u';

-- PASO 4: ELIMINAR constraint si existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'ordenes_compra_items'::regclass
    AND conname = 'oc_items_unique'
  ) THEN
    ALTER TABLE ordenes_compra_items DROP CONSTRAINT oc_items_unique;
    RAISE NOTICE 'Constraint oc_items_unique eliminado';
  ELSE
    RAISE NOTICE 'Constraint oc_items_unique NO existe';
  END IF;
END $$;

-- PASO 5: ELIMINAR índice UNIQUE si existe
DROP INDEX IF EXISTS oc_items_unique;
DROP INDEX IF EXISTS ordenes_compra_items_unique_idx;
DROP INDEX IF EXISTS idx_oc_items_unique;

-- PASO 6: Buscar CUALQUIER índice que tenga "unique" en el nombre
SELECT
  'DROP INDEX IF EXISTS ' || indexname || ';' as comando_para_eliminar
FROM pg_indexes
WHERE tablename = 'ordenes_compra_items'
  AND (indexname LIKE '%unique%' OR indexname LIKE '%oc_items%');

-- PASO 7: VERIFICACIÓN FINAL - No debería haber índices UNIQUE
SELECT
  '✅ VERIFICACIÓN FINAL' as paso,
  COUNT(*) as indices_unique_restantes
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
WHERE t.relname = 'ordenes_compra_items'
  AND ix.indisunique = true
  AND ix.indisprimary = false;  -- Excluir PRIMARY KEY

-- PASO 8: Ver qué queda
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'ordenes_compra_items'
ORDER BY indexname;
