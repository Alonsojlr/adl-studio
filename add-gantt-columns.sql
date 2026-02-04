-- Agregar columnas de fechas de producción para Carta Gantt
ALTER TABLE protocolos
  ADD COLUMN IF NOT EXISTS fecha_inicio_produccion DATE,
  ADD COLUMN IF NOT EXISTS fecha_entrega DATE;
