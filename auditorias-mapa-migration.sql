-- =====================================================
-- MÓDULO AUDITORÍAS - MAPA Y FOTOS DE TIENDA
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1) Tabla de registro fotográfico por tienda/fecha/tipo
CREATE TABLE IF NOT EXISTS audit_tienda_fotos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tienda_id UUID NOT NULL REFERENCES audit_tiendas(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL DEFAULT 'otra', -- visita_inicial, implementacion, seguimiento, otra
  fecha_evento DATE NOT NULL DEFAULT CURRENT_DATE,
  titulo VARCHAR(255),
  descripcion TEXT,
  foto_url TEXT NOT NULL,
  created_by UUID,
  created_by_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_tienda_fotos_tienda ON audit_tienda_fotos(tienda_id);
CREATE INDEX IF NOT EXISTS idx_audit_tienda_fotos_fecha ON audit_tienda_fotos(fecha_evento);
CREATE INDEX IF NOT EXISTS idx_audit_tienda_fotos_tipo ON audit_tienda_fotos(tipo);

-- 2) Vista de snapshot para mapa (una sola fuente de datos)
CREATE OR REPLACE VIEW store_status_snapshot
WITH (security_invoker = true) AS
SELECT
  t.id AS store_id,
  t.nombre AS store_name,
  t.ciudad AS city,
  t.region,
  t.direccion AS address,
  t.lat::DOUBLE PRECISION AS lat,
  t.lng::DOUBLE PRECISION AS lng,
  t.last_audit_at,
  t.last_score,
  CASE
    WHEN t.last_audit_at IS NULL THEN 'sin_auditoria'
    WHEN COALESCE(t.last_score, 0) >= 80 THEN 'ok'
    WHEN COALESCE(t.last_score, 0) >= 60 THEN 'observada'
    ELSE 'critica'
  END AS last_state,
  CASE
    WHEN t.last_audit_at IS NULL THEN NULL
    ELSE t.last_audit_at + INTERVAL '30 days'
  END AS next_due_at,
  CASE
    WHEN t.last_audit_at IS NULL THEN true
    ELSE t.last_audit_at < (NOW() - INTERVAL '30 days')
  END AS audit_overdue,
  CASE
    WHEN t.last_audit_at IS NULL THEN NULL
    ELSE GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (NOW() - t.last_audit_at)) / 86400)::INT - 30)
  END AS overdue_days,
  COALESCE(impl.active_investment_total, 0)::NUMERIC(12, 2) AS active_investment_total
FROM audit_tiendas t
LEFT JOIN (
  SELECT
    tienda_id,
    SUM(COALESCE(costo_total, 0)) AS active_investment_total
  FROM audit_implementaciones
  WHERE estado = 'activa'
  GROUP BY tienda_id
) impl ON impl.tienda_id = t.id
WHERE t.is_active = true;

GRANT SELECT ON store_status_snapshot TO authenticated;

-- 3) RLS para nueva tabla de fotos
ALTER TABLE audit_tienda_fotos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_tienda_fotos_select ON audit_tienda_fotos;
DROP POLICY IF EXISTS audit_tienda_fotos_insert ON audit_tienda_fotos;
DROP POLICY IF EXISTS audit_tienda_fotos_update ON audit_tienda_fotos;
DROP POLICY IF EXISTS audit_tienda_fotos_delete ON audit_tienda_fotos;

CREATE POLICY audit_tienda_fotos_select ON audit_tienda_fotos
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY audit_tienda_fotos_insert ON audit_tienda_fotos
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY audit_tienda_fotos_update ON audit_tienda_fotos
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY audit_tienda_fotos_delete ON audit_tienda_fotos
  FOR DELETE TO authenticated
  USING (true);
