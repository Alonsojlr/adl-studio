-- =====================================================
-- AGREGAR TABLA DE CONTACTOS PARA CLIENTES
-- =====================================================
-- Ejecutar este script en Supabase SQL Editor

-- 1. Crear tabla de contactos
CREATE TABLE IF NOT EXISTS clientes_contactos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  cargo VARCHAR(255),
  email VARCHAR(255),
  telefono VARCHAR(50),
  es_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índice para búsquedas por cliente
CREATE INDEX IF NOT EXISTS idx_clientes_contactos_cliente_id ON clientes_contactos(cliente_id);

-- 3. Habilitar RLS
ALTER TABLE clientes_contactos ENABLE ROW LEVEL SECURITY;

-- 4. Crear política RLS para usuarios autenticados
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver contactos" ON clientes_contactos;
CREATE POLICY "Usuarios autenticados pueden ver contactos" ON clientes_contactos
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. Migrar contactos existentes de la tabla clientes a clientes_contactos
INSERT INTO clientes_contactos (cliente_id, nombre, email, telefono, es_principal)
SELECT
  id as cliente_id,
  COALESCE(persona_encargada, 'Sin nombre') as nombre,
  email,
  telefono,
  true as es_principal
FROM clientes
WHERE persona_encargada IS NOT NULL AND persona_encargada != ''
ON CONFLICT DO NOTHING;

-- Verificar que se creó correctamente
SELECT 'Tabla clientes_contactos creada exitosamente' as mensaje;
SELECT COUNT(*) as contactos_migrados FROM clientes_contactos;
