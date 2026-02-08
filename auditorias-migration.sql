-- =====================================================
-- MÓDULO AUDITORÍAS FERRETERÍAS - MIGRACIÓN SQL
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. TIENDAS (ferreterías)
CREATE TABLE IF NOT EXISTS audit_tiendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  ciudad VARCHAR(100),
  region VARCHAR(100),
  comuna VARCHAR(100),
  tipo_tienda VARCHAR(100), -- 'ferretería', 'home center', 'especializada'
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  kam VARCHAR(255),
  contacto_nombre VARCHAR(255),
  contacto_telefono VARCHAR(50),
  contacto_email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_audit_at TIMESTAMP WITH TIME ZONE,
  last_score DECIMAL(5, 2),
  last_state VARCHAR(20) DEFAULT 'sin_auditoría', -- 'ok', 'observada', 'critica', 'en_riesgo', 'sin_auditoría'
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. IMPLEMENTACIONES (qué se instaló en cada tienda)
CREATE TABLE IF NOT EXISTS audit_implementaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tienda_id UUID NOT NULL REFERENCES audit_tiendas(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL, -- 'Implementación DeWalt Q1 2025'
  fecha_instalacion DATE,
  estado VARCHAR(50) DEFAULT 'activa', -- 'activa', 'retirada', 'en_reparación'
  costo_fabricacion DECIMAL(12, 2) DEFAULT 0,
  costo_instalacion DECIMAL(12, 2) DEFAULT 0,
  costo_transporte DECIMAL(12, 2) DEFAULT 0,
  costo_total DECIMAL(12, 2) DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ACTIVOS (elementos instalados por implementación)
CREATE TABLE IF NOT EXISTS audit_activos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  implementacion_id UUID NOT NULL REFERENCES audit_implementaciones(id) ON DELETE CASCADE,
  tipo VARCHAR(100) NOT NULL, -- 'malla', 'vitrina', 'mueble_central', 'gráfica', 'otro'
  descripcion VARCHAR(255),
  codigo_modelo VARCHAR(100),
  cantidad INTEGER DEFAULT 1,
  costo_unitario DECIMAL(12, 2) DEFAULT 0,
  costo_total DECIMAL(12, 2) DEFAULT 0,
  estado VARCHAR(50) DEFAULT 'bueno', -- 'bueno', 'regular', 'malo', 'retirado'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PLANTILLAS DE CHECKLIST (dinámico)
CREATE TABLE IF NOT EXISTS audit_plantillas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL, -- 'Checklist Promotor DeWalt v1'
  tipo_auditoria VARCHAR(50) DEFAULT 'rapida', -- 'rapida', 'completa'
  descripcion TEXT,
  is_active BOOLEAN DEFAULT true,
  total_puntos INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ITEMS DE PLANTILLA (ítems del checklist)
CREATE TABLE IF NOT EXISTS audit_plantilla_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plantilla_id UUID NOT NULL REFERENCES audit_plantillas(id) ON DELETE CASCADE,
  zona VARCHAR(100) NOT NULL, -- 'general', 'marca', 'orden', 'stock', 'precios', 'mallas', 'vitrinas', 'mueble_central', 'facing', 'seguridad', 'cierre'
  label TEXT NOT NULL,
  descripcion_ayuda TEXT, -- texto de ayuda para el auditor
  peso INTEGER DEFAULT 1, -- 1-3
  max_puntos DECIMAL(5, 2) DEFAULT 0, -- puntos que suma este ítem (total plantilla = 100)
  requiere_foto_no BOOLEAN DEFAULT true, -- foto obligatoria si respuesta es NO
  requiere_foto_siempre BOOLEAN DEFAULT false, -- foto obligatoria siempre (items 1 y 12)
  orden INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. AUDITORÍAS (auditorías realizadas)
CREATE TABLE IF NOT EXISTS audit_auditorias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tienda_id UUID NOT NULL REFERENCES audit_tiendas(id) ON DELETE CASCADE,
  plantilla_id UUID REFERENCES audit_plantillas(id),
  auditor_nombre VARCHAR(255),
  auditor_id UUID,
  tipo_auditoria VARCHAR(50) DEFAULT 'rapida', -- 'rapida', 'completa'
  fecha_auditoria TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score_final DECIMAL(5, 2),
  estado VARCHAR(20), -- 'ok', 'observada', 'critica'
  total_items INTEGER DEFAULT 0,
  items_ok INTEGER DEFAULT 0,
  items_no INTEGER DEFAULT 0,
  items_na INTEGER DEFAULT 0,
  hallazgos_count INTEGER DEFAULT 0,
  observacion_general TEXT,
  next_due_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. RESPUESTAS DE AUDITORÍA (respuesta por cada ítem del checklist)
CREATE TABLE IF NOT EXISTS audit_respuestas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auditoria_id UUID NOT NULL REFERENCES audit_auditorias(id) ON DELETE CASCADE,
  plantilla_item_id UUID REFERENCES audit_plantilla_items(id),
  zona VARCHAR(100),
  label TEXT,
  resultado VARCHAR(10) NOT NULL, -- 'OK', 'NO', 'NA'
  severidad INTEGER, -- 1, 2, 3 (solo si NO)
  comentario TEXT,
  foto_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. HALLAZGOS (generados automáticamente por cada NO)
CREATE TABLE IF NOT EXISTS audit_hallazgos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auditoria_id UUID NOT NULL REFERENCES audit_auditorias(id) ON DELETE CASCADE,
  respuesta_id UUID REFERENCES audit_respuestas(id),
  tienda_id UUID NOT NULL REFERENCES audit_tiendas(id),
  zona VARCHAR(100),
  descripcion TEXT NOT NULL,
  severidad INTEGER DEFAULT 1,
  foto_url TEXT,
  estado VARCHAR(20) DEFAULT 'abierto', -- 'abierto', 'en_proceso', 'cerrado'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TAREAS
CREATE TABLE IF NOT EXISTS audit_tareas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tienda_id UUID NOT NULL REFERENCES audit_tiendas(id),
  auditoria_id UUID REFERENCES audit_auditorias(id),
  hallazgo_id UUID REFERENCES audit_hallazgos(id),
  implementacion_id UUID REFERENCES audit_implementaciones(id),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  estado VARCHAR(20) DEFAULT 'abierta', -- 'abierta', 'en_progreso', 'revision', 'cerrada'
  prioridad VARCHAR(20) DEFAULT 'media', -- 'baja', 'media', 'alta', 'urgente'
  responsable VARCHAR(255),
  responsable_tipo VARCHAR(50), -- 'building_me', 'tienda', 'promotor'
  fecha_limite DATE,
  foto_antes_url TEXT,
  foto_despues_url TEXT,
  costo DECIMAL(12, 2),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- 10. AJUSTES / REITERACIONES
CREATE TABLE IF NOT EXISTS audit_ajustes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tienda_id UUID NOT NULL REFERENCES audit_tiendas(id),
  implementacion_id UUID REFERENCES audit_implementaciones(id),
  tipo VARCHAR(50) NOT NULL, -- 'correccion', 'ampliacion', 'reparacion'
  motivo TEXT,
  descripcion TEXT,
  costo DECIMAL(12, 2) DEFAULT 0,
  foto_antes_url TEXT,
  foto_despues_url TEXT,
  resultado TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_audit_tiendas_region ON audit_tiendas(region);
CREATE INDEX IF NOT EXISTS idx_audit_tiendas_state ON audit_tiendas(last_state);
CREATE INDEX IF NOT EXISTS idx_audit_tiendas_active ON audit_tiendas(is_active);
CREATE INDEX IF NOT EXISTS idx_audit_implementaciones_tienda ON audit_implementaciones(tienda_id);
CREATE INDEX IF NOT EXISTS idx_audit_activos_impl ON audit_activos(implementacion_id);
CREATE INDEX IF NOT EXISTS idx_audit_auditorias_tienda ON audit_auditorias(tienda_id);
CREATE INDEX IF NOT EXISTS idx_audit_auditorias_fecha ON audit_auditorias(fecha_auditoria);
CREATE INDEX IF NOT EXISTS idx_audit_respuestas_auditoria ON audit_respuestas(auditoria_id);
CREATE INDEX IF NOT EXISTS idx_audit_hallazgos_tienda ON audit_hallazgos(tienda_id);
CREATE INDEX IF NOT EXISTS idx_audit_hallazgos_auditoria ON audit_hallazgos(auditoria_id);
CREATE INDEX IF NOT EXISTS idx_audit_tareas_tienda ON audit_tareas(tienda_id);
CREATE INDEX IF NOT EXISTS idx_audit_tareas_estado ON audit_tareas(estado);
CREATE INDEX IF NOT EXISTS idx_audit_ajustes_tienda ON audit_ajustes(tienda_id);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
ALTER TABLE audit_tiendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_implementaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_activos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_plantillas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_plantilla_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_auditorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_respuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_hallazgos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_ajustes ENABLE ROW LEVEL SECURITY;

-- Políticas: usuarios autenticados pueden hacer todo (MVP)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'audit_tiendas', 'audit_implementaciones', 'audit_activos',
    'audit_plantillas', 'audit_plantilla_items', 'audit_auditorias',
    'audit_respuestas', 'audit_hallazgos', 'audit_tareas', 'audit_ajustes'
  ]
  LOOP
    EXECUTE format('CREATE POLICY "%s_select" ON %I FOR SELECT TO authenticated USING (true)', t, t);
    EXECUTE format('CREATE POLICY "%s_insert" ON %I FOR INSERT TO authenticated WITH CHECK (true)', t, t);
    EXECUTE format('CREATE POLICY "%s_update" ON %I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', t, t);
    EXECUTE format('CREATE POLICY "%s_delete" ON %I FOR DELETE TO authenticated USING (true)', t, t);
  END LOOP;
