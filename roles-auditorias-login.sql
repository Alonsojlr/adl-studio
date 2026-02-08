-- =====================================================
-- ROLES PARA LOGIN AUDITORÍAS
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1) Normalizar valores legacy de rol para TradeMarketing
UPDATE usuarios
SET rol = 'trade_marketing'
WHERE lower(replace(replace(trim(rol), ' ', '_'), '-', '_')) IN ('trademarketing', 'trade_marketing');

-- 2) Asignar rol Auditor (acceso solo a Tiendas en módulo Auditorías)
-- Reemplaza el email por el usuario real de auditor.
UPDATE usuarios
SET rol = 'auditor',
    activo = true
WHERE lower(email) = lower('auditor@tuempresa.com');

-- 3) Asignar rol TradeMarketing (acceso completo al módulo Auditorías)
-- Reemplaza el email por el usuario real de TradeMarketing.
UPDATE usuarios
SET rol = 'trade_marketing',
    activo = true
WHERE lower(email) = lower('trademarketing@tuempresa.com');

-- 4) Verificación rápida
SELECT id, email, nombre, rol, activo
FROM usuarios
WHERE lower(email) IN (
  lower('auditor@tuempresa.com'),
  lower('trademarketing@tuempresa.com')
)
ORDER BY email;
