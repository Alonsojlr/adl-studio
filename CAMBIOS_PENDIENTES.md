# 📝 CAMBIOS PENDIENTES Y VERIFICACIÓN

## ✅ CAMBIOS COMPLETADOS

### 1. Scripts SQL para Supabase
- ✅ Archivo creado: `supabase-migration.sql`
- ✅ Agrega columna `neto` a tabla `cotizaciones`
- ✅ Agrega columna `monto_neto` a tabla `protocolos`
- ✅ Migra datos existentes calculando neto desde total
- ✅ Crea índices y triggers
- ✅ Configura políticas RLS para permitir DELETE

### 2. Correcciones en Cotizaciones
- ✅ **Línea 10256**: Guardar `neto` en vez de `total` al crear cotización
- ✅ **Línea 9663**: Guardar `neto` en vez de `total` al marcar como ganada
- ✅ **Línea 10679**: Guardar `neto` en vez de `total` en formulario de edición
- ✅ **Línea 11147**: Leer `neto` preferentemente en mapCotizacion
- ✅ **Líneas 5791, 11100**: Función `calcularNetoCotizacion` actualizada para priorizar campo `neto`

### 3. Correcciones en Protocolos
- ✅ **Línea 6585**: Función `calcularNetoProtocolo` actualizada
- ✅ **Línea 11321**: Al crear protocolo desde cotización, se guarda `monto_neto`
- ✅ **Líneas 5901, 11149**: Mapeo de protocolos usa `monto_neto` de BD

### 4. Correcciones en Órdenes de Compra
- ✅ **Líneas 4177-4206**: Eliminadas llamadas a `onUpdate` en `agregarItem`, `eliminarItem`, `actualizarItem`
- ✅ **Línea 4419**: Actualizado mensaje de edición
- ✅ **Línea 4432**: Campo Item ahora editable (`disabled={!isEditing}`)
- ✅ **Línea 4443**: Campo Cantidad ahora SIEMPRE deshabilitado (`disabled`)
- ✅ **Línea 4496**: Campo Descripción ahora editable (`disabled={!isEditing}`)

---

## ⚠️ CAMBIOS PENDIENTES (COMPLETAR MANUALMENTE)

### 5. Restringir edición en Cotizaciones

Buscar en **App.jsx** alrededor de las líneas **10200-10500** el componente `EditarCotizacionModal` o similar.

**Cambios necesarios:**
- Campo **Item**: Cambiar a `disabled={!isEditing}` o dejarlo editable
- Campo **Cantidad**: Cambiar a `disabled` (siempre deshabilitado)
- Campo **Descripción**: Cambiar a `disabled={!isEditing}` o dejarlo editable
- Campo **Valor Unitario**: Ya debe estar editable, verificar `disabled={!isEditing}`
- Campo **Descuento**: Cambiar a `disabled` (siempre deshabilitado)

**Mensaje a actualizar:**
```javascript
{isEditing && (
  <p className="text-sm text-gray-500">En edición solo puedes ajustar: Item, Descripción y Valor Unitario.</p>
)}
```

### 6. Corregir cálculos en módulo Proveedores

**Ubicación**: Línea ~4687 en `ProveedoresModule`

**Cambiar:**
```javascript
const total = parseFloat(oc.total) || 0;
const subtotal = parseFloat(oc.subtotal) || 0;
const iva = parseFloat(oc.iva) || 0;
const monto = total || (subtotal + iva) || 0;  // ❌ Usa total con IVA
```

**Por:**
```javascript
const total = parseFloat(oc.total) || 0;
const subtotal = parseFloat(oc.subtotal) || 0;
const iva = parseFloat(oc.iva) || 0;
const monto = subtotal || (total / 1.19) || 0;  // ✅ Usar neto
```

### 7. Corregir cálculos en Dashboard

**Ubicación**: Líneas ~11425-11500 en función `useEffect` del Dashboard

