const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Directorio de datos
const DATA_DIR = path.join(__dirname, 'data');

// Asegurar que exista el directorio de datos
async function initDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Inicializar archivos JSON si no existen
    const files = ['cotizaciones.json', 'protocolos.json', 'ordenes.json', 'proveedores.json', 'clientes.json'];
    
    for (const file of files) {
      const filePath = path.join(DATA_DIR, file);
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, JSON.stringify([]), 'utf8');
      }
    }
  } catch (error) {
    console.error('Error al inicializar directorio de datos:', error);
  }
}

// Funciones helper para leer/escribir JSON
async function readJSON(filename) {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error leyendo ${filename}:`, error);
    return [];
  }
}

async function writeJSON(filename, data) {
  try {
    await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error escribiendo ${filename}:`, error);
    return false;
  }
}

// ==================== RUTAS DE COTIZACIONES ====================

// Obtener todas las cotizaciones
app.get('/api/cotizaciones', async (req, res) => {
  const cotizaciones = await readJSON('cotizaciones.json');
  res.json(cotizaciones);
});

// Obtener cotización por ID
app.get('/api/cotizaciones/:id', async (req, res) => {
  const cotizaciones = await readJSON('cotizaciones.json');
  const cotizacion = cotizaciones.find(c => c.id === req.params.id);
  
  if (cotizacion) {
    res.json(cotizacion);
  } else {
    res.status(404).json({ error: 'Cotización no encontrada' });
  }
});

// Crear nueva cotización
app.post('/api/cotizaciones', async (req, res) => {
  const cotizaciones = await readJSON('cotizaciones.json');
  
  // Generar número correlativo
  const ultimoNumero = cotizaciones.length > 0 
    ? Math.max(...cotizaciones.map(c => parseInt(c.numero))) 
    : 0;
  
  const nuevaCotizacion = {
    id: Date.now().toString(),
    numero: (ultimoNumero + 1).toString().padStart(6, '0'),
    fecha: new Date().toISOString(),
    estado: 'emitida', // emitida, ganada, perdida, standby
    ...req.body
  };
  
  cotizaciones.push(nuevaCotizacion);
  await writeJSON('cotizaciones.json', cotizaciones);
  
  res.status(201).json(nuevaCotizacion);
});

// Actualizar cotización
app.put('/api/cotizaciones/:id', async (req, res) => {
  const cotizaciones = await readJSON('cotizaciones.json');
  const index = cotizaciones.findIndex(c => c.id === req.params.id);
  
  if (index !== -1) {
    cotizaciones[index] = { ...cotizaciones[index], ...req.body };
    await writeJSON('cotizaciones.json', cotizaciones);
    res.json(cotizaciones[index]);
  } else {
    res.status(404).json({ error: 'Cotización no encontrada' });
  }
});

// Cambiar estado de cotización
app.patch('/api/cotizaciones/:id/estado', async (req, res) => {
  const cotizaciones = await readJSON('cotizaciones.json');
  const index = cotizaciones.findIndex(c => c.id === req.params.id);
  
  if (index !== -1) {
    cotizaciones[index].estado = req.body.estado;
    cotizaciones[index].fechaActualizacion = new Date().toISOString();
    await writeJSON('cotizaciones.json', cotizaciones);
    
    // Si la cotización es ganada, crear automáticamente un protocolo
    if (req.body.estado === 'ganada') {
      const protocolos = await readJSON('protocolos.json');
      const nuevoProtocolo = {
        id: Date.now().toString(),
        numero: `PROT-${cotizaciones[index].numero}`,
        cotizacionId: cotizaciones[index].id,
        cotizacionNumero: cotizaciones[index].numero,
        fecha: new Date().toISOString(),
        estado: 'abierto',
        cliente: cotizaciones[index].cliente,
        unidadNegocio: cotizaciones[index].unidadNegocio,
        monto: cotizaciones[index].monto
      };
      protocolos.push(nuevoProtocolo);
      await writeJSON('protocolos.json', protocolos);
    }
    
    res.json(cotizaciones[index]);
  } else {
    res.status(404).json({ error: 'Cotización no encontrada' });
  }
});

// ==================== RUTAS DE PROTOCOLOS ====================

// Obtener todos los protocolos
app.get('/api/protocolos', async (req, res) => {
  const protocolos = await readJSON('protocolos.json');
  res.json(protocolos);
});

