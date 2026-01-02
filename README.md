# KURION - Sistema de Gestión de Proyectos
### Building Me

![Kurion](https://img.shields.io/badge/Version-1.0.0-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node](https://img.shields.io/badge/Node.js-Express-green)

## 📋 Descripción

KURION es un sistema completo de gestión de proyectos diseñado específicamente para Building Me. Permite gestionar cotizaciones, protocolos de compra, órdenes de compra, proveedores y clientes con un flujo integrado de trabajo.

## 🎨 Características

- ✅ Sistema de autenticación con roles (Admin, Compras, Finanzas)
- ✅ Dashboard con indicadores en tiempo real
- ✅ Gestión de 6 unidades de negocio
- ✅ Módulo de cotizaciones con estados (Ganada/Perdida/Standby)
- ✅ Protocolos de compra vinculados a cotizaciones
- ✅ Órdenes de compra a proveedores
- ✅ Base de datos de proveedores y clientes
- ✅ Exportación a PDF de cotizaciones
- ✅ Diseño moderno y responsivo

## 🔐 Usuarios del Sistema

| Usuario  | Contraseña    | Rol      | Permisos                                    |
|----------|---------------|----------|---------------------------------------------|
| Paula    | admin123      | Admin    | Acceso total                                |
| Alonso   | admin123      | Admin    | Acceso total                                |
| Joaquín  | compras123    | Compras  | Cotizaciones, Protocolos, OC, Proveedores   |
| Carolina | finanzas123   | Finanzas | Cotizaciones, Clientes, Facturación         |

## 🏢 Unidades de Negocio

1. Vía Pública
2. Stand y Ferias
3. TradeMarketing
4. Inmobiliarias
5. Imprenta
6. Varios

## 🚀 Instalación

### Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn

### Paso 1: Instalar Frontend

```bash
cd kurion-project/frontend
npm install
```

### Paso 2: Instalar Backend

```bash
cd ../backend
npm install
```

## 💻 Ejecución

### Iniciar Backend (Terminal 1)

```bash
cd backend
npm run dev
```

El servidor estará corriendo en: `http://localhost:5000`

### Iniciar Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

## 📁 Estructura del Proyecto

```
kurion-project/
├── frontend/
│   ├── App.jsx           # Componente principal
│   ├── main.jsx          # Punto de entrada
│   ├── index.html        # HTML base
│   ├── index.css         # Estilos globales
│   ├── package.json      # Dependencias frontend
│   ├── vite.config.js    # Configuración Vite
│   └── tailwind.config.js # Configuración Tailwind
│
├── backend/
│   ├── server.js         # Servidor Express
│   ├── package.json      # Dependencias backend
│   └── data/             # Base de datos JSON
│       ├── cotizaciones.json
│       ├── protocolos.json
│       ├── ordenes.json
│       ├── proveedores.json
│       └── clientes.json
│
└── README.md
```

## 🔄 Flujo de Trabajo

```
COTIZACIÓN (Emitida)
    ↓
COTIZACIÓN (Ganada) → Genera automáticamente PROTOCOLO
    ↓
PROTOCOLO DE COMPRA
    ↓
ÓRDENES DE COMPRA (vinculadas a proveedores)
    ↓
Vinculación con Facturas y Guías de Despacho
    ↓
PROTOCOLO (Cerrado/Terminado)
    ↓
FACTURACIÓN AL CLIENTE
```

## 🎨 Paleta de Colores

- **Primary Dark**: `#235250`
- **Primary Green**: `#45ad98`
- **Primary Blue**: `#33b4e9`

## 📱 Módulos

### 1. Dashboard
- Visualización de KPIs
- Filtros por unidad de negocio
- Estadísticas en tiempo real

### 2. Cotizaciones
- Crear nuevas cotizaciones
- Número correlativo automático
- Estados: Ganada, Perdida, Standby
- Exportar a PDF

### 3. Protocolos de Compra
- Vinculación automática con cotizaciones ganadas
- Gestión de compras del proyecto
- Seguimiento de órdenes

### 4. Órdenes de Compra
- Generación desde protocolos
- Vinculación con proveedores
- Registro de facturas y guías

### 5. Proveedores
- Base de datos completa
- Historial de órdenes

### 6. Clientes
- Base de datos de clientes
- Historial de cotizaciones

### 7. Administración
- Gestión de usuarios (Solo Admin)
- Configuración del sistema

## 🔧 API Endpoints

### Cotizaciones
- `GET /api/cotizaciones` - Listar todas
- `GET /api/cotizaciones/:id` - Obtener una
- `POST /api/cotizaciones` - Crear nueva
- `PUT /api/cotizaciones/:id` - Actualizar
- `PATCH /api/cotizaciones/:id/estado` - Cambiar estado

### Protocolos
- `GET /api/protocolos` - Listar todos
- `GET /api/protocolos/:id` - Obtener uno
- `PUT /api/protocolos/:id` - Actualizar

### Órdenes de Compra
- `GET /api/ordenes` - Listar todas
- `POST /api/ordenes` - Crear nueva

### Proveedores
- `GET /api/proveedores` - Listar todos
- `POST /api/proveedores` - Crear nuevo

### Clientes
- `GET /api/clientes` - Listar todos
- `POST /api/clientes` - Crear nuevo

### Estadísticas
- `GET /api/estadisticas` - Obtener dashboard stats

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 18
- Vite
- Tailwind CSS
- Lucide React (iconos)
- Google Fonts (Outfit)

### Backend
- Node.js
- Express
- JSON File System (base de datos)
- CORS

## 📝 Próximas Mejoras

- [ ] Integración con base de datos PostgreSQL/MySQL
- [ ] Sistema de notificaciones
- [ ] Generación automática de PDFs mejorada
- [ ] Dashboard con gráficos interactivos
- [ ] Historial de cambios y auditoría
- [ ] Sistema de comentarios y notas
- [ ] Integración con email
- [ ] Backup automático de datos

## 📞 Soporte

Para soporte o consultas, contactar al equipo de desarrollo de Building Me.

---

**© 2025 Building Me. Todos los derechos reservados.**
