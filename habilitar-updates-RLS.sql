-- =====================================================
-- HABILITAR UPDATES: Agregar política RLS
-- =====================================================

-- Opción 1: Agregar política para permitir UPDATE (más seguro)
CREATE POLICY "Enable UPDATE for all users" ON ordenes_compra
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Opción 2: Deshabilitar RLS temporalmente (menos seguro)
-- ALTER TABLE ordenes_compra DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE ordenes_compra_items DISABLE ROW LEVEL SECURITY;
