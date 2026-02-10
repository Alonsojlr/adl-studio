-- =====================================================
-- CHAT DE PROTOCOLOS (TABLEROS DE PROYECTO)
-- Ejecutar en Supabase SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS protocolos_chat_mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo_id UUID NOT NULL REFERENCES protocolos(id) ON DELETE CASCADE,
  mensaje TEXT NOT NULL,
  user_id UUID,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT protocolos_chat_mensaje_no_vacio CHECK (char_length(trim(mensaje)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_protocolos_chat_protocolo_fecha
  ON protocolos_chat_mensajes (protocolo_id, created_at);

GRANT SELECT, INSERT ON protocolos_chat_mensajes TO authenticated;

ALTER TABLE protocolos_chat_mensajes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS protocolos_chat_select ON protocolos_chat_mensajes;
DROP POLICY IF EXISTS protocolos_chat_insert ON protocolos_chat_mensajes;

CREATE POLICY protocolos_chat_select
  ON protocolos_chat_mensajes
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY protocolos_chat_insert
  ON protocolos_chat_mensajes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