// Obtener protocolo por ID
app.get('/api/protocolos/:id', async (req, res) => {
  const protocolos = await readJSON('protocolos.json');
  const protocolo = protocolos.find(p => p.id === req.params.id);
  
  if (protocolo) {
    res.json(protocolo);
  } else {
    res.status(404).json({ error: 'Protocolo no encontrado' });
  }
});

// Actualizar protocolo
app.put('/api/protocolos/:id', async (req, res) => {
  const protocolos = await readJSON('protocolos.json');
  const index = protocolos.findIndex(p => p.id === req.params.id);
  
  if (index !== -1) {
    protocolos[index] = { ...protocolos[index], ...req.body };
    await writeJSON('protocolos.json', protocolos);
    res.json(protocolos[index]);
  } else {
    res.status(404).json({ error: 'Protocolo no encontrado' });
  }
});

// ==================== RUTAS DE ÓRDENES DE COMPRA ====================

// Obtener todas las órdenes
app.get('/api/ordenes', async (req, res) => {
  const ordenes = await readJSON('ordenes.json');
  res.json(ordenes);
});

// Crear nueva orden de compra
app.post('/api/ordenes', async (req, res) => {
  const ordenes = await readJSON('ordenes.json');
  
  const ultimoNumero = ordenes.length > 0 
    ? Math.max(...ordenes.map(o => parseInt(o.numero))) 
    : 0;
  
  const nuevaOrden = {
    id: Date.now().toString(),
    numero: `OC-${(ultimoNumero + 1).toString().padStart(6, '0')}`,
    fecha: new Date().toISOString(),
    ...req.body
  };
  
  ordenes.push(nuevaOrden);
  await writeJSON('ordenes.json', ordenes);
  
  res.status(201).json(nuevaOrden);
});

// ==================== RUTAS DE PROVEEDORES ====================

// Obtener todos los proveedores
app.get('/api/proveedores', async (req, res) => {
  const proveedores = await readJSON('proveedores.json');
  res.json(proveedores);
});

// Crear nuevo proveedor
app.post('/api/proveedores', async (req, res) => {
  const proveedores = await readJSON('proveedores.json');
  
  const nuevoProveedor = {
    id: Date.now().toString(),
    fechaCreacion: new Date().toISOString(),
    ...req.body
  };
  
  proveedores.push(nuevoProveedor);
  await writeJSON('proveedores.json', proveedores);
  
  res.status(201).json(nuevoProveedor);
});

// ==================== RUTAS DE CLIENTES ====================

// Obtener todos los clientes
app.get('/api/clientes', async (req, res) => {
  const clientes = await readJSON('clientes.json');
  res.json(clientes);
});

// Crear nuevo cliente
app.post('/api/clientes', async (req, res) => {
  const clientes = await readJSON('clientes.json');
  
  const nuevoCliente = {
    id: Date.now().toString(),
    fechaCreacion: new Date().toISOString(),
    ...req.body
  };
  
  clientes.push(nuevoCliente);
  await writeJSON('clientes.json', clientes);
  
  res.status(201).json(nuevoCliente);
});

// ==================== ESTADÍSTICAS ====================

app.get('/api/estadisticas', async (req, res) => {
  const cotizaciones = await readJSON('cotizaciones.json');
  const protocolos = await readJSON('protocolos.json');
  
  const stats = {
    cotizacionesEmitidas: cotizaciones.length,
    cotizacionesGanadas: cotizaciones.filter(c => c.estado === 'ganada').length,
    cotizacionesPerdidas: cotizaciones.filter(c => c.estado === 'perdida').length,
    cotizacionesStandby: cotizaciones.filter(c => c.estado === 'standby').length,
    montoVentas: cotizaciones
      .filter(c => c.estado === 'ganada')
      .reduce((sum, c) => sum + (c.monto || 0), 0),
    proyectosEnCurso: protocolos.filter(p => p.estado === 'abierto').length,
    proyectosTerminados: protocolos.filter(p => p.estado === 'cerrado').length
  };
  
  res.json(stats);
});

// ==================== INICIO DEL SERVIDOR ====================

app.listen(PORT, async () => {
  await initDataDir();
  console.log(`🚀 Servidor KURION ejecutándose en http://localhost:${PORT}`);
  console.log(`📁 Datos almacenados en: ${DATA_DIR}`);
});

module.exports = app;