END$$;

-- =====================================================
-- STORAGE BUCKET para fotos de auditoría
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('audit-fotos', 'audit-fotos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "audit_fotos_select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'audit-fotos');
CREATE POLICY "audit_fotos_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'audit-fotos');
CREATE POLICY "audit_fotos_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'audit-fotos');
CREATE POLICY "audit_fotos_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'audit-fotos');

-- =====================================================
-- PLANTILLA DEFAULT: Checklist Promotor (12 ítems)
-- =====================================================
DO $$
DECLARE
  plantilla_id UUID;
BEGIN
  INSERT INTO audit_plantillas (nombre, tipo_auditoria, descripcion, is_active, total_puntos)
  VALUES ('Checklist Promotor DeWalt', 'rapida', 'Auditoría rápida de 12 ítems para promotores. Duración estimada: 10-15 min.', true, 100)
  RETURNING id INTO plantilla_id;

  INSERT INTO audit_plantilla_items (plantilla_id, zona, label, descripcion_ayuda, peso, max_puntos, requiere_foto_no, requiere_foto_siempre, orden) VALUES
  (plantilla_id, 'general',        'Foto panorámica del área DeWalt',                                   'Toma una foto general del espacio completo de DeWalt en la tienda', 1, 0, false, true, 1),
  (plantilla_id, 'marca',          'Branding visible y correcto (logo / gráficas)',                      '¿Se ven claramente los logos y gráficas de DeWalt?', 2, 10, true, false, 2),
  (plantilla_id, 'marca',          'Sin mezcla de marcas competidoras en espacio DeWalt',                '¿Hay productos de otras marcas mezclados en el espacio exclusivo de DeWalt?', 2, 10, true, false, 3),
  (plantilla_id, 'orden',          'Productos ordenados según categoría',                                '¿Los productos están agrupados por categoría sin desorden crítico?', 2, 10, true, false, 4),
  (plantilla_id, 'stock',          'Presencia mínima de productos clave (no vacío)',                     '¿Hay stock visible de los productos principales? No debe verse vacío.', 3, 12, true, false, 5),
  (plantilla_id, 'precios',        'Precios visibles y legibles',                                       '¿Los precios están puestos y se pueden leer? Marcar NA si la tienda no usa precios en estante.', 1, 6, true, false, 6),
  (plantilla_id, 'mallas',         'Mallas firmes, alineadas, sin daño físico',                          '¿Las mallas están bien fijadas, alineadas y sin roturas?', 2, 10, true, false, 7),
  (plantilla_id, 'vitrinas',       'Vitrinas limpias, cerradas/operativas, sin daño',                    '¿Las vitrinas están limpias y funcionando? Marcar NA si no hay vitrinas.', 2, 10, true, false, 8),
  (plantilla_id, 'mueble_central', 'Mueble estable, limpio, con productos correctos',                   '¿El mueble central está en buen estado con los productos correctos? Marcar NA si no hay.', 2, 10, true, false, 9),
  (plantilla_id, 'facing',         'Productos frontales (facing) bien presentados',                      '¿Los productos del frente están bien colocados a nivel ojos/manos?', 2, 10, true, false, 10),
  (plantilla_id, 'seguridad',      'Sin riesgos: elementos sueltos, puntas, cableado expuesto',         '¿Hay algún riesgo de seguridad visible? Elementos sueltos, puntas, cables.', 3, 12, true, false, 11),
  (plantilla_id, 'cierre',         'Foto detalle del punto más crítico o producto estrella',             'Si hubo algún NO, foto del problema más grave. Si todo OK, foto del producto estrella.', 1, 0, false, true, 12);
END$$;

-- =====================================================
-- RESUMEN
-- =====================================================
-- Tablas creadas: 10
-- Índices: 13
-- RLS: habilitado en todas con políticas para authenticated
-- Storage bucket: audit-fotos (público)
-- Plantilla default: Checklist Promotor DeWalt (12 ítems, 100 puntos)
