-- =====================================================
-- FIX: Eliminar constraint problemático oc_items_unique
-- =====================================================

-- PASO 1: Ver información del constraint
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'ordenes_compra_items'
  AND tc.constraint_name = 'oc_items_unique';

-- PASO 2: Ver todos los constraints de la tabla
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'ordenes_compra_items'::regclass;

-- PASO 3: ELIMINAR el constraint problemático
ALTER TABLE ordenes_compra_items
DROP CONSTRAINT IF EXISTS oc_items_unique;

-- PASO 4: Verificar que se eliminó
SELECT
  '✅ CONSTRAINT ELIMINADO' as resultado,
  COUNT(*) as constraints_restantes
FROM information_schema.table_constraints
WHERE table_name = 'ordenes_compra_items'
  AND constraint_name = 'oc_items_unique';

-- PASO 5: Ver constraints restantes
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'ordenes_compra_items'
ORDER BY constraint_type, constraint_name;
