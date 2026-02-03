# 📄 MÓDULO DE COTIZACIONES - Guía de Usuario

## ✨ Funcionalidades Completas

### 1. **Dashboard de Cotizaciones**
Vista general con estadísticas en tiempo real:
- **Total**: Todas las cotizaciones del sistema
- **Emitidas**: Cotizaciones pendientes de respuesta
- **Ganadas**: Cotizaciones confirmadas (generan automáticamente Protocolos)
- **Perdidas**: Cotizaciones rechazadas
- **Standby**: Cotizaciones en espera

### 2. **Búsqueda y Filtros**
- 🔍 Búsqueda por **número de cotización** o **nombre de cliente**
- 🎯 Filtro por **estado** (Todas, Emitidas, Ganadas, Perdidas, Standby)
- Resultados en tiempo real

### 3. **Listado de Cotizaciones**
Tabla completa con:
- N° de Cotización (formato: #000001)
- Fecha de emisión
- Cliente (Razón Social + RUT)
- Unidad de Negocio
- Monto total con IVA
- Estado visual con colores
- Botones de acción

### 4. **Gestión de Estados**
Para cotizaciones **Emitidas**, aparecen 3 botones:
- ✅ **Ganada** (verde): Marca la cotización como ganada
  - *Automáticamente genera un Protocolo de Compra*
- ❌ **Perdida** (rojo): Marca como perdida
- ⏸️ **Standby** (amarillo): Marca como en espera

### 5. **Crear Nueva Cotización**
Formulario completo dividido en secciones:

#### 📋 Datos del Cliente
- Razón Social *
- RUT *
- Dirección
- Contacto
- N° Contacto (teléfono)

#### 📄 Datos de la Cotización
- Fecha *
- Condiciones de Pago (ej: "50% anticipo, 50% contra entrega")
- Cotizado por *
- Unidad de Negocio * (6 opciones):
  - Vía Pública
  - Stand y Ferias
  - TradeMarketing
  - Inmobiliarias
  - Imprenta
  - Varios

#### 📦 Items (Dinámicos)
Cada item incluye:
- N° (automático)
- Item (nombre corto)
- Cantidad
- Descripción (detallada)
- Valor Unitario
- Descuento % (opcional)
- **Subtotal** (calculado automáticamente)

**Funciones:**
- ➕ **Agregar Item**: Añade una nueva línea
- ❌ **Eliminar Item**: Quita un item (debe haber al menos 1)
- Cálculo automático de subtotales

#### 💰 Totales Automáticos
- **Subtotal**: Suma de todos los items (con descuentos aplicados)
- **IVA 19%**: Calculado sobre el subtotal
- **TOTAL**: Monto final

#### 📝 Observaciones
Campo de texto libre para información adicional o términos especiales.

### 6. **Generación de PDF** 📥
Dos formas de generar PDF:

#### Desde el Listado:
- Click en el botón de **descarga** (azul) de cualquier cotización
- Descarga automática del PDF con formato Building Me

#### Desde el Formulario:
- Botón **"Vista Previa PDF"**: Genera PDF sin guardar la cotización
  - Útil para revisar antes de crear
- Botón **"Crear Cotización"**: Guarda en sistema + PDF disponible después

### 7. **Formato del PDF**
El PDF generado incluye:

**Header:**
- Logo Building Me (esquina superior izquierda)
- Información de la empresa:
  - Building Me
  - Marketing Maria Paula Ross EIRL
  - RUT: 76.226.767-5
  - Dirección: La Capitanía 80, Las Condes
  - Santiago - Chile
- Recuadro rojo con "COTIZACIÓN N° XXXXXX" (esquina superior derecha)

**Cuerpo:**
- Sección CLIENTE con todos los datos
- Fecha, Condiciones de Pago, Cotizado por
- Tabla de items con fondo verde (#1E3A8A):
  - N° | Cant | Descripción | V. Unitario | % Dscto | Sub total
- Observaciones (si existen)

**Totales:**
- Subtotal
- IVA 19%
- **TOTAL** (destacado)

**Footer:**
- Información importante (3 puntos legales):
  1. Valores en pesos más IVA
  2. Plazos de entrega
  3. Referencia a O.C

**Nombre del archivo:**
`Cotizacion_[NUMERO]_[CLIENTE].pdf`

Ejemplo: `Cotizacion_000123_Empresa_Demo_SA.pdf`

## 🎯 Flujo de Trabajo Típico

### Escenario 1: Cotización Nueva
1. Click en **"Nueva Cotización"**
2. Llenar datos del cliente
3. Agregar fecha y condiciones de pago
4. Seleccionar unidad de negocio
5. Agregar items uno por uno
6. Revisar totales calculados
7. Agregar observaciones si es necesario
8. **Opcional**: Click en "Vista Previa PDF" para revisar
9. Click en **"Crear Cotización"**
10. PDF disponible para descargar desde el listado

### Escenario 2: Cotización Ganada
1. Localizar cotización en el listado
2. Click en botón verde ✅ **"Ganada"**
3. Estado cambia a "Ganada" (badge verde)
4. **Sistema automáticamente crea un Protocolo de Compra** vinculado
5. Descargar PDF final si es necesario

### Escenario 3: Búsqueda y Seguimiento
1. Usar barra de búsqueda para encontrar cliente o número
2. Filtrar por estado específico
3. Revisar detalles y descargar PDF
4. Cambiar estado según respuesta del cliente

## 💡 Tips y Mejores Prácticas

### ✅ Recomendaciones:
- Completar todos los campos obligatorios (*)
- Usar descripciones claras en los items
- Revisar totales antes de crear
- Usar "Vista Previa PDF" para verificar formato
- Mantener actualizado el estado de cada cotización

### ⚠️ Consideraciones:
- El RUT debe incluir guiones: `12.345.678-9`
- Los descuentos se aplican por item, no al total
- Una vez marcada como "Ganada", se crea el Protocolo automáticamente
- Los números de cotización son correlativos y únicos

## 🔄 Próximas Mejoras Planificadas

- [ ] Integración con módulo de Clientes (autocompletar datos)
- [ ] Histórico de cambios de estado
- [ ] Envío de PDF por email
- [ ] Plantillas de items frecuentes
- [ ] Duplicar cotización existente
- [ ] Versionado de cotizaciones
- [ ] Notificaciones de vencimiento

## 🎨 Personalización

Los colores corporales de Building Me están definidos en:
- **Verde Principal**: `#1E3A8A`
- **Verde Oscuro**: `#0B1F3B`
- **Azul**: `#3B82F6`

Estos colores se usan consistentemente en:
- Badges de estado
- Botones de acción
- Headers de tablas
- Degradados

---

**¿Preguntas o sugerencias?**
Contacta al equipo de desarrollo de Building Me.