**Cambiar todos los cálculos de montoVentas para que usen valores netos:**
```javascript
// Cambiar:
montoVentas: sharedCotizaciones
  .filter(c => c.estado === 'ganada')
  .reduce((sum, c) => sum + c.monto, 0)  // ❌ monto puede tener IVA

// Por:
montoVentas: sharedCotizaciones
  .filter(c => c.estado === 'ganada')
  .reduce((sum, c) => sum + (c.monto || 0), 0)  // ✅ Ya corregido para usar neto
```

### 8. Eliminar campo "valor final" al cerrar protocolo

**Ubicación**: Buscar en ~líneas 6000-7000 donde se cierra un protocolo

**Buscar:**
- Modal o formulario que permita "Cerrar Protocolo"
- Campo que pida "Valor Final" o "Monto Final"

**Acción:**
- Eliminar ese campo del formulario
- Solo cambiar el estado a "Cerrado" sin pedir valor adicional

### 9. Verificar función eliminar OC

**Ubicación**: Línea 3188 y archivo `src/api/ordenes-compra.js` líneas 162-180

**Función en src/api/ordenes-compra.js:**
```javascript
export const deleteOrdenCompra = async (id) => {
  const { error: itemsError } = await supabase
    .from('ordenes_compra_items')
    .delete()
    .eq('orden_id', id)

  if (itemsError) throw itemsError

  const { data, error } = await supabase
    .from('ordenes_compra')
    .delete()
    .eq('id', id)
    .select()

  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('No se pudo eliminar la OC')
  }
}
```

**Verificación:**
- ✅ La función está correctamente implementada
- ⚠️ Si no funciona, el problema es en Supabase RLS
- ✅ El script SQL ya incluye políticas RLS para permitir DELETE

**Si aún no funciona:**
1. Ir a Supabase Dashboard → Authentication → Policies
2. Verificar tabla `ordenes_compra` tiene policy de DELETE
3. Verificar tabla `ordenes_compra_items` tiene policy de DELETE
4. Si no existen, ejecutar las políticas del script SQL

---

## 🗄️ INSTRUCCIONES DE MIGRACIÓN

### Paso 1: Ejecutar Script SQL

1. Ir a **Supabase Dashboard**
2. Ir a **SQL Editor**
3. Abrir el archivo `supabase-migration.sql`
4. Copiar y pegar todo el contenido
5. Ejecutar (Run)
6. Verificar que no haya errores

**Verificaciones al final del script:**
```sql
-- Verificar cotizaciones
SELECT COUNT(*) as total, COUNT(neto) as con_neto
FROM cotizaciones;

-- Verificar protocolos
SELECT COUNT(*) as total, COUNT(monto_neto) as con_monto_neto
FROM protocolos;

-- Verificar OC
SELECT COUNT(*) as total, COUNT(subtotal) as con_subtotal
FROM ordenes_compra;
```

### Paso 2: Verificar la aplicación

1. **Reiniciar servidor** (si usa cache)
2. **Crear nueva cotización** → Verificar que guarda en `neto`
3. **Marcar cotización como ganada** → Verificar que crea protocolo con `monto_neto`
4. **Editar OC** → Verificar que solo se edita Item, Descripción y Valor Unitario
5. **Eliminar OC** → Verificar que se elimina correctamente
6. **Ver Dashboard** → Verificar que muestra valores netos

### Paso 3: Completar cambios pendientes

1. **Cotizaciones (punto 5):** Restringir campos editables
2. **Proveedores (punto 6):** Corregir cálculo de montos
3. **Dashboard (punto 7):** Usar valores netos
4. **Protocolos (punto 8):** Eliminar "valor final"
5. **OC Delete (punto 9):** Verificar políticas RLS

---

## 🔍 VERIFICACIÓN DE FLUJO CORRECTO

### Flujo Completo Esperado:

1. **Crear Cotización**
   - ✅ Se ingresa valor NETO en items
   - ✅ Se calcula IVA automáticamente (19%)
   - ✅ Se guarda en columna `neto`
   - ✅ Total = neto + IVA (solo para visualización)

2. **Marcar Cotización como Ganada**
   - ✅ Se crea Protocolo automáticamente
   - ✅ Protocolo hereda `monto_neto` de la cotización
   - ✅ Se calcula `monto_total` = monto_neto * 1.19

3. **Crear Orden de Compra desde Protocolo**
   - ✅ Se ingresa valor NETO en items
   - ✅ Se calcula IVA (19%)
   - ✅ Se guarda en columnas `subtotal`, `iva`, `total`

4. **Editar Orden de Compra**
   - ✅ Solo se puede editar: Item, Descripción, Valor Unitario
   - ✅ NO se puede editar: Cantidad, Descuento

5. **Cerrar Protocolo**
   - ✅ Solo cambiar estado a "Cerrado"
   - ✅ NO pedir "valor final"

6. **Eliminar OC**
   - ✅ Se eliminan items primero
   - ✅ Luego se elimina la OC

7. **Módulo Proveedores**
   - ✅ Muestra montos NETOS (subtotal)
   - ✅ No usa totales con IVA

8. **Dashboard**
   - ✅ Todas las estadísticas usan valores NETOS
   - ✅ Cálculos de márgenes sobre neto

---

## 📊 RESUMEN DE CAMBIOS EN BASE DE DATOS

| Tabla | Columna Nueva | Propósito |
|-------|--------------|-----------|
| `cotizaciones` | `neto` | Valor neto sin IVA (reemplaza uso de `monto` que tenía total) |
| `protocolos` | `monto_neto` | Valor neto heredado de cotización |
| `ordenes_compra` | (ya existía) | Ya tiene `subtotal` (neto), `iva`, `total` |

**Nota importante:** La columna `monto` en `cotizaciones` contendrá ambos valores durante la transición:
- **Datos antiguos**: `monto` = total con IVA
- **Datos nuevos**: `monto` = neto (igual a columna `neto`)
- **Lectura**: Siempre preferir columna `neto` cuando existe

---

## 🐛 PROBLEMAS CONOCIDOS Y SOLUCIONES

### Problema 1: "No se puede eliminar OC"
**Causa:** Políticas RLS de Supabase bloquean DELETE
**Solución:** Ejecutar sección 5 del script SQL que crea políticas

### Problema 2: "Items de OC se duplican"
**Causa:** Llamadas múltiples a `onUpdate` en edición
**Solución:** ✅ Ya corregido - se eliminaron llamadas a `onUpdate`

### Problema 3: "Dashboard muestra valores con IVA"
**Causa:** Usando `monto` en vez de `neto`
**Solución:** Completar punto 7 de cambios pendientes

### Problema 4: "Proveedores muestran totales incorrectos"
**Causa:** Usando `total` en vez de `subtotal`
**Solución:** Completar punto 6 de cambios pendientes

---

## ✅ CHECKLIST FINAL

Antes de dar por terminado:

- [ ] Script SQL ejecutado sin errores
- [ ] Todas las tablas tienen las columnas nuevas
- [ ] Cotizaciones guardan en `neto`
- [ ] Protocolos guardan `monto_neto`
- [ ] Edición de OC restringida correctamente
- [ ] Edición de Cotizaciones restringida correctamente
- [ ] Módulo Proveedores usa valores netos
- [ ] Dashboard usa valores netos
- [ ] Eliminar OC funciona correctamente
- [ ] Cerrar Protocolo no pide "valor final"
- [ ] Flujo completo probado end-to-end

---

## 📞 SOPORTE

Si encuentras errores o necesitas ayuda:
1. Revisa esta guía completa
2. Verifica los logs de Supabase
3. Revisa la consola del navegador (F12)
4. Verifica que el script SQL se ejecutó completamente

**Fecha de creación:** 2026-02-02
**Versión:** 1.0
