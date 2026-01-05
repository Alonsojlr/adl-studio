import React, { useState, useEffect } from 'react';
import { supabase } from './src/lib/supabaseClient';
import { getCotizaciones, createCotizacion, updateCotizacion, deleteCotizacion } from './src/api/cotizaciones';
import { getProtocolos, createProtocolo, updateProtocolo, deleteProtocolo } from './src/api/protocolos';
import { getOrdenesCompra, createOrdenCompra, updateOrdenCompra, replaceOrdenCompraItems } from './src/api/ordenes-compra';
import { getClientes, createCliente, updateCliente, deleteCliente } from './src/api/clientes';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from './src/api/proveedores';
import { autenticarUsuario, getUsuarios, createUsuario, updateUsuario, deleteUsuario } from './src/api/usuarios';
import { getInventarioItems, getInventarioReservas, createInventarioItem, createInventarioReserva, updateInventarioReserva } from './src/api/inventario';
import { BarChart3, FileText, ShoppingCart, Package, Users, Building2, Settings, LogOut, TrendingUp, Clock, DollarSign, CheckCircle, XCircle, Pause, Download } from 'lucide-react';
import { generarOCDesdeTemplate, generarCotizacionPDF, generarOCPDF } from './src/utils/documentGenerator';

// Sistema de autenticación y roles
const USERS = {
  'alopez@buildingme.cl': { 
    password: 'Mirusita968!', 
    role: 'admin', 
    name: 'Alonso López' 
  },
  'paula@buildingme.cl': { 
    password: 'Tegula175', 
    role: 'admin', 
    name: 'Paula Ross' 
  }
};

const BUSINESS_UNITS = [
  'Vía Pública',
  'Stand y Ferias',
  'TradeMarketing',
  'Inmobiliarias',
  'Imprenta',
  'Varios',
  'Financiamiento'
];

// Componente de Login
const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const usuario = await autenticarUsuario(username.toLowerCase(), password);
      
      onLogin({
        id: usuario.id,
        email: usuario.email,
        username: usuario.email,
        name: usuario.nombre,
        role: usuario.rol
      });
    } catch (error) {
      console.error('Error login:', error);
      setError('Usuario o contraseña incorrectos');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: 'url(/bg-login3.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Contenedor del login */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo Building Me centrado */}
        <div className="text-center mb-20">
          <img 
            src="/logo-building-me.png" 
            alt="Building Me" 
            className="h-20 mx-auto"
            style={{ filter: 'brightness(0) invert(1) drop-shadow(0 2px 10px rgba(0, 0, 0, 0.3))' }}
          />
        </div>

        {/* Card de Login */}
        <div 
          className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8"
          style={{
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
          }}
        >
          <h2 className="text-3xl font-bold text-white text-center mb-8">Login</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl backdrop-blur-sm">
              <p className="text-white text-sm text-center font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Usuario */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuario"
                  className="w-full px-6 py-4 bg-white/10 border-2 border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:border-white/60 backdrop-blur-sm transition-all text-lg"
                  required
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full px-6 py-4 bg-white/10 border-2 border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:border-white/60 backdrop-blur-sm transition-all text-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Botón Login */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all transform hover:scale-105 hover:shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                color: '#235250'
              }}
            >
              Iniciar Sesión
            </button>
          </form>
        </div>

        {/* Footer con logo KODIAK */}
        <div className="text-center mt-10">
          <p className="text-white/70 text-sm mb-4">
            Kodiak Software © 2025 - Todos los derechos reservados
          </p>
          <img 
            src="/logo-kodiak.png" 
            alt="KODIAK" 
            className="h-20 mx-auto opacity-90"
          />
        </div>
      </div>
    </div>
  );
};

// Componente de Módulo de Inventario/Bodega
const InventarioModule = ({ activeModule }) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [showFichaModal, setShowFichaModal] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('todas');

  const loadItems = async (selectedId = null) => {
    try {
      setLoadingItems(true);
      setItemsError('');
      const [itemsData, reservasData] = await Promise.all([
        getInventarioItems(),
        getInventarioReservas()
      ]);

      const reservasPorItem = reservasData.reduce((acc, reserva) => {
        const key = reserva.item_id;
        if (!acc[key]) acc[key] = [];
        acc[key].push(reserva);
        return acc;
      }, {});

      const transformados = itemsData.map(item => ({
        id: item.id,
        codigo: item.codigo,
        nombre: item.nombre,
        descripcion: item.descripcion,
        categoria: item.categoria,
        especificaciones: item.especificaciones,
        unidadMedida: item.unidad_medida,
        stockTotal: parseInt(item.stock_total, 10) || 0,
        stockMinimo: parseInt(item.stock_minimo, 10) || 0,
        ubicacion: item.ubicacion,
        proveedorPrincipal: item.proveedor_principal,
        precioCosto: parseFloat(item.precio_costo) || 0,
        precioVenta: parseFloat(item.precio_venta) || 0,
        foto: item.foto_url || null,
        reservas: (reservasPorItem[item.id] || []).map(reserva => ({
          id: reserva.id,
          protocolo: reserva.protocolo,
          cantidad: reserva.cantidad,
          fechaDesde: reserva.fecha_desde,
          fechaHasta: reserva.fecha_hasta,
          devuelto: reserva.devuelto
        }))
      }));

      setItems(transformados);
      if (selectedId) {
        const actualizado = transformados.find(i => i.id === selectedId) || null;
        setItemSeleccionado(actualizado);
      }
    } catch (error) {
      console.error('Error cargando inventario:', error);
      setItemsError('No se pudo cargar el inventario');
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    if (activeModule === 'inventario') {
      loadItems();
    }
  }, [activeModule]);

  if (activeModule !== 'inventario') return null;

  const calcularStockDisponible = (item, fecha = null) => {
    const reservasActivas = (item.reservas || []).filter(r => !r.devuelto);
    const stockReservado = reservasActivas.reduce((sum, r) => sum + r.cantidad, 0);
    return item.stockTotal - stockReservado;
  };

  const itemsFiltrados = items.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = (item.codigo || '').toLowerCase().includes(searchLower) ||
                       (item.nombre || '').toLowerCase().includes(searchLower) ||
                       (item.descripcion || '').toLowerCase().includes(searchLower);
    const matchCategoria = filterCategoria === 'todas' || item.categoria === filterCategoria;
    return matchSearch && matchCategoria;
  });

  const categorias = [...new Set(items.map(i => i.categoria).filter(Boolean))];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getNextCodigo = () => {
    const numeros = items
      .map(i => parseInt(String(i.codigo || '').replace(/\D/g, ''), 10))
      .filter(n => !isNaN(n));
    const maxNumero = numeros.length > 0 ? Math.max(...numeros) : 0;
    return `INV-${String(maxNumero + 1).padStart(3, '0')}`;
  };

  const stats = {
    totalItems: items.length,
    stockBajo: items.filter(i => calcularStockDisponible(i) <= i.stockMinimo).length,
    totalmenteReservados: items.filter(i => calcularStockDisponible(i) === 0).length,
    valorTotal: items.reduce((sum, i) => sum + (i.stockTotal * i.precioCosto), 0),
    reservasActivas: items.reduce((sum, i) => sum + i.reservas.filter(r => !r.devuelto).length, 0)
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Bodega / Inventario</h2>
          <p className="text-gray-600">Control de equipos y productos con sistema de reservas</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
        >
          <Package className="w-5 h-5" />
          <span>Nuevo Item</span>
        </button>
      </div>

      {itemsError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700">
          {itemsError}
        </div>
      )}

      {loadingItems && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow text-gray-600">
          Cargando inventario...
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-sm text-gray-500 mb-1">Total Items</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalItems}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 shadow">
          <p className="text-sm text-yellow-600 mb-1">Stock Bajo</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.stockBajo}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 shadow">
          <p className="text-sm text-red-600 mb-1">Sin Disponibilidad</p>
          <p className="text-2xl font-bold text-red-800">{stats.totalmenteReservados}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 shadow">
          <p className="text-sm text-blue-600 mb-1">Reservas Activas</p>
          <p className="text-2xl font-bold text-blue-800">{stats.reservasActivas}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 shadow">
          <p className="text-sm text-purple-600 mb-1">Valor Total</p>
          <p className="text-lg font-bold text-purple-800">{formatCurrency(stats.valorTotal)}</p>
        </div>
      </div>

      {/* Alertas */}
      {(stats.stockBajo > 0 || stats.totalmenteReservados > 0) && (
        <div className="mb-6 space-y-3">
          {stats.totalmenteReservados > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-center">
                <Package className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <p className="font-semibold text-red-800">
                    {stats.totalmenteReservados} items sin stock disponible
                  </p>
                  <p className="text-sm text-red-600">Todos los items están reservados para proyectos</p>
                </div>
              </div>
            </div>
          )}
          {stats.stockBajo > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-semibold text-yellow-800">
                    {stats.stockBajo} items con stock disponible bajo
                  </p>
                  <p className="text-sm text-yellow-600">Considera adquirir más unidades</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Búsqueda y Filtros */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por código, nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
            />
          </div>
          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98] bg-white"
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Listado de Items - Vista de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itemsFiltrados.map((item) => {
          const disponible = calcularStockDisponible(item);
          const porcentajeDisponible = (disponible / item.stockTotal) * 100;
          
          return (
            <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
              {/* Imagen */}
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {item.foto ? (
                  <img src={item.foto} alt={item.nombre} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-20 h-20 text-gray-400" />
                )}
              </div>

              {/* Contenido */}
              <div className="p-6">
                <div className="mb-3">
                  <span className="text-xs font-mono text-gray-500">{item.codigo}</span>
                  <h3 className="text-lg font-bold text-gray-800 mt-1">{item.nombre}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.descripcion}</p>
                </div>

                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                    {item.categoria}
                  </span>
                </div>

                {/* Stock */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">Stock Total:</span>
                    <span className="text-lg font-bold text-gray-800">{item.stockTotal} {item.unidadMedida}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">Disponible:</span>
                    <span className={`text-lg font-bold ${
                      disponible === 0 ? 'text-red-600' : 
                      disponible <= item.stockMinimo ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      {disponible} {item.unidadMedida}
                    </span>
                  </div>

                  {/* Barra de disponibilidad */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        porcentajeDisponible === 0 ? 'bg-red-500' :
                        porcentajeDisponible <= 40 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${porcentajeDisponible}%` }}
                    ></div>
                  </div>
                </div>

                {/* Reservas */}
                {item.reservas.filter(r => !r.devuelto).length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs font-semibold text-yellow-800 mb-1">
                      📅 {item.reservas.filter(r => !r.devuelto).length} Reservas Activas
                    </p>
                    {item.reservas.filter(r => !r.devuelto).slice(0, 2).map(r => (
                      <p key={r.id} className="text-xs text-yellow-700">
                        Prot. {r.protocolo}: {r.cantidad} und ({r.fechaDesde} - {r.fechaHasta})
                      </p>
                    ))}
                  </div>
                )}

                {/* Ubicación */}
                <div className="mb-4 text-sm text-gray-600">
                  <p>📍 {item.ubicacion}</p>
                </div>

                {/* Botón */}
                <button
                  onClick={() => {
                    setItemSeleccionado(item);
                    setShowFichaModal(true);
                  }}
                  className="w-full py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
                >
                  Ver Ficha Completa
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {itemsFiltrados.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No se encontraron items en el inventario</p>
        </div>
      )}

      {/* Modales */}
      {showNewModal && (
        <NuevoItemModal 
          onClose={() => setShowNewModal(false)}
          onSave={async (nuevoItem) => {
            try {
              const itemData = {
                codigo: getNextCodigo(),
                nombre: nuevoItem.nombre,
                descripcion: nuevoItem.descripcion,
                categoria: nuevoItem.categoria,
                especificaciones: nuevoItem.especificaciones,
                unidad_medida: nuevoItem.unidadMedida,
                stock_total: nuevoItem.stockTotal,
                stock_minimo: nuevoItem.stockMinimo,
                ubicacion: nuevoItem.ubicacion,
                proveedor_principal: nuevoItem.proveedorPrincipal,
                precio_costo: nuevoItem.precioCosto,
                precio_venta: nuevoItem.precioVenta,
                foto_url: nuevoItem.foto || null
              };

              await createInventarioItem(itemData);
              await loadItems();
              setShowNewModal(false);
            } catch (error) {
              console.error('Error creando item:', error);
              alert('Error al crear item en inventario');
            }
          }}
        />
      )}

      {showFichaModal && itemSeleccionado && (
        <FichaItemModal 
          item={itemSeleccionado}
          onClose={() => {
            setShowFichaModal(false);
            setItemSeleccionado(null);
          }}
          onCrearReserva={async (reserva) => {
            try {
              const reservaData = {
                item_id: itemSeleccionado.id,
                protocolo: reserva.protocolo,
                cantidad: reserva.cantidad,
                fecha_desde: reserva.fechaDesde,
                fecha_hasta: reserva.fechaHasta,
                devuelto: false
              };
              await createInventarioReserva(reservaData);
              await loadItems(itemSeleccionado.id);
            } catch (error) {
              console.error('Error creando reserva:', error);
              alert('Error al crear reserva');
            }
          }}
          onMarcarDevuelto={async (reservaId) => {
            try {
              await updateInventarioReserva(reservaId, { devuelto: true });
              await loadItems(itemSeleccionado.id);
            } catch (error) {
              console.error('Error actualizando reserva:', error);
              alert('Error al actualizar reserva');
            }
          }}
        />
      )}
    </div>
  );
};

// Modal Nuevo Item
const NuevoItemModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    especificaciones: '',
    unidadMedida: 'Unidad',
    stockTotal: 1,
    stockMinimo: 1,
    ubicacion: '',
    proveedorPrincipal: '',
    precioCosto: 0,
    precioVenta: 0,
    foto: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        <div className="p-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Nuevo Item de Inventario</h3>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                placeholder="Ej: TV Samsung 50 pulgadas"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción *</label>
              <textarea
                required
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                rows="2"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                placeholder="Descripción detallada del item"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría *</label>
              <input
                type="text"
                required
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                placeholder="Ej: Electrónica, Mobiliario"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Especificaciones</label>
              <input
                type="text"
                value={formData.especificaciones}
                onChange={(e) => setFormData({...formData, especificaciones: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                placeholder="Ej: 50 pulgadas, 4K, Smart TV"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Unidad de Medida *</label>
              <select
                required
                value={formData.unidadMedida}
                onChange={(e) => setFormData({...formData, unidadMedida: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98] bg-white"
              >
                <option value="Unidad">Unidad</option>
                <option value="Metro">Metro</option>
                <option value="Metro Cuadrado">Metro Cuadrado</option>
                <option value="Kilogramo">Kilogramo</option>
                <option value="Caja">Caja</option>
                <option value="Paquete">Paquete</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Total *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stockTotal}
                onChange={(e) => setFormData({...formData, stockTotal: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Mínimo *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stockMinimo}
                onChange={(e) => setFormData({...formData, stockMinimo: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ubicación en Bodega *</label>
              <input
                type="text"
                required
                value={formData.ubicacion}
                onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                placeholder="Ej: Bodega A - Estante 3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Proveedor Principal</label>
              <input
                type="text"
                value={formData.proveedorPrincipal}
                onChange={(e) => setFormData({...formData, proveedorPrincipal: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Costo</label>
              <input
                type="number"
                min="0"
                value={formData.precioCosto}
                onChange={(e) => setFormData({...formData, precioCosto: parseFloat(e.target.value) || 0})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Venta</label>
              <input
                type="number"
                min="0"
                value={formData.precioVenta}
                onChange={(e) => setFormData({...formData, precioVenta: parseFloat(e.target.value) || 0})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Foto del Producto</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({...formData, foto: reader.result});
                    };
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              />
              <p className="text-xs text-gray-500 mt-1">Sube una imagen del producto (opcional)</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
            >
              Crear Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Ficha Completa del Item
const FichaItemModal = ({ item: itemInicial, onClose, onCrearReserva, onMarcarDevuelto }) => {
  const [item, setItem] = useState({ ...itemInicial, reservas: itemInicial.reservas || [] });
  const [showReservaModal, setShowReservaModal] = useState(false);

  useEffect(() => {
    setItem({ ...itemInicial, reservas: itemInicial.reservas || [] });
  }, [itemInicial]);

  const calcularStockDisponible = () => {
    const reservasActivas = (item.reservas || []).filter(r => !r.devuelto);
    const stockReservado = reservasActivas.reduce((sum, r) => sum + r.cantidad, 0);
    return item.stockTotal - stockReservado;
  };

  const marcarDevuelto = (reservaId) => {
    const actualizado = {
      ...item,
      reservas: item.reservas.map(r => r.id === reservaId ? {...r, devuelto: true} : r)
    };
    setItem(actualizado);
    if (onMarcarDevuelto) {
      onMarcarDevuelto(reservaId);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const disponible = calcularStockDisponible();
  const reservas = item.reservas || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8">
        <div className="p-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">{item.nombre}</h3>
              <p className="text-white/80 text-sm">Código: {item.codigo}</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <XCircle className="w-8 h-8" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Columna 1: Foto e Info Básica */}
            <div>
              <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-4">
                {item.foto ? (
                  <img src={item.foto} alt={item.nombre} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Package className="w-24 h-24 text-gray-400" />
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Categoría</p>
                  <p className="font-semibold text-gray-800">{item.categoria}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Especificaciones</p>
                  <p className="font-semibold text-gray-800">{item.especificaciones || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ubicación</p>
                  <p className="font-semibold text-gray-800">📍 {item.ubicacion}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Proveedor Principal</p>
                  <p className="font-semibold text-gray-800">{item.proveedorPrincipal || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Precio Costo</p>
                  <p className="font-semibold text-gray-800">{formatCurrency(item.precioCosto)}</p>
                </div>
              </div>
            </div>

            {/* Columna 2 y 3: Stock y Reservas */}
            <div className="md:col-span-2">
              {/* Stock */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h4 className="font-bold text-gray-800 mb-4">Estado de Stock</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Stock Total</p>
                    <p className="text-2xl font-bold text-gray-800">{item.stockTotal}</p>
                    <p className="text-xs text-gray-500">{item.unidadMedida}</p>
                  </div>
                  <div className={`bg-white p-4 rounded-lg border-2 ${
                    disponible === 0 ? 'border-red-500' :
                    disponible <= item.stockMinimo ? 'border-yellow-500' :
                    'border-green-500'
                  }`}>
                    <p className="text-xs text-gray-500 mb-1">Disponible</p>
                    <p className={`text-2xl font-bold ${
                      disponible === 0 ? 'text-red-600' :
                      disponible <= item.stockMinimo ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>{disponible}</p>
                    <p className="text-xs text-gray-500">{item.unidadMedida}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Stock Mínimo</p>
                    <p className="text-2xl font-bold text-gray-800">{item.stockMinimo}</p>
                    <p className="text-xs text-gray-500">{item.unidadMedida}</p>
                  </div>
                </div>
              </div>

              {/* Reservas */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-800">Calendario de Reservas</h4>
                  <button
                    onClick={() => setShowReservaModal(true)}
                    className="px-4 py-2 bg-[#45ad98] text-white rounded-lg font-semibold hover:bg-[#235250] transition-colors text-sm"
                  >
                    + Nueva Reserva
                  </button>
                </div>

                {reservas.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left">Protocolo</th>
                          <th className="px-3 py-2 text-left">Cantidad</th>
                          <th className="px-3 py-2 text-left">Desde</th>
                          <th className="px-3 py-2 text-left">Hasta</th>
                          <th className="px-3 py-2 text-left">Estado</th>
                          <th className="px-3 py-2 text-left">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reservas.map((reserva) => (
                          <tr key={reserva.id} className={reserva.devuelto ? 'opacity-50' : ''}>
                            <td className="px-3 py-3 font-mono">{reserva.protocolo}</td>
                            <td className="px-3 py-3 font-semibold">{reserva.cantidad}</td>
                            <td className="px-3 py-3">{reserva.fechaDesde}</td>
                            <td className="px-3 py-3">{reserva.fechaHasta}</td>
                            <td className="px-3 py-3">
                              {reserva.devuelto ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                                  Devuelto
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                                  En uso
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              {!reserva.devuelto && (
                                <button
                                  onClick={() => marcarDevuelto(reserva.id)}
                                  className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600"
                                >
                                  Devolver
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Sin reservas activas</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
          >
            Cerrar Ficha
          </button>
        </div>

        {showReservaModal && (
          <ReservaModal 
            item={item}
            onClose={() => setShowReservaModal(false)}
            onSave={(reserva) => {
              const actualizado = {
                ...item,
                reservas: [...item.reservas, {...reserva, id: item.reservas.length + 1, devuelto: false}]
              };
              setItem(actualizado);
              if (onCrearReserva) {
                onCrearReserva(reserva);
              }
              setShowReservaModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Modal Nueva Reserva
const ReservaModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    protocolo: '',
    cantidad: 1,
    fechaDesde: '',
    fechaHasta: ''
  });

  const calcularDisponible = () => {
    const reservasActivas = (item.reservas || []).filter(r => !r.devuelto);
    const stockReservado = reservasActivas.reduce((sum, r) => sum + r.cantidad, 0);
    return item.stockTotal - stockReservado;
  };

  const disponible = calcularDisponible();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b">
          <h4 className="text-xl font-bold text-gray-800">Nueva Reserva</h4>
          <p className="text-sm text-gray-600 mt-1">Stock disponible: {disponible} {item.unidadMedida}</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Protocolo *</label>
            <input
              type="text"
              value={formData.protocolo}
              onChange={(e) => setFormData({...formData, protocolo: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              placeholder="Ej: 30650"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad *</label>
            <input
              type="number"
              min="1"
              max={disponible}
              value={formData.cantidad}
              onChange={(e) => setFormData({...formData, cantidad: parseInt(e.target.value) || 1})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Desde *</label>
            <input
              type="date"
              value={formData.fechaDesde}
              onChange={(e) => setFormData({...formData, fechaDesde: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Hasta *</label>
            <input
              type="date"
              value={formData.fechaHasta}
              onChange={(e) => setFormData({...formData, fechaHasta: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
            />
          </div>
        </div>
        <div className="p-6 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-[#45ad98] text-white rounded-lg font-semibold"
            disabled={!formData.protocolo || !formData.fechaDesde || !formData.fechaHasta || formData.cantidad > disponible}
          >
            Crear Reserva
          </button>
        </div>
      </div>
    </div>
  );
};

// Placeholder para Administración
const AdministracionModule = () => {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Administración</h2>
        <p className="text-gray-600">Configuración del sistema y usuarios</p>
      </div>
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <p className="text-gray-500 text-center">Módulo en desarrollo...</p>
      </div>
    </div>
  );
};

// Módulo de Informes
const InformesModule = ({ activeModule }) => {
  if (activeModule !== 'informes') return null;

  const [vistaActual, setVistaActual] = useState('dashboard');

  // Datos de ejemplo - en producción vendrían de la base de datos
  const ordenesCompra = [
    { id: 1, numero: 'OC-17403', protocolo: '30650', proveedor: 'ACERBEN SPA', tipoCosto: 'Taller/Fabricación', unidadNegocio: 'Stand y Ferias', total: 2975000, fecha: '2025-01-22', estado: 'Pagada' },
    { id: 2, numero: 'OC-17404', protocolo: '30650', proveedor: 'Transportes Rápidos', tipoCosto: '🚚 Transporte', unidadNegocio: 'Stand y Ferias', total: 450000, fecha: '2025-01-23', estado: 'Pagada' },
    { id: 3, numero: 'OC-17405', protocolo: '30651', proveedor: 'Imprenta Digital', tipoCosto: 'Imprenta/Impresión', unidadNegocio: 'Vía Pública', total: 1800000, fecha: '2025-01-24', estado: 'Facturada' },
    { id: 4, numero: 'OC-17406', protocolo: '30651', proveedor: 'Soportes Chile', tipoCosto: 'Arriendo Soporte', unidadNegocio: 'Vía Pública', total: 2500000, fecha: '2025-01-25', estado: 'Emitida' },
    { id: 5, numero: 'OC-17407', protocolo: '30652', proveedor: 'FleteXpress', tipoCosto: '🚚 Transporte', unidadNegocio: 'Inmobiliarias', total: 350000, fecha: '2025-01-26', estado: 'Recibida' },
    { id: 6, numero: 'OC-17408', protocolo: '', proveedor: 'Petrobras', tipoCosto: '💰 Rendiciones', unidadNegocio: 'Varios', total: 180000, fecha: '2025-01-27', estado: 'Pagada' }
  ];

  const protocolos = [
    { folio: '30650', cliente: 'Constructora ABC', unidadNegocio: 'Stand y Ferias', montoVenta: 5000000 },
    { folio: '30651', cliente: 'Inmobiliaria XYZ', unidadNegocio: 'Vía Pública', montoVenta: 7500000 },
    { folio: '30652', cliente: 'Mall Plaza', unidadNegocio: 'Inmobiliarias', montoVenta: 3200000 }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Análisis por Tipo de Costo
  const gastoPorTipo = () => {
    const tipos = {};
    ordenesCompra.forEach(oc => {
      const tipo = oc.tipoCosto || 'Sin asignar';
      if (!tipos[tipo]) {
        tipos[tipo] = { total: 0, cantidad: 0 };
      }
      tipos[tipo].total += oc.total;
      tipos[tipo].cantidad += 1;
    });
    return Object.entries(tipos)
      .map(([tipo, data]) => ({ tipo, ...data }))
      .sort((a, b) => b.total - a.total);
  };

  // Análisis por Unidad de Negocio
  const gastoPorUN = () => {
    const unidades = {};
    ordenesCompra.forEach(oc => {
      const un = oc.unidadNegocio || 'Sin asignar';
      if (!unidades[un]) {
        unidades[un] = { total: 0, cantidad: 0 };
      }
      unidades[un].total += oc.total;
      unidades[un].cantidad += 1;
    });
    return Object.entries(unidades)
      .map(([unidad, data]) => ({ unidad, ...data }))
      .sort((a, b) => b.total - a.total);
  };

  // Análisis de Márgenes por Proyecto
  const margenPorProyecto = () => {
    return protocolos.map(prot => {
      const costosProyecto = ordenesCompra
        .filter(oc => oc.protocolo === prot.folio)
        .reduce((sum, oc) => sum + oc.total, 0);
      
      const margen = prot.montoVenta - costosProyecto;
      const porcentajeMargen = prot.montoVenta > 0 ? (margen / prot.montoVenta) * 100 : 0;
      
      return {
        ...prot,
        costos: costosProyecto,
        margen,
        porcentajeMargen
      };
    }).sort((a, b) => b.margen - a.margen);
  };

  const tiposCosto = gastoPorTipo();
  const unidadesNegocio = gastoPorUN();
  const margenes = margenPorProyecto();
  const totalGastos = ordenesCompra.reduce((sum, oc) => sum + oc.total, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Informes y Análisis de Costos</h2>
        <p className="text-gray-600">Control financiero y análisis de rentabilidad</p>
      </div>

      {/* Navegación de Vistas */}
      <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setVistaActual('dashboard')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              vistaActual === 'dashboard' 
                ? 'bg-gradient-to-r from-[#235250] to-[#45ad98] text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Dashboard General
          </button>
          <button
            onClick={() => setVistaActual('tipo-costo')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              vistaActual === 'tipo-costo' 
                ? 'bg-gradient-to-r from-[#235250] to-[#45ad98] text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💰 Por Tipo de Costo
          </button>
          <button
            onClick={() => setVistaActual('margenes')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              vistaActual === 'margenes' 
                ? 'bg-gradient-to-r from-[#235250] to-[#45ad98] text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📈 Márgenes por Proyecto
          </button>
          <button
            onClick={() => setVistaActual('unidad-negocio')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              vistaActual === 'unidad-negocio' 
                ? 'bg-gradient-to-r from-[#235250] to-[#45ad98] text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🏢 Por Unidad de Negocio
          </button>
        </div>
      </div>

      {/* Dashboard General */}
      {vistaActual === 'dashboard' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <p className="text-sm text-gray-500 mb-2">Total Gastos (Mes)</p>
              <p className="text-3xl font-bold" style={{ color: '#235250' }}>{formatCurrency(totalGastos)}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <p className="text-sm text-gray-500 mb-2">Total OC</p>
              <p className="text-3xl font-bold text-gray-800">{ordenesCompra.length}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <p className="text-sm text-gray-500 mb-2">Proyectos Activos</p>
              <p className="text-3xl font-bold text-gray-800">{protocolos.length}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <p className="text-sm text-gray-500 mb-2">Margen Promedio</p>
              <p className="text-3xl font-bold text-green-600">
                {margenes.length > 0 
                  ? Math.round(margenes.reduce((sum, m) => sum + m.porcentajeMargen, 0) / margenes.length) 
                  : 0}%
              </p>
            </div>
          </div>

          {/* Top Tipos de Costo */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Top 5 - Tipos de Costo con Mayor Gasto</h3>
            <div className="space-y-3">
              {tiposCosto.slice(0, 5).map((tipo, index) => {
                const porcentaje = (tipo.total / totalGastos) * 100;
                return (
                  <div key={tipo.tipo}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-gray-700">{tipo.tipo}</span>
                      <span className="text-gray-600">{formatCurrency(tipo.total)} ({tipo.cantidad} OC)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all"
                        style={{ 
                          width: `${porcentaje}%`,
                          background: `linear-gradient(90deg, ${
                            index === 0 ? '#235250' :
                            index === 1 ? '#45ad98' :
                            index === 2 ? '#33b4e9' :
                            index === 3 ? '#f59e0b' :
                            '#8b5cf6'
                          } 0%, ${
                            index === 0 ? '#45ad98' :
                            index === 1 ? '#33b4e9' :
                            index === 2 ? '#45ad98' :
                            index === 3 ? '#fbbf24' :
                            '#a78bfa'
                          } 100%)`
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Proyectos con Mejor Margen */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Proyectos por Rentabilidad</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Protocolo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Cliente</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Venta</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Costos</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Margen</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {margenes.map(m => (
                    <tr key={m.folio} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-bold">{m.folio}</td>
                      <td className="px-4 py-3">{m.cliente}</td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(m.montoVenta)}</td>
                      <td className="px-4 py-3 text-red-600">{formatCurrency(m.costos)}</td>
                      <td className="px-4 py-3 font-bold text-green-600">{formatCurrency(m.margen)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          m.porcentajeMargen >= 50 ? 'bg-green-100 text-green-800' :
                          m.porcentajeMargen >= 30 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {Math.round(m.porcentajeMargen)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Vista Tipo de Costo */}
      {vistaActual === 'tipo-costo' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Análisis Detallado por Tipo de Costo</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: '#45ad98' }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Tipo de Costo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Cantidad OC</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Total Gastado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Promedio OC</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">% del Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tiposCosto.map(tipo => {
                    const promedio = tipo.total / tipo.cantidad;
                    const porcentaje = (tipo.total / totalGastos) * 100;
                    return (
                      <tr key={tipo.tipo} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-800">{tipo.tipo}</td>
                        <td className="px-6 py-4">{tipo.cantidad}</td>
                        <td className="px-6 py-4 font-bold" style={{ color: '#235250' }}>{formatCurrency(tipo.total)}</td>
                        <td className="px-6 py-4 text-gray-600">{formatCurrency(promedio)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-gradient-to-r from-[#235250] to-[#45ad98]"
                                style={{ width: `${porcentaje}%` }}
                              ></div>
                            </div>
                            <span className="font-semibold text-gray-700">{Math.round(porcentaje)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Vista Márgenes */}
      {vistaActual === 'margenes' && (
        <div className="space-y-6">
          {margenes.map(m => {
            const ocProyecto = ordenesCompra.filter(oc => oc.protocolo === m.folio);
            return (
              <div key={m.folio} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Protocolo {m.folio}</h3>
                    <p className="text-gray-600">{m.cliente} - {m.unidadNegocio}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Margen</p>
                    <p className={`text-3xl font-bold ${
                      m.porcentajeMargen >= 50 ? 'text-green-600' :
                      m.porcentajeMargen >= 30 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {Math.round(m.porcentajeMargen)}%
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 mb-1">Venta</p>
                    <p className="text-xl font-bold text-blue-800">{formatCurrency(m.montoVenta)}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-600 mb-1">Costos</p>
                    <p className="text-xl font-bold text-red-800">{formatCurrency(m.costos)}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 mb-1">Margen</p>
                    <p className="text-xl font-bold text-green-800">{formatCurrency(m.margen)}</p>
                  </div>
                </div>

                <h4 className="font-semibold text-gray-800 mb-3">Desglose de Costos:</h4>
                <div className="space-y-2">
                  {ocProyecto.map(oc => (
                    <div key={oc.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <span className="font-mono text-sm text-gray-500">{oc.numero}</span>
                        <span className="mx-2">•</span>
                        <span className="font-semibold">{oc.tipoCosto}</span>
                        <span className="mx-2">•</span>
                        <span className="text-gray-600">{oc.proveedor}</span>
                      </div>
                      <span className="font-semibold text-gray-800">{formatCurrency(oc.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vista Unidad de Negocio */}
      {vistaActual === 'unidad-negocio' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Gastos por Unidad de Negocio</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: '#45ad98' }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Unidad de Negocio</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Cantidad OC</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Total Gastado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">% del Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {unidadesNegocio.map(un => {
                    const porcentaje = (un.total / totalGastos) * 100;
                    return (
                      <tr key={un.unidad} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-800">{un.unidad}</td>
                        <td className="px-6 py-4">{un.cantidad}</td>
                        <td className="px-6 py-4 font-bold" style={{ color: '#235250' }}>{formatCurrency(un.total)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-gradient-to-r from-[#235250] to-[#45ad98]"
                                style={{ width: `${porcentaje}%` }}
                              ></div>
                            </div>
                            <span className="font-semibold text-gray-700">{Math.round(porcentaje)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal Buscar Protocolo
const ModalBuscarProtocolo = ({ onClose, onSeleccionar, sharedProtocolos }) => {
  const [codigoProtocolo, setCodigoProtocolo] = useState('');
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Buscar Protocolo</h3>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Código del Protocolo
          </label>
          <input
            type="text"
            value={codigoProtocolo}
            onChange={(e) => setCodigoProtocolo(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98] font-mono text-lg"
            placeholder="Ej: 30650"
            autoFocus
          />
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                const codigoNormalizado = codigoProtocolo.trim();
                const protocolo = sharedProtocolos.find(p => String(p.folio) === codigoNormalizado);
                if (protocolo) {
                  onSeleccionar(protocolo);
                } else {
                  alert('Protocolo no encontrado. Verifica el código.');
                }
              }}
              disabled={!codigoProtocolo}
              className="px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
            >
              Buscar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Módulo de Órdenes de Compra
const OrdenesCompraModule = ({ 
  user,
  sharedOrdenesCompra = [],
  setSharedOrdenesCompra = () => {},
  sharedProtocolos = [],
  datosPreOC,
  onOCCreada,
  onCancelarPreOC
}) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [detalleEditMode, setDetalleEditMode] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [showBuscarProtocolo, setShowBuscarProtocolo] = useState(false);
  const [datosOCDesdeProtocolo, setDatosOCDesdeProtocolo] = useState(null);
  
  // Abrir modal automáticamente si hay datosPreOC
  useEffect(() => {
    if (datosPreOC) {
      setDatosOCDesdeProtocolo(datosPreOC);
    }
  }, [datosPreOC]);
  
  // Cargar órdenes desde Supabase
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrdenes();
  }, []);

  const loadOrdenes = async () => {
    try {
      setLoading(true);
      const data = await getOrdenesCompra();

      const transformados = data.map(o => ({
        id: o.id,
        numero: o.numero,
        codigoProtocolo: o.codigo_protocolo,
        fecha: o.fecha,
        proveedorId: o.proveedor_id || null,
        proveedor: o.proveedores?.razon_social || 'Sin proveedor',
        rutProveedor: o.proveedores?.rut || '',
        tipoCosto: o.tipo_costo,
        formaPago: o.forma_pago,
        subtotal: parseFloat(o.subtotal) || 0,
        iva: parseFloat(o.iva) || 0,
        total: parseFloat(o.total) || 0,
        estado: o.estado,
        numeroFactura: o.numero_factura || '',
        fechaFactura: o.fecha_factura || '',
        estadoPago: o.estado_pago || 'Pendiente',
        items: (o.ordenes_compra_items || []).map(item => ({
          id: item.id,
          item: item.item || '',
          cantidad: item.cantidad,
          descripcion: item.descripcion,
          valorUnitario: parseFloat(item.valor_unitario) || 0,
          valor_unitario: parseFloat(item.valor_unitario) || 0,
          descuento: parseFloat(item.descuento || 0)
        }))
      }));

      setOrdenes(transformados);
    } catch (error) {
      console.error('Error:', error);
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  };
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');

  const ordenesFiltradas = ordenes.filter(orden => {
    const matchSearch = orden.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       orden.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       orden.codigoProtocolo.includes(searchTerm);
    const matchEstado = filterEstado === 'todos' || orden.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'Emitida': return 'bg-yellow-100 text-yellow-800';
      case 'Recibida': return 'bg-blue-100 text-blue-800';
      case 'Facturada': return 'bg-green-100 text-green-800';
      case 'Pagada': return 'bg-green-500 text-white';
      case 'Anulada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const stats = {
    total: ordenes.length,
    emitidas: ordenes.filter(o => o.estado === 'Emitida').length,
    recibidas: ordenes.filter(o => o.estado === 'Recibida').length,
    pagadas: ordenes.filter(o => o.estado === 'Pagada').length,
    montoTotal: ordenes.reduce((sum, o) => sum + o.total, 0),
    sinFactura: ordenes.filter(o => !o.numeroFactura && o.estado !== 'Anulada').length,
    pendientesPago: ordenes.filter(o => o.estadoPago === 'Pendiente' && o.estado !== 'Anulada').length
  };

  const cambiarEstado = (id, nuevoEstado) => {
    setOrdenes(prev => prev.map(o => 
      o.id === id ? { ...o, estado: nuevoEstado } : o
    ));
  };

  const marcarComoPagada = (id) => {
    setOrdenes(prev => prev.map(o => 
      o.id === id ? { ...o, estadoPago: 'Pagada', estado: 'Pagada' } : o
    ));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Órdenes de Compra</h2>
          <p className="text-gray-600">Gestión de órdenes de compra a proveedores</p>
        </div>
        <div className="flex space-x-3">
          {user.role === 'admin' && (
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl border-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              style={{ borderColor: '#45ad98', color: '#45ad98' }}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>OC Manual</span>
            </button>
          )}
          <button
            onClick={() => setShowBuscarProtocolo(true)}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
          >
            <Package className="w-5 h-5" />
            <span>Desde Protocolo</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-sm text-gray-500 mb-1">Total OC</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 shadow">
          <p className="text-sm text-yellow-600 mb-1">Emitidas</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.emitidas}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 shadow">
          <p className="text-sm text-blue-600 mb-1">Recibidas</p>
          <p className="text-2xl font-bold text-blue-800">{stats.recibidas}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow">
          <p className="text-sm text-green-600 mb-1">Pagadas</p>
          <p className="text-2xl font-bold text-green-800">{stats.pagadas}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 shadow">
          <p className="text-sm text-purple-600 mb-1">Monto Total</p>
          <p className="text-lg font-bold text-purple-800">{formatCurrency(stats.montoTotal)}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 shadow">
          <p className="text-sm text-red-600 mb-1">Sin Factura</p>
          <p className="text-2xl font-bold text-red-800">{stats.sinFactura}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 shadow">
          <p className="text-sm text-orange-600 mb-1">Pend. Pago</p>
          <p className="text-2xl font-bold text-orange-800">{stats.pendientesPago}</p>
        </div>
      </div>

      {/* Alertas */}
      {(stats.sinFactura > 0 || stats.pendientesPago > 0) && (
        <div className="mb-6 space-y-3">
          {stats.sinFactura > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <p className="font-semibold text-red-800">
                    {stats.sinFactura} OC sin número de factura asignado
                  </p>
                  <p className="text-sm text-red-600">Revisa y actualiza cuando recibas las facturas</p>
                </div>
              </div>
            </div>
          )}
          {stats.pendientesPago > 0 && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-orange-600 mr-3" />
                <div>
                  <p className="font-semibold text-orange-800">
                    {stats.pendientesPago} OC con pago pendiente
                  </p>
                  <p className="text-sm text-orange-600">Coordina con finanzas para realizar los pagos</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Búsqueda y Filtros */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por número OC, proveedor o protocolo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
            />
          </div>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98] bg-white"
          >
            <option value="todos">Todos los estados</option>
            <option value="Emitida">Emitida</option>
            <option value="Recibida">Recibida</option>
            <option value="Facturada">Facturada</option>
            <option value="Pagada">Pagada</option>
            <option value="Anulada">Anulada</option>
          </select>
        </div>
      </div>

      {/* Listado de OC */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#45ad98' }}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">N° OC</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Protocolo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Fecha</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Nombre Producto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Proveedor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Tipo Costo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Monto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Factura</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ordenesFiltradas.map((orden) => (
                <tr key={orden.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-lg" style={{ color: '#235250' }}>{orden.numero}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-gray-600">{orden.codigoProtocolo}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{orden.fecha}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-700 truncate max-w-xs" title={orden.items && orden.items.length > 0 ? orden.items[0].descripcion : 'Sin items'}>
                      {orden.items && orden.items.length > 0 ? orden.items[0].descripcion : 'Sin items'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800">{orden.proveedor}</p>
                      <p className="text-sm text-gray-500">Cód: {orden.codigoProveedor}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-semibold">
                      {orden.tipoCosto || 'Sin asignar'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{formatCurrency(orden.total)}</td>
                  <td className="px-6 py-4">
                    {orden.numeroFactura ? (
                      <div>
                        <p className="font-medium text-green-600">{orden.numeroFactura}</p>
                        <p className="text-xs text-gray-500">{orden.fechaFactura}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin factura</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(orden.estado)}`}>
                      {orden.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setOrdenSeleccionada(orden);
                          setDetalleEditMode(false);
                          setShowDetalleModal(true);
                        }}
                        className="px-4 py-2 bg-[#45ad98] text-white rounded-lg hover:bg-[#235250] transition-colors font-semibold text-sm"
                      >
                        Ver Detalle
                      </button>
                      <button
                        onClick={() => {
                          setOrdenSeleccionada(orden);
                          setDetalleEditMode(true);
                          setShowDetalleModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ordenesFiltradas.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No se encontraron órdenes de compra</p>
          </div>
        )}
      </div>

      {/* Modales */}
      {showNewModal && (
        <NuevaOCModal 
          onClose={() => setShowNewModal(false)}
          onSave={async (nuevaOC) => {
            try {
              // Generar número de OC
              const ordenesExistentes = await getOrdenesCompra();
              const ultimoNumero = ordenesExistentes.length > 0
                ? Math.max(...ordenesExistentes.map(o => {
                    const num = parseInt(o.numero.replace('OC-', ''));
                    return isNaN(num) ? 17403 : num;
                  }))
                : 17402;

              const ocData = {
                numero: `OC-${ultimoNumero + 1}`,
                codigo_protocolo: nuevaOC.codigoProtocolo || '',
                fecha: new Date().toISOString().split('T')[0],
                proveedor_id: null,
                tipo_costo: nuevaOC.tipoCosto,
                forma_pago: nuevaOC.formaPago,
                subtotal: parseFloat(nuevaOC.subtotal) || 0,
                iva: parseFloat(nuevaOC.iva) || 0,
                total: parseFloat(nuevaOC.total) || 0,
                estado: 'Emitida',
                numero_factura: '',
                fecha_factura: null,
                estado_pago: 'Pendiente'
              };

              await createOrdenCompra(ocData, nuevaOC.items || []);
              await loadOrdenes();

              setShowNewModal(false);
              alert('Orden de Compra creada exitosamente');
            } catch (error) {
              console.error('Error:', error);
              alert('Error al crear OC');
            }
          }}
        />
      )}

      {showDetalleModal && ordenSeleccionada && (
        <DetalleOCModal 
          orden={ordenSeleccionada}
          startInEdit={detalleEditMode}
          onClose={() => {
            setShowDetalleModal(false);
            setOrdenSeleccionada(null);
          }}
          onUpdate={(ordenActualizada) => {
            setOrdenes(prev => prev.map(o => 
              o.id === ordenActualizada.id ? ordenActualizada : o
            ));
          }}
          onSave={async (ordenActualizada) => {
            try {
              const subtotal = ordenActualizada.items.reduce((sum, item) => {
                const itemSubtotal = item.cantidad * item.valorUnitario;
                const itemDescuento = itemSubtotal * (item.descuento / 100);
                return sum + (itemSubtotal - itemDescuento);
              }, 0);
              const iva = subtotal * 0.19;
              const total = subtotal + iva;

              await updateOrdenCompra(ordenActualizada.id, {
                proveedor_id: ordenActualizada.proveedorId || null,
                codigo_protocolo: ordenActualizada.codigoProtocolo || '',
                tipo_costo: ordenActualizada.tipoCosto || '',
                forma_pago: ordenActualizada.formaPago || '',
                subtotal,
                iva,
                total,
                estado: ordenActualizada.estado,
                numero_factura: ordenActualizada.numeroFactura || '',
                fecha_factura: ordenActualizada.fechaFactura || null,
                estado_pago: ordenActualizada.estadoPago || 'Pendiente'
              });

              await replaceOrdenCompraItems(ordenActualizada.id, ordenActualizada.items || []);
              await loadOrdenes();

              setShowDetalleModal(false);
              setOrdenSeleccionada(null);
              alert('OC actualizada exitosamente');
            } catch (error) {
              console.error('Error actualizando OC:', error);
              alert('Error al actualizar OC');
            }
          }}
        />
      )}
      
      {/* Modal Buscar Protocolo */}
      {showBuscarProtocolo && (
        <ModalBuscarProtocolo
          sharedProtocolos={sharedProtocolos}
          onClose={() => setShowBuscarProtocolo(false)}
          onSeleccionar={(protocolo) => {
            setDatosOCDesdeProtocolo({
              codigoProtocolo: protocolo.folio,
              fechaProtocolo: protocolo.fechaCreacion || new Date().toISOString().split('T')[0],
              unidadNegocio: protocolo.unidadNegocio,
              items: protocolo.items || []
            });
            setShowBuscarProtocolo(false);
          }}
        />
      )}

      {datosOCDesdeProtocolo && (
        <FormularioOCDesdeProtocolo
          datosProtocolo={datosOCDesdeProtocolo}
          onClose={() => {
            setDatosOCDesdeProtocolo(null);
            if (onCancelarPreOC) {
              onCancelarPreOC();
            }
          }}
          onGuardar={async (nuevaOC) => {
            try {
              const ordenesExistentes = await getOrdenesCompra();
              const ultimoNumero = ordenesExistentes.length > 0
                ? Math.max(...ordenesExistentes.map(o => {
                    const num = parseInt(o.numero.replace('OC-', ''));
                    return isNaN(num) ? 17403 : num;
                  }))
                : 17402;

              const ocData = {
                numero: `OC-${ultimoNumero + 1}`,
                codigo_protocolo: datosOCDesdeProtocolo.codigoProtocolo,
                fecha: new Date().toISOString().split('T')[0],
                proveedor_id: null,
                tipo_costo: nuevaOC.tipoCosto,
                forma_pago: nuevaOC.formaPago,
                total: parseFloat(nuevaOC.total),
                estado: 'Emitida',
                numero_factura: '',
                fecha_factura: null,
                estado_pago: 'Pendiente'
              };

              await createOrdenCompra(ocData, nuevaOC.items || []);
              await loadOrdenes();

              setDatosOCDesdeProtocolo(null);
              if (onCancelarPreOC) {
                onCancelarPreOC();
              }
              alert('Orden de Compra creada exitosamente');
            } catch (error) {
              console.error('Error:', error);
              alert('Error al crear OC');
            }
          }}
        />
      )}
    </div>
  );
};

// Modal Nueva OC Manual
const NuevaOCModal = ({ onClose, onSave }) => {
  // Tipos de Costo - Lista completa Building Me
  const TIPOS_COSTO = [
    // Comunes (todas las UN)
    '🚚 Transporte',
    '🚁 Drone',
    '💰 Rendiciones',
    '💳 Financiamiento',
    '📦 Varios',
    '---', // Separador visual
    // Específicos por UN
    'Taller/Fabricación',
    'Imprenta/Impresión',
    'Instalación',
    'Desmontaje',
    'Arriendo Soporte',
    'Mobiliario (sillas, mesas)',
    'Equipamiento (pantallas, TV)',
    'Materiales',
    'Grabación Drone',
    'Transporte Visto Bueno',
    'Producción Externa',
    'Terminaciones',
    'Materiales POP',
    'Distribución/Logística',
    'Promotoras/RRHH',
    'Despacho',
    'Financiamiento'
  ];

  const [formData, setFormData] = useState({
    codigoProtocolo: '',
    fechaProtocolo: '',
    codigoProveedor: '',
    proveedor: '',
    rutProveedor: '',
    direccionProveedor: '',
    contactoProveedor: '',
    telefonoProveedor: '',
    cotizacionProveedor: '',
    formaPago: '',
    responsableCompra: '',
    tipoCosto: '',
    items: [
      { id: 1, item: '', cantidad: 1, descripcion: '', valorUnitario: 0, descuento: 0 }
    ],
    observaciones: ''
  });

  const [proveedores, setProveedores] = useState([]);
  const [proveedoresError, setProveedoresError] = useState('');

  useEffect(() => {
    const loadProveedores = async () => {
      try {
        setProveedoresError('');
        const data = await getProveedores();
        const transformados = data.map(p => ({
          id: p.id,
          codigo: p.codigo,
          nombre: p.razon_social,
          rut: p.rut,
          direccion: p.direccion,
          contacto: p.contacto,
          telefono: p.telefono
        }));
        setProveedores(transformados);
      } catch (error) {
        console.error('Error cargando proveedores:', error);
        setProveedoresError('No se pudieron cargar los proveedores');
      }
    };

    loadProveedores();
  }, []);

  const buscarProveedor = (codigo) => {
    const codigoNormalizado = codigo.trim();
    if (!codigoNormalizado) return;
    const prov = proveedores.find(p => String(p.codigo) === codigoNormalizado);
    if (prov) {
      setFormData(prev => ({
        ...prev,
        codigoProveedor: codigo,
        proveedor: prov.nombre,
        rutProveedor: prov.rut,
        direccionProveedor: prov.direccion,
        contactoProveedor: prov.contacto,
        telefonoProveedor: prov.telefono
      }));
    }
  };

  const agregarItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { 
        id: prev.items.length + 1, 
        item: '', 
        cantidad: 1, 
        descripcion: '', 
        valorUnitario: 0, 
        descuento: 0 
      }]
    }));
  };

  const eliminarItem = (id) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const actualizarItem = (id, campo, valor) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [campo]: valor } : item
      )
    }));
  };

  const calcularSubtotalItem = (item) => {
    const subtotal = item.cantidad * item.valorUnitario;
    const descuento = subtotal * (item.descuento / 100);
    return subtotal - descuento;
  };

  const calcularTotales = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + calcularSubtotalItem(item), 0);
    const iva = subtotal * 0.19;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { subtotal, iva, total } = calcularTotales();
    onSave({ ...formData, subtotal, iva, total });
  };

  const totales = calcularTotales();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8">
        <div className="p-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Nueva Orden de Compra (Manual)</h3>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Datos del Proveedor */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Datos del Proveedor</h4>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <label className="block text-sm font-semibold text-blue-800 mb-2">
                🔍 Código Proveedor (Autocompletar)
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={formData.codigoProveedor}
                  onChange={(e) => setFormData({...formData, codigoProveedor: e.target.value})}
                  onBlur={(e) => buscarProveedor(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 font-mono text-lg font-bold"
                  placeholder="Ej: 1000"
                />
                <button
                  type="button"
                  onClick={() => buscarProveedor(formData.codigoProveedor)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Buscar
                </button>
              </div>
              {proveedoresError && (
                <p className="text-xs text-red-600 mt-2">{proveedoresError}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Proveedor *</label>
                <input
                  type="text"
                  required
                  value={formData.proveedor}
                  onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">RUT *</label>
                <input
                  type="text"
                  required
                  value={formData.rutProveedor}
                  onChange={(e) => setFormData({...formData, rutProveedor: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contacto</label>
                <input
                  type="text"
                  value={formData.contactoProveedor}
                  onChange={(e) => setFormData({...formData, contactoProveedor: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                <input
                  type="text"
                  value={formData.telefonoProveedor}
                  onChange={(e) => setFormData({...formData, telefonoProveedor: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
            </div>
          </div>

          {/* Datos de la OC */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Datos de la Orden de Compra</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Código PR (Protocolo)</label>
                <input
                  type="text"
                  value={formData.codigoProtocolo}
                  onChange={(e) => setFormData({...formData, codigoProtocolo: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                  placeholder="Ej: 30650 (Opcional)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha PR</label>
                <input
                  type="date"
                  value={formData.fechaProtocolo}
                  onChange={(e) => setFormData({...formData, fechaProtocolo: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">N° Cotización Proveedor</label>
                <input
                  type="text"
                  value={formData.cotizacionProveedor}
                  onChange={(e) => setFormData({...formData, cotizacionProveedor: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                  placeholder="Ref. del proveedor"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Costo * 
                  <span className="text-xs text-gray-500 ml-2">📊 Para análisis de costos</span>
                </label>
                <select
                  required
                  value={formData.tipoCosto}
                  onChange={(e) => setFormData({...formData, tipoCosto: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98] bg-white font-semibold"
                >
                  <option value="">Seleccione tipo...</option>
                  {TIPOS_COSTO.map((tipo, index) => 
                    tipo === '---' ? (
                      <option key={index} disabled>──────────────</option>
                    ) : (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Forma de Pago *</label>
                <select
                  required
                  value={formData.formaPago}
                  onChange={(e) => setFormData({...formData, formaPago: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98] bg-white"
                >
                  <option value="">Seleccione...</option>
                  <option value="Contado Efectivo">Contado Efectivo</option>
                  <option value="30 días">30 días</option>
                  <option value="60 días">60 días</option>
                  <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                  <option value="Caja Chica">Caja Chica</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Responsable Compra *</label>
                <input
                  type="text"
                  required
                  value={formData.responsableCompra}
                  onChange={(e) => setFormData({...formData, responsableCompra: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Items</h4>
              <button
                type="button"
                onClick={agregarItem}
                className="px-4 py-2 bg-[#45ad98] text-white rounded-lg font-semibold hover:bg-[#235250] transition-colors"
              >
                + Agregar Item
              </button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Item</label>
                      <input
                        type="text"
                        value={item.item}
                        onChange={(e) => actualizarItem(item.id, 'item', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => actualizarItem(item.id, 'cantidad', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">V. Unitario</label>
                      <input
                        type="number"
                        min="0"
                        value={item.valorUnitario}
                        onChange={(e) => actualizarItem(item.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Descuento %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.descuento}
                        onChange={(e) => actualizarItem(item.id, 'descuento', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98]"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => eliminarItem(item.id)}
                        className="w-full px-3 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                    <div className="md:col-span-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                      <input
                        type="text"
                        value={item.descripcion}
                        onChange={(e) => actualizarItem(item.id, 'descripcion', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98]"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {formData.items.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No hay items. Agrega uno para continuar.
                </div>
              )}
            </div>
          </div>

          {/* Totales */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-semibold">Subtotal:</span>
              <span className="text-xl font-bold text-gray-800">
                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totales.subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-semibold">IVA 19%:</span>
              <span className="text-xl font-bold text-gray-800">
                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totales.iva)}
              </span>
            </div>
            <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
              <span className="text-gray-800 font-bold text-lg">TOTAL:</span>
              <span className="text-2xl font-bold" style={{ color: '#235250' }}>
                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totales.total)}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-sm font-semibold text-gray-700">Facturar a:</p>
              <p className="text-gray-800 font-medium">Maria Paula Ross EIRL</p>
              <p className="text-gray-600">76.226.767-5</p>
            </div>
          </div>

          {/* Observaciones */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Observaciones</label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
              rows="3"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
            >
              Crear Orden de Compra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Detalle OC
const DetalleOCModal = ({ orden: ordenInicial, onClose, onUpdate, onSave, startInEdit = false }) => {
  const [orden, setOrden] = useState(ordenInicial);
  const [showFacturaModal, setShowFacturaModal] = useState(false);
  const [isEditing, setIsEditing] = useState(startInEdit);
  const [proveedores, setProveedores] = useState([]);

  useEffect(() => {
    setOrden(ordenInicial);
    setIsEditing(startInEdit);
  }, [ordenInicial, startInEdit]);

  useEffect(() => {
    const loadProveedores = async () => {
      try {
        const data = await getProveedores();
        const transformados = data.map(p => ({
          id: p.id,
          razonSocial: p.razon_social,
          rut: p.rut
        }));
        setProveedores(transformados);
      } catch (error) {
        console.error('Error cargando proveedores:', error);
      }
    };
    loadProveedores();
  }, []);

  const cambiarEstado = (nuevoEstado) => {
    const estadoPago = nuevoEstado === 'Pagada' ? 'Pagada' : orden.estadoPago;
    const actualizada = { ...orden, estado: nuevoEstado, estadoPago };
    setOrden(actualizada);
    onUpdate(actualizada);
  };

  const agregarFactura = (numeroFactura, fechaFactura) => {
    const actualizada = {
      ...orden,
      numeroFactura,
      fechaFactura,
      estado: 'Facturada'
    };
    setOrden(actualizada);
    onUpdate(actualizada);
  };

  const marcarPagada = () => {
    const actualizada = { ...orden, estadoPago: 'Pagada', estado: 'Pagada' };
    setOrden(actualizada);
    onUpdate(actualizada);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const calcularSubtotalItem = (item) => {
    const subtotal = item.cantidad * item.valorUnitario;
    const descuento = subtotal * (item.descuento / 100);
    return subtotal - descuento;
  };

  const totales = orden.items.reduce((acc, item) => {
    const subtotalItem = calcularSubtotalItem(item);
    return {
      subtotal: acc.subtotal + subtotalItem,
      iva: acc.iva + subtotalItem * 0.19
    };
  }, { subtotal: 0, iva: 0 });
  const total = totales.subtotal + totales.iva;

  const agregarItem = () => {
    const nuevo = {
      id: Date.now(),
      item: '',
      cantidad: 1,
      descripcion: '',
      valorUnitario: 0,
      descuento: 0
    };
    const actualizada = { ...orden, items: [...orden.items, nuevo] };
    setOrden(actualizada);
    onUpdate(actualizada);
  };

  const eliminarItem = (id) => {
    const actualizada = { ...orden, items: orden.items.filter(i => i.id !== id) };
    setOrden(actualizada);
    onUpdate(actualizada);
  };

  const actualizarItem = (id, campo, valor) => {
    const actualizada = {
      ...orden,
      items: orden.items.map(item =>
        item.id === id ? { ...item, [campo]: valor } : item
      )
    };
    setOrden(actualizada);
    onUpdate(actualizada);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8">
        <div className="p-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">Orden de Compra {orden.numero}</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-white text-sm">
                <div>
                  <p className="text-white/70">Proveedor:</p>
                  {isEditing ? (
                    <select
                      value={orden.proveedorId || ''}
                      onChange={(e) => {
                        const proveedorId = e.target.value || null;
                        const proveedor = proveedores.find(p => String(p.id) === String(proveedorId));
                        const actualizada = {
                          ...orden,
                          proveedorId,
                          proveedor: proveedor ? proveedor.razonSocial : orden.proveedor
                        };
                        setOrden(actualizada);
                        onUpdate(actualizada);
                      }}
                      className="w-full px-2 py-1 rounded bg-white text-gray-800"
                    >
                      <option value="">Sin proveedor</option>
                      {proveedores.map(p => (
                        <option key={p.id} value={p.id}>{p.razonSocial}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="font-semibold">{orden.proveedor}</p>
                  )}
                </div>
                <div>
                  <p className="text-white/70">Protocolo:</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={orden.codigoProtocolo || ''}
                      onChange={(e) => {
                        const actualizada = { ...orden, codigoProtocolo: e.target.value };
                        setOrden(actualizada);
                        onUpdate(actualizada);
                      }}
                      className="w-full px-2 py-1 rounded bg-white text-gray-800"
                    />
                  ) : (
                    <p className="font-semibold">{orden.codigoProtocolo || 'Sin protocolo'}</p>
                  )}
                </div>
                <div>
                  <p className="text-white/70">Tipo de Costo:</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={orden.tipoCosto || ''}
                      onChange={(e) => {
                        const actualizada = { ...orden, tipoCosto: e.target.value };
                        setOrden(actualizada);
                        onUpdate(actualizada);
                      }}
                      className="w-full px-2 py-1 rounded bg-white text-gray-800"
                    />
                  ) : (
                    <p className="font-semibold">{orden.tipoCosto || 'Sin asignar'}</p>
                  )}
                </div>
                <div>
                  <p className="text-white/70">Fecha:</p>
                  <p className="font-semibold">{orden.fecha}</p>
                </div>
                <div>
                  <p className="text-white/70">Responsable:</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={orden.responsableCompra || ''}
                      onChange={(e) => {
                        const actualizada = { ...orden, responsableCompra: e.target.value };
                        setOrden(actualizada);
                        onUpdate(actualizada);
                      }}
                      className="w-full px-2 py-1 rounded bg-white text-gray-800"
                    />
                  ) : (
                    <p className="font-semibold">{orden.responsableCompra}</p>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <XCircle className="w-8 h-8" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsEditing(prev => !prev)}
              className="px-4 py-2 bg-white text-[#235250] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {isEditing ? 'Cancelar Edición' : 'Editar'}
            </button>
            <button
              onClick={() => setShowFacturaModal(true)}
              className="px-4 py-2 bg-white text-[#235250] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              disabled={orden.numeroFactura}
            >
              {orden.numeroFactura ? `Factura: ${orden.numeroFactura}` : 'Asignar Factura'}
            </button>
            {orden.numeroFactura && orden.estadoPago === 'Pendiente' && (
              <button
                onClick={marcarPagada}
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Marcar como Pagada
              </button>
            )}
            <select
              value={orden.estado}
              onChange={(e) => cambiarEstado(e.target.value)}
              className="px-4 py-2 bg-white text-[#235250] rounded-lg font-semibold hover:bg-gray-100"
              disabled={!isEditing}
            >
              <option value="Emitida">Emitida</option>
              <option value="Recibida">Recibida</option>
              <option value="Facturada">Facturada</option>
              <option value="Pagada">Pagada</option>
              <option value="Anulada">Anulada</option>
            </select>
            <button
              onClick={() => {
                const proveedor = {
                  razon_social: orden.proveedor,
                  rut: orden.rutProveedor || '',
                  direccion: orden.direccionProveedor || '',
                  contacto: orden.contactoProveedor || ''
                };
                const protocolo = {
                  folio: orden.codigoProtocolo || ''
                };
                generarOCPDF(orden, proveedor, protocolo, orden.items || []);
              }}
              className="px-4 py-2 bg-white text-[#235250] rounded-lg font-semibold hover:bg-gray-100"
            >
              Generar PDF
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Items */}
          <h4 className="text-lg font-bold text-gray-800 mb-4">Detalle de Items</h4>
          <div className="mb-6">
            {isEditing && (
              <div className="flex justify-end mb-3">
                <button
                  type="button"
                  onClick={agregarItem}
                  className="px-4 py-2 bg-[#45ad98] text-white rounded-lg font-semibold hover:bg-[#235250] transition-colors"
                >
                  + Agregar Item
                </button>
              </div>
            )}
            <div className="space-y-4">
              {orden.items.map((item, index) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Item</label>
                      <input
                        type="text"
                        value={item.item || ''}
                        onChange={(e) => actualizarItem(item.id, 'item', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98] disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => actualizarItem(item.id, 'cantidad', parseInt(e.target.value) || 1)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98] disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">V. Unitario</label>
                      <input
                        type="number"
                        min="0"
                        value={item.valorUnitario}
                        onChange={(e) => actualizarItem(item.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98] disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Descuento %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.descuento}
                        onChange={(e) => actualizarItem(item.id, 'descuento', parseFloat(e.target.value) || 0)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98] disabled:bg-gray-100"
                      />
                    </div>
                    {isEditing && (
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => eliminarItem(item.id)}
                          className="w-full px-3 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                    <div className="md:col-span-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                      <input
                        type="text"
                        value={item.descripcion}
                        onChange={(e) => actualizarItem(item.id, 'descripcion', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98] disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-sm font-semibold text-gray-700">
                      Subtotal: {formatCurrency(calcularSubtotalItem(item))}
                    </span>
                  </div>
                </div>
              ))}

              {orden.items.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No hay items. Agrega uno para continuar.
                </div>
              )}
            </div>
          </div>

          {/* Totales y Facturar a */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h5 className="font-semibold text-gray-800 mb-4">Totales</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold">{formatCurrency(totales.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA 19%:</span>
                  <span className="font-bold">{formatCurrency(totales.iva)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t-2 border-gray-300">
                  <span className="font-bold">TOTAL:</span>
                  <span className="font-bold text-xl" style={{ color: '#235250' }}>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <h5 className="font-semibold text-gray-800 mb-4">Facturar a:</h5>
              <p className="font-bold text-gray-800">Maria Paula Ross EIRL</p>
              <p className="text-gray-600">RUT: 76.226.767-5</p>
              <p className="text-gray-600 mt-2">La Capitanía 80, Las Condes</p>
              <p className="text-gray-600">Santiago - Chile</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          {isEditing && (
            <button
              onClick={() => onSave && onSave({ ...orden, subtotal: totales.subtotal, iva: totales.iva, total })}
              className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
            >
              Guardar Cambios
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
          >
            Cerrar
          </button>
        </div>

        {showFacturaModal && (
          <FacturaModal
            onClose={() => setShowFacturaModal(false)}
            onSave={(numeroFactura, fechaFactura) => {
              agregarFactura(numeroFactura, fechaFactura);
              setShowFacturaModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Modal Factura
const FacturaModal = ({ onClose, onSave }) => {
  const [numeroFactura, setNumeroFactura] = useState('');
  const [fechaFactura, setFechaFactura] = useState('');

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b">
          <h4 className="text-xl font-bold text-gray-800">Asignar Número de Factura</h4>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Factura *</label>
            <input
              type="text"
              value={numeroFactura}
              onChange={(e) => setNumeroFactura(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              placeholder="Ej: F-12345"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Factura *</label>
            <input
              type="date"
              value={fechaFactura}
              onChange={(e) => setFechaFactura(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
            />
          </div>
        </div>
        <div className="p-6 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(numeroFactura, fechaFactura)}
            className="px-4 py-2 bg-[#45ad98] text-white rounded-lg font-semibold"
            disabled={!numeroFactura || !fechaFactura}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente de Módulo de Proveedores
const ProveedoresModule = () => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [showEstadoCuentaModal, setShowEstadoCuentaModal] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar proveedores desde Supabase
  useEffect(() => {
    loadProveedores();
  }, []);

  const loadProveedores = async () => {
    try {
      setLoading(true);
      const data = await getProveedores();
      
      const transformados = data.map(p => ({
        id: p.id,
        codigo: p.codigo,
        razonSocial: p.razon_social,
        rut: p.rut,
        giro: p.giro,
        direccion: p.direccion,
        ciudad: p.ciudad,
        comuna: p.comuna,
        pais: p.pais,
        email: p.email,
        contacto: p.contacto,
        telefono: p.telefono,
        condicionesPago: p.condiciones_pago,
        banco: p.banco,
        numeroCuenta: p.numero_cuenta,
        observaciones: p.observaciones,
        fechaCreacion: p.created_at,
        totalOC: 0,
        montoTotal: 0,
        facturasPendientes: 0,
        montoPendiente: 0
      }));
      
      setProveedores(transformados);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPendientes, setFilterPendientes] = useState('todos');

  const proveedoresFiltrados = proveedores.filter(proveedor => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = proveedor.codigo.includes(searchTerm) ||
                       proveedor.razonSocial.toLowerCase().includes(searchLower) ||
                       proveedor.rut.includes(searchTerm);
    const matchPendientes = filterPendientes === 'todos' || 
                           (filterPendientes === 'pendientes' && proveedor.facturasPendientes > 0);
    return matchSearch && matchPendientes;
  });

  const eliminarProveedor = async (id) => {
  if (confirm('¿Estás seguro de eliminar este proveedor? Esta acción no se puede deshacer.')) {
    try {
      await deleteProveedor(id);
      await loadProveedores();
      alert('Proveedor eliminado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar proveedor');
    }
  }
};

  const exportarExcel = () => {
    const headers = ['Código', 'Razón Social', 'RUT', 'Giro', 'Contacto', 'Teléfono', 'Email', 'Ciudad', 'Condiciones Pago', 'Banco', 'Cuenta', 'Total OC', 'Monto Total', 'Facturas Pendientes', 'Monto Pendiente'];
    const rows = proveedores.map(p => [
      p.codigo,
      p.razonSocial,
      p.rut,
      p.giro,
      p.contacto,
      p.telefono,
      p.email,
      `${p.ciudad}, ${p.comuna}`,
      p.condicionesPago,
      p.banco,
      p.numeroCuenta,
      p.totalOC,
      p.montoTotal,
      p.facturasPendientes,
      p.montoPendiente
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell || ''}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Proveedores_BuildingMe_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const stats = {
    total: proveedores.length,
    activos: proveedores.filter(p => p.totalOC > 0).length,
    conPendientes: proveedores.filter(p => p.facturasPendientes > 0).length,
    montoTotalDeuda: proveedores.reduce((sum, p) => sum + p.montoPendiente, 0),
    ultimoCodigo: proveedores.length > 0 ? Math.max(...proveedores.map(p => parseInt(p.codigo))) : 1000
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Proveedores</h2>
          <p className="text-gray-600">Gestión completa de proveedores y estado de cuenta</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportarExcel}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl border-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            style={{ borderColor: '#45ad98', color: '#45ad98' }}
          >
            <Download className="w-5 h-5" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
          >
            <Building2 className="w-5 h-5" />
            <span>Nuevo Proveedor</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-sm text-gray-500 mb-1">Total Proveedores</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow">
          <p className="text-sm text-green-600 mb-1">Activos (con OC)</p>
          <p className="text-2xl font-bold text-green-800">{stats.activos}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 shadow">
          <p className="text-sm text-red-600 mb-1">Con Pagos Pendientes</p>
          <p className="text-2xl font-bold text-red-800">{stats.conPendientes}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 shadow">
          <p className="text-sm text-purple-600 mb-1">Deuda Total</p>
          <p className="text-lg font-bold text-purple-800">{formatCurrency(stats.montoTotalDeuda)}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 shadow">
          <p className="text-sm text-blue-600 mb-1">Último Código</p>
          <p className="text-2xl font-bold text-blue-800">{stats.ultimoCodigo}</p>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por código, razón social o RUT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
            />
          </div>
          <select
            value={filterPendientes}
            onChange={(e) => setFilterPendientes(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98] bg-white"
          >
            <option value="todos">Todos los proveedores</option>
            <option value="pendientes">Solo con pagos pendientes</option>
          </select>
        </div>
      </div>

      {/* Listado de Proveedores */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#45ad98' }}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Código</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Razón Social</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">RUT</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Contacto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Total OC</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Monto Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Pendiente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {proveedoresFiltrados.map((proveedor) => (
                <tr key={proveedor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-lg" style={{ color: '#235250' }}>{proveedor.codigo}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800">{proveedor.razonSocial}</p>
                      <p className="text-sm text-gray-500">{proveedor.giro}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{proveedor.rut}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{proveedor.contacto}</p>
                      <p className="text-sm text-gray-500">{proveedor.telefono}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                      {proveedor.totalOC}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{formatCurrency(proveedor.montoTotal)}</td>
                  <td className="px-6 py-4">
                    {proveedor.facturasPendientes > 0 ? (
                      <div>
                        <p className="font-bold text-red-600">{formatCurrency(proveedor.montoPendiente)}</p>
                        <p className="text-xs text-red-500">{proveedor.facturasPendientes} facturas</p>
                      </div>
                    ) : (
                      <span className="text-green-600 font-semibold">✓ Al día</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setProveedorSeleccionado(proveedor);
                          setShowHistorialModal(true);
                        }}
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                        title="Ver Historial OC"
                      >
                        <FileText className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => {
                          setProveedorSeleccionado(proveedor);
                          setShowEstadoCuentaModal(true);
                        }}
                        className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                        title="Estado de Cuenta"
                      >
                        <DollarSign className="w-4 h-4 text-purple-600" />
                      </button>
                      <button
                        onClick={() => {
                          setProveedorSeleccionado(proveedor);
                          setShowEditModal(true);
                        }}
                        className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Building2 className="w-4 h-4 text-yellow-600" />
                      </button>
                      <button
                        onClick={() => eliminarProveedor(proveedor.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {proveedoresFiltrados.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No se encontraron proveedores</p>
          </div>
        )}
      </div>

      {/* Modales */}
      {showNewModal && (
        <NuevoProveedorModal 
          onClose={() => setShowNewModal(false)}
          onSave={async (nuevoProveedor) => {
            try {
              const proveedoresExistentes = await getProveedores();
              const ultimoCodigo = proveedoresExistentes.length > 0
                ? Math.max(...proveedoresExistentes.map(p => parseInt(p.codigo) || 1000))
                : 999;

              const proveedorData = {
                codigo: `${ultimoCodigo + 1}`,
                razon_social: nuevoProveedor.razonSocial,
                rut: nuevoProveedor.rut,
                giro: nuevoProveedor.giro,
                direccion: nuevoProveedor.direccion,
                ciudad: nuevoProveedor.ciudad,
                comuna: nuevoProveedor.comuna,
                pais: nuevoProveedor.pais,
                email: nuevoProveedor.email,
                contacto: nuevoProveedor.contacto,
                telefono: nuevoProveedor.telefono,
                condiciones_pago: nuevoProveedor.condicionesPago,
                banco: nuevoProveedor.banco,
                numero_cuenta: nuevoProveedor.numeroCuenta,
                observaciones: nuevoProveedor.observaciones || ''
              };

              await createProveedor(proveedorData);
              await loadProveedores();

              setShowNewModal(false);
              alert('Proveedor creado exitosamente');
            } catch (error) {
              console.error('Error:', error);
              alert('Error al crear proveedor');
            }
          }}
        />
      )}

      {showEditModal && proveedorSeleccionado && (
        <EditarProveedorModal 
          proveedor={proveedorSeleccionado}
          onClose={() => {
            setShowEditModal(false);
            setProveedorSeleccionado(null);
          }}
          onSave={async (proveedorActualizado) => {
            try {
              const proveedorData = {
                razon_social: proveedorActualizado.razonSocial,
                rut: proveedorActualizado.rut,
                giro: proveedorActualizado.giro,
                direccion: proveedorActualizado.direccion,
                ciudad: proveedorActualizado.ciudad,
                comuna: proveedorActualizado.comuna,
                pais: proveedorActualizado.pais,
                email: proveedorActualizado.email,
                contacto: proveedorActualizado.contacto,
                telefono: proveedorActualizado.telefono,
                condiciones_pago: proveedorActualizado.condicionesPago,
                banco: proveedorActualizado.banco,
                numero_cuenta: proveedorActualizado.numeroCuenta,
                observaciones: proveedorActualizado.observaciones || ''
              };

              await updateProveedor(proveedorActualizado.id, proveedorData);
              await loadProveedores();

              setShowEditModal(false);
              setProveedorSeleccionado(null);
              alert('Proveedor actualizado exitosamente');
            } catch (error) {
              console.error('Error:', error);
              alert('Error al actualizar proveedor');
            }
          }}
        />
      )}

      {showHistorialModal && proveedorSeleccionado && (
        <HistorialProveedorModal 
          proveedor={proveedorSeleccionado}
          onClose={() => {
            setShowHistorialModal(false);
            setProveedorSeleccionado(null);
          }}
        />
      )}

      {showEstadoCuentaModal && proveedorSeleccionado && (
        <EstadoCuentaModal 
          proveedor={proveedorSeleccionado}
          onClose={() => {
            setShowEstadoCuentaModal(false);
            setProveedorSeleccionado(null);
          }}
        />
      )}
    </div>
  );
};

// Modal Nuevo Proveedor
const NuevoProveedorModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    razonSocial: '',
    rut: '',
    giro: '',
    direccion: '',
    ciudad: '',
    comuna: '',
    pais: 'Chile',
    email: '',
    contacto: '',
    telefono: '',
    condicionesPago: '',
    banco: '',
    numeroCuenta: '',
    observaciones: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        <div className="p-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Nuevo Proveedor</h3>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Información Básica */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Información Básica</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Razón Social *</label>
                <input
                  type="text"
                  required
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({...formData, razonSocial: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">RUT *</label>
                <input
                  type="text"
                  required
                  value={formData.rut}
                  onChange={(e) => setFormData({...formData, rut: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                  placeholder="12.345.678-9"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Giro/Rubro *</label>
                <input
                  type="text"
                  required
                  value={formData.giro}
                  onChange={(e) => setFormData({...formData, giro: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Ubicación</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad *</label>
                <input
                  type="text"
                  required
                  value={formData.ciudad}
                  onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Comuna *</label>
                <input
                  type="text"
                  required
                  value={formData.comuna}
                  onChange={(e) => setFormData({...formData, comuna: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">País *</label>
                <input
                  type="text"
                  required
                  value={formData.pais}
                  onChange={(e) => setFormData({...formData, pais: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Contacto</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Persona de Contacto *</label>
                <input
                  type="text"
                  required
                  value={formData.contacto}
                  onChange={(e) => setFormData({...formData, contacto: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono *</label>
                <input
                  type="text"
                  required
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                  placeholder="+56 2 1234 5678"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                  placeholder="contacto@proveedor.cl"
                />
              </div>
            </div>
          </div>

          {/* Datos Financieros */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Datos Financieros</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Condiciones de Pago</label>
                <input
                  type="text"
                  value={formData.condicionesPago}
                  onChange={(e) => setFormData({...formData, condicionesPago: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                  placeholder="Ej: 30 días, 60 días, contado"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Banco</label>
                <input
                  type="text"
                  value={formData.banco}
                  onChange={(e) => setFormData({...formData, banco: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Cuenta</label>
                <input
                  type="text"
                  value={formData.numeroCuenta}
                  onChange={(e) => setFormData({...formData, numeroCuenta: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Observaciones</label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
              rows="3"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              placeholder="Notas adicionales sobre el proveedor..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
            >
              Crear Proveedor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Editar Proveedor (similar estructura a crear)
const EditarProveedorModal = ({ proveedor, onClose, onSave }) => {
  const [formData, setFormData] = useState(proveedor);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        <div className="p-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Editar Proveedor</h3>
              <p className="text-white/80 text-sm">Código: {proveedor.codigo}</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Formulario similar a NuevoProveedorModal */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Información Básica</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Razón Social *</label>
                <input
                  type="text"
                  required
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({...formData, razonSocial: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">RUT *</label>
                <input
                  type="text"
                  required
                  value={formData.rut}
                  onChange={(e) => setFormData({...formData, rut: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Giro *</label>
                <input
                  type="text"
                  required
                  value={formData.giro}
                  onChange={(e) => setFormData({...formData, giro: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Historial Proveedor
const HistorialProveedorModal = ({ proveedor, onClose }) => {
  const ordenesCompra = [
    { numero: '61324', protocolo: '30650', fecha: '2025-01-20', monto: 2500000, factura: '', estado: 'Pendiente' },
    { numero: '61325', protocolo: '30651', fecha: '2025-01-25', monto: 1800000, factura: 'F-12345', estado: 'Pagada' }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl">
        <div className="p-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Historial de Órdenes de Compra</h3>
              <p className="text-white/80">{proveedor.razonSocial} - Código: {proveedor.codigo}</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {ordenesCompra.length > 0 ? (
            <div className="space-y-4">
              {ordenesCompra.map((oc) => (
                <div key={oc.numero} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-lg" style={{ color: '#235250' }}>
                        OC #{oc.numero}
                      </p>
                      <p className="text-sm text-gray-600">
                        Protocolo: {oc.protocolo} | {oc.fecha}
                      </p>
                      {oc.factura && (
                        <p className="text-sm text-green-600 mt-1">
                          Factura: {oc.factura}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-gray-800">{formatCurrency(oc.monto)}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                        oc.estado === 'Pagada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {oc.estado}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Este proveedor aún no tiene órdenes de compra</p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Estado de Cuenta
const EstadoCuentaModal = ({ proveedor, onClose }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Estado de Cuenta</h3>
              <p className="text-white/80">{proveedor.razonSocial}</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-blue-600 mb-1">Total Órdenes de Compra</p>
              <p className="text-2xl font-bold text-blue-800">{proveedor.totalOC}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-xl">
              <p className="text-sm text-green-600 mb-1">Monto Total Histórico</p>
              <p className="text-2xl font-bold text-green-800">{formatCurrency(proveedor.montoTotal)}</p>
            </div>

            <div className="bg-red-50 p-4 rounded-xl">
              <p className="text-sm text-red-600 mb-1">Facturas Pendientes</p>
              <p className="text-2xl font-bold text-red-800">{proveedor.facturasPendientes}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl">
              <p className="text-sm text-purple-600 mb-1">Monto Pendiente de Pago</p>
              <p className="text-3xl font-bold text-purple-800">{formatCurrency(proveedor.montoPendiente)}</p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Información de Pago</h4>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold">Condiciones:</span> {proveedor.condicionesPago || 'No especificado'}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Banco:</span> {proveedor.banco || 'No especificado'}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Cuenta:</span> {proveedor.numeroCuenta || 'No especificado'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Seleccionar Cotización Ganada
const ModalSeleccionarCotizacion = ({ cotizaciones, onClose, onSeleccionar }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Seleccionar Cotización Ganada</h3>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {cotizaciones.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-semibold">No hay cotizaciones ganadas disponibles</p>
              <p className="text-gray-400 text-sm mt-2">Las cotizaciones ya adjudicadas no aparecen aquí</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cotizaciones.map(cotizacion => (
                <div 
                  key={cotizacion.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#45ad98] hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => onSeleccionar(cotizacion)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="font-mono font-bold text-2xl" style={{ color: '#235250' }}>
                          #{cotizacion.numero}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          ✓ Ganada
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {cotizacion.unidadNegocio}
                        </span>
                      </div>
                      <p className="font-bold text-gray-800 text-xl mb-1">{cotizacion.nombreProyecto || 'Sin nombre de proyecto'}</p>
                      <p className="text-gray-600 mb-1">{cotizacion.cliente}</p>
                      <p className="text-gray-500 text-sm mb-3">{cotizacion.rutCliente}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span>📅 {cotizacion.fecha}</span>
                        <span>👤 {cotizacion.contacto}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Monto Total</p>
                      <p className="text-3xl font-bold" style={{ color: '#235250' }}>
                        {formatCurrency(cotizacion.total)}
                      </p>
                      <div className="mt-3 px-6 py-2 bg-[#45ad98] text-white rounded-lg font-semibold text-center">
                        Seleccionar →
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de Módulo de Protocolos de Compra
// ========================================
// MÓDULO DE PROTOCOLOS - VERSIÓN COMPLETA
// Reemplaza el ProtocolosModule existente
// ========================================

const ProtocolosModule = ({
  sharedProtocolos = [],
  setSharedProtocolos = () => {},
  sharedOrdenesCompra = [],
  setSharedOrdenesCompra = () => {},
  sharedCotizaciones = [],
  protocoloParaAbrir,
  onAdjudicarCompra,
  onAdjudicarVentaDesdeCotizacion,
  onLimpiarProtocoloParaAbrir
}) => {
  const [vistaActual, setVistaActual] = useState('listado'); // 'listado' o 'detalle'
  const [protocoloSeleccionado, setProtocoloSeleccionado] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [mostrarFormularioOC, setMostrarFormularioOC] = useState(false);
  const [datosPreOC, setDatosPreOC] = useState(null);
  const [showDetalleOC, setShowDetalleOC] = useState(false);
  const [ordenDetalle, setOrdenDetalle] = useState(null);
  const [detalleEditMode, setDetalleEditMode] = useState(false);
  
  // Cargar protocolos desde Supabase
  const [protocolos, setProtocolos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProtocolos();
  }, []);

  const loadProtocolos = async () => {
    try {
      setLoading(true);
      const data = await getProtocolos();
      
      const transformados = data.map(p => ({
        id: p.id,
        folio: p.folio,
        numeroCotizacion: p.numero_cotizacion,
        cliente: p.clientes?.razon_social || 'Sin cliente',
        nombreProyecto: p.nombre_proyecto,
        rutCliente: p.clientes?.rut || '',
        tipo: p.tipo,
        ocCliente: p.oc_cliente,
        estado: p.estado,
        unidadNegocio: p.unidad_negocio,
        fechaCreacion: p.fecha_creacion,
        montoTotal: parseFloat(p.monto_total),
        items: []
      }));
      
      setProtocolos(transformados);
    } catch (error) {
      console.error('Error:', error);
      setProtocolos([]);
    } finally {
      setLoading(false);
    }
  };

  const ordenesCompra = sharedOrdenesCompra;
  const mapOrdenCompra = (o) => ({
    id: o.id,
    numero: o.numero,
    codigoProtocolo: o.codigo_protocolo,
    fecha: o.fecha,
    proveedorId: o.proveedor_id || null,
    proveedor: o.proveedores?.razon_social || 'Sin proveedor',
    rutProveedor: o.proveedores?.rut || '',
    tipoCosto: o.tipo_costo,
    formaPago: o.forma_pago,
    subtotal: parseFloat(o.subtotal) || 0,
    iva: parseFloat(o.iva) || 0,
    total: parseFloat(o.total) || 0,
    estado: o.estado,
    numeroFactura: o.numero_factura || '',
    fechaFactura: o.fecha_factura || '',
    estadoPago: o.estado_pago || 'Pendiente',
    items: (o.ordenes_compra_items || []).map(item => ({
      id: item.id,
      item: item.item || '',
      cantidad: item.cantidad,
      descripcion: item.descripcion,
      valorUnitario: parseFloat(item.valor_unitario) || 0,
      valor_unitario: parseFloat(item.valor_unitario) || 0,
      descuento: parseFloat(item.descuento || 0)
    }))
  });
  const refrescarOrdenesCompra = async () => {
    const ordenesActualizadas = await getOrdenesCompra();
    setSharedOrdenesCompra(ordenesActualizadas.map(mapOrdenCompra));
  };
  const handleAdjudicarCompraLocal = (protocolo) => {
    if (onAdjudicarCompra) {
      onAdjudicarCompra(protocolo);
      return;
    }

    setDatosPreOC({
      codigoProtocolo: protocolo.folio,
      fechaProtocolo: protocolo.fechaCreacion || new Date().toISOString().split('T')[0],
      unidadNegocio: protocolo.unidadNegocio,
      items: protocolo.items || []
    });
    setMostrarFormularioOC(true);
  };


  // Si está en vista detalle, mostrar protocolo completo
  if (vistaActual === 'detalle' && protocoloSeleccionado) {
    return (
      <>
        <VistaDetalleProtocolo
          protocolo={protocoloSeleccionado}
          ordenesCompra={ordenesCompra}
          onVerDetalleOC={(orden, editar = false) => {
            setOrdenDetalle(orden);
            setDetalleEditMode(editar);
            setShowDetalleOC(true);
          }}
          onVolver={() => {
            setVistaActual('listado');
            setProtocoloSeleccionado(null);
          }}
          onAdjudicarCompra={() => {
            handleAdjudicarCompraLocal(protocoloSeleccionado);
          }}
          onActualizar={(protocoloActualizado) => {
            setProtocolos(prev => prev.map(p => 
              p.id === protocoloActualizado.id ? protocoloActualizado : p
            ));
            setProtocoloSeleccionado(protocoloActualizado);
          }}
        />
        {showDetalleOC && ordenDetalle && (
          <DetalleOCModal
            orden={ordenDetalle}
            startInEdit={detalleEditMode}
            onClose={() => {
              setShowDetalleOC(false);
              setOrdenDetalle(null);
            }}
            onUpdate={(ordenActualizada) => {
              setSharedOrdenesCompra(prev =>
                prev.map(o => (o.id === ordenActualizada.id ? ordenActualizada : o))
              );
              setOrdenDetalle(ordenActualizada);
            }}
            onSave={async (ordenActualizada) => {
              try {
                const subtotal = ordenActualizada.items.reduce((sum, item) => {
                  const itemSubtotal = item.cantidad * item.valorUnitario;
                  const itemDescuento = itemSubtotal * (item.descuento / 100);
                  return sum + (itemSubtotal - itemDescuento);
                }, 0);
                const iva = subtotal * 0.19;
                const total = subtotal + iva;

                await updateOrdenCompra(ordenActualizada.id, {
                  proveedor_id: ordenActualizada.proveedorId || null,
                  codigo_protocolo: ordenActualizada.codigoProtocolo || '',
                  tipo_costo: ordenActualizada.tipoCosto || '',
                  forma_pago: ordenActualizada.formaPago || '',
                  subtotal,
                  iva,
                  total,
                  estado: ordenActualizada.estado,
                  numero_factura: ordenActualizada.numeroFactura || '',
                  fecha_factura: ordenActualizada.fechaFactura || null,
                  estado_pago: ordenActualizada.estadoPago || 'Pendiente'
                });

                await replaceOrdenCompraItems(ordenActualizada.id, ordenActualizada.items || []);
                await refrescarOrdenesCompra();

                setShowDetalleOC(false);
                setOrdenDetalle(null);
                alert('OC actualizada exitosamente');
              } catch (error) {
                console.error('Error actualizando OC:', error);
                alert('Error al actualizar OC');
              }
            }}
          />
        )}
        {mostrarFormularioOC && datosPreOC && (
          <FormularioOCDesdeProtocolo
            datosProtocolo={datosPreOC}
            onClose={() => {
              setMostrarFormularioOC(false);
              setDatosPreOC(null);
            }}
            onGuardar={async (nuevaOC) => {
              try {
                const ordenesExistentes = await getOrdenesCompra();
                const ultimoNumero = ordenesExistentes.length > 0
                  ? Math.max(...ordenesExistentes.map(o => {
                      const num = parseInt(o.numero.replace('OC-', ''));
                      return isNaN(num) ? 17403 : num;
                    }))
                  : 17402;

                const ocData = {
                  numero: `OC-${ultimoNumero + 1}`,
                  codigo_protocolo: datosPreOC.codigoProtocolo,
                  fecha: new Date().toISOString().split('T')[0],
                  proveedor_id: null,
                  tipo_costo: nuevaOC.tipoCosto,
                  forma_pago: nuevaOC.formaPago,
                  total: parseFloat(nuevaOC.total),
                  estado: 'Emitida',
                  numero_factura: '',
                  fecha_factura: null,
                  estado_pago: 'Pendiente'
                };

                await createOrdenCompra(ocData, nuevaOC.items || []);
                const ordenesActualizadas = await getOrdenesCompra();
                setSharedOrdenesCompra(ordenesActualizadas.map(mapOrdenCompra));

                setMostrarFormularioOC(false);
                setDatosPreOC(null);
                alert('Orden de Compra creada exitosamente');
              } catch (error) {
                console.error('Error:', error);
                alert('Error al crear OC');
              }
            }}
          />
        )}
      </>
    );
  }

  // Vista de listado
  return (
    <>
      <VistaListadoProtocolos
        protocolos={protocolos}
        onVerDetalle={(protocolo) => {
          setProtocoloSeleccionado(protocolo);
          setVistaActual('detalle');
        }}
        onNuevoProtocolo={() => setShowNewModal(true)}
      />

      {/* Modal Nueva OC desde Protocolo */}
      {mostrarFormularioOC && datosPreOC && (
        <FormularioOCDesdeProtocolo
          datosProtocolo={datosPreOC}
          onClose={() => {
            setMostrarFormularioOC(false);
            setDatosPreOC(null);
          }}
          onGuardar={async (nuevaOC) => {
            try {
              // Generar número de OC
              const ordenesExistentes = await getOrdenesCompra();
              const ultimoNumero = ordenesExistentes.length > 0
                ? Math.max(...ordenesExistentes.map(o => {
                    const num = parseInt(o.numero.replace('OC-', ''));
                    return isNaN(num) ? 17403 : num;
                  }))
                : 17402;

              const ocData = {
                numero: `OC-${ultimoNumero + 1}`,
                codigo_protocolo: datosPreOC.codigoProtocolo,
                fecha: new Date().toISOString().split('T')[0],
                proveedor_id: null,
                tipo_costo: nuevaOC.tipoCosto,
                forma_pago: nuevaOC.formaPago,
                total: parseFloat(nuevaOC.total),
                estado: 'Emitida',
                numero_factura: '',
                fecha_factura: null,
                estado_pago: 'Pendiente'
              };

              await createOrdenCompra(ocData, nuevaOC.items || []);
              await loadOrdenes();

              setMostrarFormularioOC(false);
              setDatosPreOC(null);
              alert('Orden de Compra creada exitosamente');
            } catch (error) {
              console.error('Error:', error);
              alert('Error al crear OC');
            }
          }}
        />
      )}

      {/* Modal Nuevo Protocolo */}
      {showNewModal && (
        <NuevoProtocoloModal
          onClose={() => setShowNewModal(false)}
          sharedCotizaciones={sharedCotizaciones}
          onSave={async (nuevoProtocolo) => {
            try {
              // Obtener folios existentes
              const protocolosExistentes = await getProtocolos();
              const ultimoFolio = protocolosExistentes.length > 0
                ? Math.max(...protocolosExistentes.map(p => {
                    const num = parseInt(p.folio);
                    return isNaN(num) ? 30650 : num;
                  }))
                : 30649;

              const protocoloData = {
                folio: `${ultimoFolio + 1}`,
                numero_cotizacion: nuevoProtocolo.numeroCotizacion || '',
                cliente_id: null,
                nombre_proyecto: nuevoProtocolo.nombreProyecto,
                tipo: nuevoProtocolo.tipo,
                oc_cliente: '',
                estado: 'Abierto',
                unidad_negocio: nuevoProtocolo.unidadNegocio,
                fecha_creacion: new Date().toISOString().split('T')[0],
                monto_total: nuevoProtocolo.montoTotal || 0
              };

              await createProtocolo(protocoloData);
              await loadProtocolos();
              
              setShowNewModal(false);
              alert('Protocolo creado exitosamente');
            } catch (error) {
              console.error('Error:', error);
              alert('Error al crear protocolo');
            }
          }}
        />
      )}
    </>
  );
};

// ========================================
// VISTA LISTADO DE PROTOCOLOS
// ========================================
const VistaListadoProtocolos = ({ protocolos, onVerDetalle, onNuevoProtocolo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');

  const protocolosFiltrados = protocolos.filter(p => {
    const matchSearch = p.folio.includes(searchTerm) || 
                       p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.numeroCotizacion.includes(searchTerm);
    const matchEstado = filterEstado === 'todos' || p.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'Abierto': return 'bg-green-100 text-green-800';
      case 'En Proceso': return 'bg-yellow-100 text-yellow-800';
      case 'Cerrado': return 'bg-blue-100 text-blue-800';
      case 'Anulado': return 'bg-red-100 text-red-800';
      case 'Despachado Parcial': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const stats = {
    total: protocolos.length,
    abiertos: protocolos.filter(p => p.estado === 'Abierto').length,
    enProceso: protocolos.filter(p => p.estado === 'En Proceso').length,
    cerrados: protocolos.filter(p => p.estado === 'Cerrado').length,
    montoTotal: protocolos.reduce((sum, p) => sum + p.montoTotal, 0)
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Protocolos de Compra</h2>
          <p className="text-gray-600">Gestión completa de proyectos y órdenes de compra</p>
        </div>
        <button
          onClick={onNuevoProtocolo}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
        >
          <Package className="w-5 h-5" />
          <span>Adjudicar Venta</span>
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-sm text-gray-500 mb-1">Total Protocolos</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow">
          <p className="text-sm text-green-600 mb-1">Abiertos</p>
          <p className="text-2xl font-bold text-green-800">{stats.abiertos}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 shadow">
          <p className="text-sm text-yellow-600 mb-1">En Proceso</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.enProceso}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 shadow">
          <p className="text-sm text-blue-600 mb-1">Cerrados</p>
          <p className="text-2xl font-bold text-blue-800">{stats.cerrados}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 shadow">
          <p className="text-sm text-purple-600 mb-1">Monto Total</p>
          <p className="text-lg font-bold text-purple-800">{formatCurrency(stats.montoTotal)}</p>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por folio, cliente o cotización..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
            />
          </div>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98] bg-white"
          >
            <option value="todos">Todos los estados</option>
            <option value="Abierto">Abierto</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Cerrado">Cerrado</option>
            <option value="Anulado">Anulado</option>
            <option value="Despachado Parcial">Despachado Parcial</option>
          </select>
        </div>
      </div>

      {/* Listado de Protocolos */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#45ad98' }}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Folio</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">N° Cotización</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Nombre Proyecto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Tipo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">OC Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Monto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {protocolosFiltrados.map((protocolo) => (
                <tr key={protocolo.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-xl" style={{ color: '#235250' }}>{protocolo.folio}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-gray-600">#{protocolo.numeroCotizacion}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800">{protocolo.cliente}</p>
                      <p className="text-sm text-gray-500">{protocolo.rutCliente}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-700">{protocolo.nombreProyecto || 'Sin nombre'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {protocolo.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {protocolo.ocCliente ? (
                      <span className="text-gray-700 font-medium">{protocolo.ocCliente}</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin OC</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{formatCurrency(protocolo.montoTotal)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(protocolo.estado)}`}>
                      {protocolo.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onVerDetalle(protocolo)}
                      className="px-4 py-2 bg-[#45ad98] text-white rounded-lg hover:bg-[#235250] transition-colors font-semibold"
                    >
                      Abrir Tablero
                    </button>
                    {/* Eliminar Protocolo */}
                      <button
                        onClick={async () => {
                          if (window.confirm(`¿Estás seguro de eliminar el protocolo ${protocolo.folio}?`)) {
                            try {
                              await deleteProtocolo(protocolo.id);
                              await loadProtocolos();
                              alert('Protocolo eliminado exitosamente');
                            } catch (error) {
                              console.error('Error:', error);
                              alert('Error al eliminar protocolo');
                            }
                          }
                        }}
                        className="p-3 bg-red-100 hover:bg-red-200 rounded-lg transition-colors ml-5"
                        title="Eliminar Protocolo"
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {protocolosFiltrados.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No se encontraron protocolos</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================
// VISTA DETALLE DEL PROTOCOLO (PÁGINA COMPLETA)
// ========================================
const VistaDetalleProtocolo = ({ protocolo, ordenesCompra, onVolver, onAdjudicarCompra, onActualizar, onVerDetalleOC }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

const ocVinculadas = ordenesCompra.filter(oc => oc.codigoProtocolo === protocolo.folio);
  const costoReal = ocVinculadas.reduce((total, oc) => total + (oc.total || 0), 0);

  const [showCerrarModal, setShowCerrarModal] = useState(false);

  const cambiarEstado = (nuevoEstado) => {
    if (nuevoEstado === 'Cerrado') {
      setShowCerrarModal(true);
    } else {
      onActualizar({ ...protocolo, estado: nuevoEstado });
    }
  };

  return (
    <div>
      {/* Header con botón volver */}
      <div className="mb-6">
        <button
          onClick={onVolver}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold">Volver al listado</span>
        </button>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Protocolo {protocolo.folio}</h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Cliente:</p>
                  <p className="font-semibold text-gray-800">{protocolo.cliente}</p>
                </div>
                <div>
                  <p className="text-gray-500">N° Cotización:</p>
                  <p className="font-semibold text-gray-800">#{protocolo.numeroCotizacion}</p>
                </div>
                <div>
                  <p className="text-gray-500">Unidad de Negocio:</p>
                  <p className="font-semibold text-gray-800">{protocolo.unidadNegocio}</p>
                </div>
                <div>
                  <p className="text-gray-500">Monto Total:</p>
                  <p className="font-semibold text-gray-800">{formatCurrency(protocolo.montoTotal)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Costo Real (OC):</p>
                  <p className="font-semibold text-blue-600">{formatCurrency(costoReal)}</p>
                </div>
                <div>
                  <p className="text-gray-500">OC Cliente:</p>
                  <p className="font-semibold text-gray-800">
                    {protocolo.ocCliente || <span className="text-gray-400">Sin OC</span>}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <select
                value={protocolo.estado}
                onChange={(e) => cambiarEstado(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98] bg-white font-semibold"
              >
                <option value="Abierto">🟢 Abierto</option>
                <option value="En Proceso">🟡 En Proceso</option>
                <option value="Cerrado">✅ Cerrado</option>
                <option value="Anulado">❌ Anulado</option>
                <option value="Despachado Parcial">📦 Despachado Parcial</option>
              </select>
            </div>
          </div>

          {/* Botón Adjudicar Compra */}
          <div className="flex space-x-3">
            <button
              onClick={onAdjudicarCompra}
              className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
            >
              <ShoppingCart className="w-5 h-5 inline mr-2" />
              Adjudicar Compra (Crear OC)
            </button>
            <button
              onClick={() => {
                const ocCliente = prompt('Ingrese el número de OC del cliente:');
                if (ocCliente) {
                  onActualizar({ ...protocolo, ocCliente });
                }
              }}
              className="px-6 py-3 bg-white border-2 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              style={{ borderColor: '#45ad98', color: '#235250' }}
            >
              📄 Ingresar OC Cliente
            </button>
            <button
              onClick={() => {
                alert(`Generando PDF del Protocolo ${protocolo.folio}...\n\nFuncionalidad en desarrollo.`);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg"
            >
              <Download className="w-5 h-5 inline mr-2" />
              Generar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Items del Protocolo */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Items del Proyecto</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">N°</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Cantidad</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Descripción</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">V. Unitario</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {protocolo.items.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-semibold">{item.cantidad}</td>
                  <td className="px-4 py-3">{item.descripcion}</td>
                  <td className="px-4 py-3">{formatCurrency(item.valorUnitario)}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(item.cantidad * item.valorUnitario)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Órdenes de Compra Vinculadas */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Órdenes de Compra Vinculadas ({ocVinculadas.length})
        </h3>
        
        {ocVinculadas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">N° OC</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Proveedor</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Tipo Costo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Monto</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ocVinculadas.map((oc) => (
                  <tr key={oc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold">{oc.numero}</td>
                    <td className="px-4 py-3">{oc.fecha}</td>
                    <td className="px-4 py-3">{oc.proveedor}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                        {oc.tipoCosto}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(oc.total)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                        {oc.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onVerDetalleOC && onVerDetalleOC(oc, false)}
                          className="px-3 py-1 bg-[#45ad98] text-white rounded-lg hover:bg-[#235250] transition-colors text-xs font-semibold"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => onVerDetalleOC && onVerDetalleOC(oc, true)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-semibold"
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No hay órdenes de compra vinculadas a este protocolo</p>
            <p className="text-sm text-gray-400 mt-2">Usa el botón "Adjudicar Compra" para crear una OC</p>
          </div>
        )}
      </div>

      {/* Modal Cerrar Protocolo */}
      {showCerrarModal && (
        <ModalCerrarProtocolo
          protocolo={protocolo}
          costoReal={costoReal}
          onClose={() => setShowCerrarModal(false)}
          onConfirmar={async (precioVenta) => {
            try {
              // Buscar la cotización por número
              const cotizaciones = await getCotizaciones();
              const cotizacion = cotizaciones.find(c => c.numero === protocolo.numeroCotizacion);
              
              if (cotizacion) {
                // Actualizar cotización con el nuevo precio
                await updateCotizacion(cotizacion.id, { monto: precioVenta });
              }
              
              // Actualizar estado del protocolo
              await updateProtocolo(protocolo.id, { estado: 'Cerrado' });
              
              // Actualizar en la interfaz
              onActualizar({ ...protocolo, estado: 'Cerrado', montoTotal: precioVenta });
              
              setShowCerrarModal(false);
              alert('Protocolo cerrado y cotización actualizada exitosamente');
            } catch (error) {
              console.error('Error:', error);
              alert('Error al actualizar: ' + error.message);
            }
          }}
        />
      )}

</div>
  );
};

// Modal para Cerrar Protocolo y Actualizar Cotización
const ModalCerrarProtocolo = ({ protocolo, costoReal, onClose, onConfirmar }) => {
  const [precioVenta, setPrecioVenta] = useState('');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!precioVenta || parseFloat(precioVenta) <= 0) {
      alert('Ingresa un precio válido');
      return;
    }
    onConfirmar(parseFloat(precioVenta));
  };

  const margen = precioVenta ? parseFloat(precioVenta) - costoReal : 0;
  const porcentajeMargen = precioVenta && costoReal > 0 
    ? ((margen / costoReal) * 100).toFixed(1) 
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Cerrar Protocolo</h3>
        
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">Protocolo #{protocolo.folio}</p>
          <p className="text-sm text-gray-600 mb-4">Cotización #{protocolo.numeroCotizacion}</p>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Costo Real (OC):</span>
              <span className="font-bold text-blue-600">{formatCurrency(costoReal)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Precio Venta al Cliente
            </label>
            <input
              type="number"
              value={precioVenta}
              onChange={(e) => setPrecioVenta(e.target.value)}
              placeholder="Ingresa el precio final"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              min="1"
              required
            />
          </div>

          {precioVenta && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Margen:</span>
                  <span className="font-bold text-green-600">{formatCurrency(margen)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">% Margen:</span>
                  <span className="font-bold text-green-600">{porcentajeMargen}%</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
            >
              Cerrar y Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

   

// ========================================
// FORMULARIO OC DESDE PROTOCOLO
// ========================================
const FormularioOCDesdeProtocolo = ({ datosProtocolo, onClose, onGuardar }) => {
  const TIPOS_COSTO = [
    '🚚 Transporte',
    '🚁 Drone',
    '💰 Rendiciones',
    '💳 Financiamiento',
    '📦 Varios',
    '---',
    'Taller/Fabricación',
    'Imprenta/Impresión',
    'Instalación',
    'Desmontaje',
    'Arriendo Soporte',
    'Mobiliario (sillas, mesas)',
    'Equipamiento (pantallas, TV)',
    'Materiales',
    'Grabación Drone',
    'Transporte Visto Bueno',
    'Producción Externa',
    'Terminaciones',
    'Materiales POP',
    'Distribución/Logística',
    'Promotoras/RRHH',
    'Despacho',
    'Financiamiento'
  ];

  const [formData, setFormData] = useState({
    codigoProtocolo: datosProtocolo.codigoProtocolo,
    fechaProtocolo: datosProtocolo.fechaProtocolo,
    codigoProveedor: '',
    proveedor: '',
    rutProveedor: '',
    direccionProveedor: '',
    contactoProveedor: '',
    telefonoProveedor: '',
    cotizacionProveedor: '',
    formaPago: '',
    responsableCompra: '',
    tipoCosto: '',
    items: datosProtocolo.items.map(item => ({
      id: item.id,
      item: item.descripcion.substring(0, 20),
      cantidad: item.cantidad,
      descripcion: item.descripcion,
      valorUnitario: item.valorUnitario || 0,
      descuento: 0
    })),
    observaciones: ''
  });

  const [proveedores, setProveedores] = useState([]);
  const [proveedoresError, setProveedoresError] = useState('');

  useEffect(() => {
    const loadProveedores = async () => {
      try {
        setProveedoresError('');
        const data = await getProveedores();
        const transformados = data.map(p => ({
          id: p.id,
          codigo: p.codigo,
          nombre: p.razon_social,
          rut: p.rut,
          direccion: p.direccion,
          contacto: p.contacto,
          telefono: p.telefono
        }));
        setProveedores(transformados);
      } catch (error) {
        console.error('Error cargando proveedores:', error);
        setProveedoresError('No se pudieron cargar los proveedores');
      }
    };

    loadProveedores();
  }, []);

  const buscarProveedor = (codigo) => {
    const codigoNormalizado = codigo.trim();
    if (!codigoNormalizado) return;
    const prov = proveedores.find(p => String(p.codigo) === codigoNormalizado);
    if (prov) {
      setFormData(prev => ({
        ...prev,
        codigoProveedor: codigo,
        proveedor: prov.nombre,
        rutProveedor: prov.rut,
        direccionProveedor: prov.direccion,
        contactoProveedor: prov.contacto,
        telefonoProveedor: prov.telefono
      }));
    }
  };

  const agregarItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        id: prev.items.length + 1,
        item: '',
        cantidad: 1,
        descripcion: '',
        valorUnitario: 0,
        descuento: 0
      }]
    }));
  };

  const eliminarItem = (id) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const actualizarItem = (id, campo, valor) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [campo]: valor } : item
      )
    }));
  };

  const calcularSubtotalItem = (item) => {
    const subtotal = item.cantidad * item.valorUnitario;
    const descuento = subtotal * (item.descuento / 100);
    return subtotal - descuento;
  };

  const calcularTotales = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + calcularSubtotalItem(item), 0);
    const iva = subtotal * 0.19;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { subtotal, iva, total } = calcularTotales();
    onGuardar({ 
      ...formData, 
      subtotal, 
      iva, 
      total,
      unidadNegocio: datosProtocolo.unidadNegocio 
    });
  };

  const totales = calcularTotales();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8">
        <div className="p-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Nueva Orden de Compra</h3>
              <p className="text-white/80 text-sm mt-1">Desde Protocolo {datosProtocolo.codigoProtocolo}</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Info del Protocolo (solo lectura) */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">📋 Datos del Protocolo</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-blue-600">Código PR:</p>
                <p className="font-bold text-blue-900">{datosProtocolo.codigoProtocolo}</p>
              </div>
              <div>
                <p className="text-blue-600">Fecha PR:</p>
                <p className="font-bold text-blue-900">{datosProtocolo.fechaProtocolo}</p>
              </div>
              <div>
                <p className="text-blue-600">Unidad de Negocio:</p>
                <p className="font-bold text-blue-900">{datosProtocolo.unidadNegocio}</p>
              </div>
            </div>
          </div>

          {/* Datos del Proveedor */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Datos del Proveedor</h4>
            
            <div className="mb-4 p-4 bg-green-50 rounded-xl border-2 border-green-200">
              <label className="block text-sm font-semibold text-green-800 mb-2">
                🔍 Código Proveedor
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={formData.codigoProveedor}
                  onChange={(e) => setFormData({...formData, codigoProveedor: e.target.value})}
                  onBlur={(e) => buscarProveedor(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-green-300 rounded-xl focus:outline-none focus:border-green-500 font-mono text-lg font-bold"
                  placeholder="Ej: 1000"
                />
                <button
                  type="button"
                  onClick={() => buscarProveedor(formData.codigoProveedor)}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  Buscar
                </button>
              </div>
              {proveedoresError && (
                <p className="text-xs text-red-600 mt-2">{proveedoresError}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Proveedor *</label>
                <input
                  type="text"
                  required
                  value={formData.proveedor}
                  onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">RUT *</label>
                <input
                  type="text"
                  required
                  value={formData.rutProveedor}
                  onChange={(e) => setFormData({...formData, rutProveedor: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
            </div>
          </div>

          {/* Datos de la OC */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Datos de la Orden de Compra</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">N° Cotización Proveedor</label>
                <input
                  type="text"
                  value={formData.cotizacionProveedor}
                  onChange={(e) => setFormData({...formData, cotizacionProveedor: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                  placeholder="Ref. del proveedor"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Costo * 
                  <span className="text-xs text-gray-500 ml-2">📊 Para análisis</span>
                </label>
                <select
                  required
                  value={formData.tipoCosto}
                  onChange={(e) => setFormData({...formData, tipoCosto: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98] bg-white font-semibold"
                >
                  <option value="">Seleccione tipo...</option>
                  {TIPOS_COSTO.map((tipo, index) => 
                    tipo === '---' ? (
                      <option key={index} disabled>──────────────</option>
                    ) : (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Forma de Pago *</label>
                <select
                  required
                  value={formData.formaPago}
                  onChange={(e) => setFormData({...formData, formaPago: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98] bg-white"
                >
                  <option value="">Seleccione...</option>
                  <option value="Contado Efectivo">Contado Efectivo</option>
                  <option value="30 días">30 días</option>
                  <option value="60 días">60 días</option>
                  <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                  <option value="Caja Chica">Caja Chica</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Responsable Compra *</label>
                <input
                  type="text"
                  required
                  value={formData.responsableCompra}
                  onChange={(e) => setFormData({...formData, responsableCompra: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
            </div>
          </div>

          {/* Items de la OC */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Items (Pre-cargados del Protocolo - Edita valores)</h4>
              <button
                type="button"
                onClick={agregarItem}
                className="px-4 py-2 bg-[#45ad98] text-white rounded-lg font-semibold hover:bg-[#235250] transition-colors"
              >
                + Agregar Item
              </button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Item</label>
                      <input
                        type="text"
                        value={item.item}
                        onChange={(e) => actualizarItem(item.id, 'item', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => actualizarItem(item.id, 'cantidad', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">V. Unitario</label>
                      <input
                        type="number"
                        min="0"
                        value={item.valorUnitario}
                        onChange={(e) => actualizarItem(item.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Descuento %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.descuento}
                        onChange={(e) => actualizarItem(item.id, 'descuento', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98]"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => eliminarItem(item.id)}
                        className="w-full px-3 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                    <div className="md:col-span-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                      <input
                        type="text"
                        value={item.descripcion}
                        onChange={(e) => actualizarItem(item.id, 'descripcion', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98]"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {formData.items.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No hay items pre-cargados. Agrega uno para continuar.
                </div>
              )}
            </div>
          </div>

          {/* Totales */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-semibold">Subtotal:</span>
              <span className="text-xl font-bold text-gray-800">
                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totales.subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-semibold">IVA 19%:</span>
              <span className="text-xl font-bold text-gray-800">
                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totales.iva)}
              </span>
            </div>
            <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
              <span className="text-gray-800 font-bold text-lg">TOTAL:</span>
              <span className="text-2xl font-bold" style={{ color: '#235250' }}>
                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totales.total)}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-sm font-semibold text-gray-700">Facturar a:</p>
              <p className="text-gray-800 font-medium">Maria Paula Ross EIRL</p>
              <p className="text-gray-600">76.226.767-5</p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
            >
              Crear Orden de Compra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Nuevo Protocolo (mantener el existente o simplificado)
// Modal Nuevo Protocolo (Adjudicar Venta)
const NuevoProtocoloModal = ({ onClose, onSave, sharedCotizaciones }) => {
 const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCotizacion, setSelectedCotizacion] = useState('');

  useEffect(() => {
    const cargarCotizaciones = async () => {
      try {
        setLoading(true);
        const data = await getCotizaciones();
        const transformadas = data.map(cot => ({
          id: cot.id,
          numero: cot.numero,
          cliente: cot.clientes?.razon_social || cot.razon_social || 'Sin cliente',
          monto: parseFloat(cot.monto),
          estado: cot.estado,
          adjudicada_a_protocolo: cot.adjudicada_a_protocolo
        }));
        setCotizaciones(transformadas);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarCotizaciones();
  }, []);

  const cotizacionesGanadas = cotizaciones.filter(c => 
    c.estado === 'ganada' && !c.adjudicada_a_protocolo
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCotizacion) {
      alert('Por favor selecciona una cotización');
      return;
    }
    
    const cotizacion = cotizacionesGanadas.find(c => c.numero === selectedCotizacion);
    
    if (!cotizacion) {
      alert('Cotización no encontrada');
      return;
    }
    
    // Llamar a onSave que ya está conectado a Supabase
    onSave(cotizacion);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Adjudicar Venta - Crear Protocolo</h3>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seleccionar Cotización Ganada *
            </label>
            <select
              required
              value={selectedCotizacion}
              onChange={(e) => setSelectedCotizacion(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98] bg-white"
            >
              <option value="">Seleccione una cotización...</option>
              {cotizacionesGanadas.map((cot) => (
                <option key={cot.numero} value={cot.numero}>
                  #{cot.numero} - {cot.cliente} - {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(cot.monto)}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-2">
              💡 Solo aparecen cotizaciones con estado "Ganada" que no tienen protocolo asignado
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
            >
              Crear Protocolo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Detalle Protocolo (Tablero Completo)
const DetalleProtocoloModal = ({ protocolo: protocoloInicial, onClose, onUpdate }) => {
  const [protocolo, setProtocolo] = useState(protocoloInicial);
  const [showOCClienteModal, setShowOCClienteModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showOCModal, setShowOCModal] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

  const agregarOCCliente = (numeroOC) => {
    const actualizado = { ...protocolo, ocCliente: numeroOC };
    setProtocolo(actualizado);
    onUpdate(actualizado);
  };

  const cambiarEstado = (nuevoEstado) => {
    const actualizado = { ...protocolo, estado: nuevoEstado };
    setProtocolo(actualizado);
    onUpdate(actualizado);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl my-8">
        {/* Header del Protocolo */}
        <div className="p-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">Protocolo {protocolo.folio}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white text-sm">
                <div>
                  <p className="text-white/70">Cliente:</p>
                  <p className="font-semibold">{protocolo.cliente}</p>
                </div>
                <div>
                  <p className="text-white/70">RUT:</p>
                  <p className="font-semibold">{protocolo.rutCliente}</p>
                </div>
                <div>
                  <p className="text-white/70">N° Cotización:</p>
                  <p className="font-semibold">#{protocolo.numeroCotizacion}</p>
                </div>
                <div>
                  <p className="text-white/70">Código Cliente:</p>
                  <p className="font-semibold">{protocolo.numeroCliente}</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <XCircle className="w-8 h-8" />
            </button>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowOCClienteModal(true)}
              className="px-4 py-2 bg-white text-[#235250] rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>OC Cliente</span>
              {protocolo.ocCliente && <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">✓</span>}
            </button>
            <button
              onClick={() => setShowAddItemModal(true)}
              className="px-4 py-2 bg-white text-[#235250] rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Package className="w-4 h-4" />
              <span>Adjudicar Compra</span>
            </button>
            <button className="px-4 py-2 bg-white text-[#235250] rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              PDF
            </button>
            <select
              value={protocolo.estado}
              onChange={(e) => cambiarEstado(e.target.value)}
              className="px-4 py-2 bg-white text-[#235250] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <option value="Abierto">Abierto</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Despachado Parcial">Despachado Parcial</option>
              <option value="Cerrado">Cerrado</option>
              <option value="Anulado">Anulado</option>
            </select>
          </div>
        </div>

        {/* Tabla de Items */}
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-bold text-gray-800">Items del Protocolo</h4>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Tipo: <span className="font-semibold">{protocolo.tipo}</span>
              </span>
              <span className="text-sm text-gray-600">
                OC Cliente: <span className="font-semibold">{protocolo.ocCliente || 'Sin asignar'}</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">N°</th>
                  <th className="px-3 py-2 text-left font-semibold">Cant</th>
                  <th className="px-3 py-2 text-left font-semibold">Descripción</th>
                  <th className="px-3 py-2 text-left font-semibold">Proveedor 1</th>
                  <th className="px-3 py-2 text-left font-semibold">Cant</th>
                  <th className="px-3 py-2 text-left font-semibold">OC</th>
                  <th className="px-3 py-2 text-left font-semibold">Factura</th>
                  <th className="px-3 py-2 text-left font-semibold">Estado Pago</th>
                  <th className="px-3 py-2 text-left font-semibold">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {protocolo.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 font-mono">{item.id}</td>
                    <td className="px-3 py-3">{item.cantidad}</td>
                    <td className="px-3 py-3 font-medium">{item.descripcion}</td>
                    <td className="px-3 py-3">{item.proveedor1?.nombre || '-'}</td>
                    <td className="px-3 py-3">{item.proveedor1?.cantidad || '-'}</td>
                    <td className="px-3 py-3 font-mono text-xs">{item.proveedor1?.oc || '-'}</td>
                    <td className="px-3 py-3">
                      {item.proveedor1?.factura ? (
                        <span className="text-green-600 font-medium">{item.proveedor1.factura}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.proveedor1?.estadoPago === 'Pagada' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.proveedor1?.estadoPago || 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-bold text-[#45ad98]">{item.porcentaje}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {protocolo.items.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No hay items en este protocolo</p>
              <button
                onClick={() => setShowAddItemModal(true)}
                className="px-6 py-3 bg-[#45ad98] text-white rounded-xl font-semibold hover:bg-[#235250] transition-colors"
              >
                Agregar Primer Item
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              Última actualización: {new Date().toLocaleDateString('es-CL')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
          >
            Cerrar Tablero
          </button>
        </div>

        {/* Sub-modales */}
        {showOCClienteModal && (
          <OCClienteModal 
            onClose={() => setShowOCClienteModal(false)}
            onSave={(oc) => {
              agregarOCCliente(oc);
              setShowOCClienteModal(false);
            }}
          />
        )}

        {showAddItemModal && (
          <AddItemModal 
            onClose={() => setShowAddItemModal(false)}
            onSave={(item) => {
              const actualizado = {
                ...protocolo,
                items: [...protocolo.items, { ...item, id: protocolo.items.length + 1 }]
              };
              setProtocolo(actualizado);
              onUpdate(actualizado);
              setShowAddItemModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Modal OC Cliente
const OCClienteModal = ({ onClose, onSave }) => {
  const [numeroOC, setNumeroOC] = useState('');

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b">
          <h4 className="text-xl font-bold text-gray-800">Ingresar OC del Cliente</h4>
        </div>
        <div className="p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Número de OC</label>
          <input
            type="text"
            value={numeroOC}
            onChange={(e) => setNumeroOC(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
            placeholder="Ej: OC-2025-001"
          />
        </div>
        <div className="p-6 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(numeroOC)}
            className="px-4 py-2 bg-[#45ad98] text-white rounded-lg font-semibold"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal Agregar Item
const AddItemModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    cantidad: 1,
    descripcion: '',
    proveedor1: { nombre: '', cantidad: 0, oc: '', factura: '', estadoPago: 'Pendiente' },
    porcentaje: 0
  });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="p-6 border-b">
          <h4 className="text-xl font-bold text-gray-800">Adjudicar Compra - Nuevo Item</h4>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad *</label>
              <input
                type="number"
                value={formData.cantidad}
                onChange={(e) => setFormData({...formData, cantidad: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción *</label>
              <input
                type="text"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              />
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h5 className="font-semibold text-gray-700 mb-3">Proveedor 1</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Proveedor</label>
                <input
                  type="text"
                  value={formData.proveedor1.nombre}
                  onChange={(e) => setFormData({...formData, proveedor1: {...formData.proveedor1, nombre: e.target.value}})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad</label>
                <input
                  type="number"
                  value={formData.proveedor1.cantidad}
                  onChange={(e) => setFormData({...formData, proveedor1: {...formData.proveedor1, cantidad: parseInt(e.target.value)}})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">N° OC</label>
                <input
                  type="text"
                  value={formData.proveedor1.oc}
                  onChange={(e) => setFormData({...formData, proveedor1: {...formData.proveedor1, oc: e.target.value}})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-[#45ad98] text-white rounded-lg font-semibold"
          >
            Agregar Item
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente de Módulo de Clientes
const ClientesModule = () => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
 const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar clientes desde Supabase
  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await getClientes();
      
      const transformados = data.map(c => ({
        id: c.id,
        codigo: c.codigo,
        razonSocial: c.razon_social,
        rut: c.rut,
        giro: c.giro,
        direccion: c.direccion,
        ciudad: c.ciudad,
        comuna: c.comuna,
        pais: c.pais,
        email: c.email,
        personaEncargada: c.persona_encargada,
        telefono: c.telefono,
        observaciones: c.observaciones,
        fechaCreacion: c.created_at
      }));
      
      setClientes(transformados);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(cliente => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cliente.codigo.includes(searchTerm) ||
      cliente.razonSocial.toLowerCase().includes(searchLower) ||
      cliente.rut.includes(searchTerm) ||
      cliente.email.toLowerCase().includes(searchLower)
    );
  });

  const eliminarCliente = async (id) => {
    if (confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
      try {
        await deleteCliente(id);
        await loadClientes();
        alert('Cliente eliminado exitosamente');
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar cliente');
      }
    }
  };

  const exportarExcel = () => {
    // Preparar datos para CSV (compatible con Excel)
    const headers = ['Código', 'Razón Social', 'RUT', 'Giro', 'Dirección', 'Ciudad', 'Comuna', 'País', 'Email', 'Persona Encargada', 'Teléfono', 'Observaciones'];
    const rows = clientes.map(c => [
      c.codigo,
      c.razonSocial,
      c.rut,
      c.giro,
      c.direccion,
      c.ciudad,
      c.comuna,
      c.pais,
      c.email,
      c.personaEncargada,
      c.telefono,
      c.observaciones
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell || ''}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Clientes_BuildingMe_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Clientes</h2>
          <p className="text-gray-600">Base de datos de clientes de Building Me</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportarExcel}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl border-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            style={{ borderColor: '#45ad98', color: '#45ad98' }}
          >
            <Download className="w-5 h-5" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
          >
            <Users className="w-5 h-5" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-sm text-gray-500 mb-1">Total Clientes</p>
          <p className="text-2xl font-bold text-gray-800">{clientes.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow">
          <p className="text-sm text-green-600 mb-1">Activos</p>
          <p className="text-2xl font-bold text-green-800">{clientes.length}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 shadow">
          <p className="text-sm text-blue-600 mb-1">Nuevos (Este Mes)</p>
          <p className="text-2xl font-bold text-blue-800">2</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 shadow">
          <p className="text-sm text-purple-600 mb-1">Último Código</p>
          <p className="text-2xl font-bold text-purple-800">
            {clientes.length > 0 ? Math.max(...clientes.map(c => parseInt(c.codigo))) : '1000'}
          </p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        <input
          type="text"
          placeholder="Buscar por código, razón social, RUT o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
        />
      </div>

      {/* Listado de Clientes */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#45ad98' }}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Código</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Razón Social</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">RUT</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Contacto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Ciudad</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-lg" style={{ color: '#235250' }}>{cliente.codigo}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800">{cliente.razonSocial}</p>
                      <p className="text-sm text-gray-500">{cliente.giro}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{cliente.rut}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{cliente.personaEncargada}</p>
                      <p className="text-sm text-gray-500">{cliente.telefono}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{cliente.ciudad}, {cliente.comuna}</td>
                  <td className="px-6 py-4 text-gray-600">{cliente.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setClienteSeleccionado(cliente);
                          setShowHistorialModal(true);
                        }}
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                        title="Ver Historial"
                      >
                        <FileText className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => {
                          setClienteSeleccionado(cliente);
                          setShowEditModal(true);
                        }}
                        className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Building2 className="w-4 h-4 text-yellow-600" />
                      </button>
                      <button
                        onClick={() => eliminarCliente(cliente.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {clientesFiltrados.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No se encontraron clientes</p>
          </div>
        )}
      </div>

      {/* Modales */}
      {showNewModal && (
        <NuevoClienteModal 
          onClose={() => setShowNewModal(false)}
          onSave={async (nuevoCliente) => {
            try {
              // Generar código único
              const clientesExistentes = await getClientes();
              const ultimoCodigo = clientesExistentes.length > 0
                ? Math.max(...clientesExistentes.map(c => parseInt(c.codigo) || 1000))
                : 999;

              const clienteData = {
                codigo: `${ultimoCodigo + 1}`,
                razon_social: nuevoCliente.razonSocial,
                rut: nuevoCliente.rut,
                giro: nuevoCliente.giro,
                direccion: nuevoCliente.direccion,
                ciudad: nuevoCliente.ciudad,
                comuna: nuevoCliente.comuna,
                pais: nuevoCliente.pais,
                email: nuevoCliente.email,
                persona_encargada: nuevoCliente.personaEncargada,
                telefono: nuevoCliente.telefono,
                observaciones: nuevoCliente.observaciones || ''
              };

              await createCliente(clienteData);
              await loadClientes();

              setShowNewModal(false);
              alert('Cliente creado exitosamente');
            } catch (error) {
              console.error('Error:', error);
              alert('Error al crear cliente');
            }
          }}
        />
      )}

      {showEditModal && clienteSeleccionado && (
        <EditarClienteModal 
          cliente={clienteSeleccionado}
          onClose={() => {
            setShowEditModal(false);
            setClienteSeleccionado(null);
          }}
          onSave={async (clienteActualizado) => {
            try {
              const clienteData = {
                razon_social: clienteActualizado.razonSocial,
                rut: clienteActualizado.rut,
                giro: clienteActualizado.giro,
                direccion: clienteActualizado.direccion,
                ciudad: clienteActualizado.ciudad,
                comuna: clienteActualizado.comuna,
                pais: clienteActualizado.pais,
                email: clienteActualizado.email,
                persona_encargada: clienteActualizado.personaEncargada,
                telefono: clienteActualizado.telefono,
                observaciones: clienteActualizado.observaciones || ''
              };

              await updateCliente(clienteActualizado.id, clienteData);
              await loadClientes();

              setShowEditModal(false);
              setClienteSeleccionado(null);
              alert('Cliente actualizado exitosamente');
            } catch (error) {
              console.error('Error:', error);
              alert('Error al actualizar cliente');
            }
          }}
        />
      )}

      {showHistorialModal && clienteSeleccionado && (
        <HistorialClienteModal 
          cliente={clienteSeleccionado}
          onClose={() => {
            setShowHistorialModal(false);
            setClienteSeleccionado(null);
          }}
        />
      )}
    </div>
  );
};

// Modal Nuevo Cliente
const NuevoClienteModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    razonSocial: '',
    rut: '',
    giro: '',
    direccion: '',
    ciudad: '',
    comuna: '',
    pais: 'Chile',
    email: '',
    personaEncargada: '',
    telefono: '',
    observaciones: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        <div className="p-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Nuevo Cliente</h3>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Información Básica */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Información Básica</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Razón Social *</label>
                <input
                  type="text"
                  required
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({...formData, razonSocial: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">RUT *</label>
                <input
                  type="text"
                  required
                  value={formData.rut}
                  onChange={(e) => setFormData({...formData, rut: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                  placeholder="12.345.678-9"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Giro/Rubro *</label>
                <input
                  type="text"
                  required
                  value={formData.giro}
                  onChange={(e) => setFormData({...formData, giro: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Ubicación</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad *</label>
                <input
                  type="text"
                  required
                  value={formData.ciudad}
                  onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Comuna *</label>
                <input
                  type="text"
                  required
                  value={formData.comuna}
                  onChange={(e) => setFormData({...formData, comuna: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">País *</label>
                <input
                  type="text"
                  required
                  value={formData.pais}
                  onChange={(e) => setFormData({...formData, pais: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Contacto</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Persona Encargada *</label>
                <input
                  type="text"
                  required
                  value={formData.personaEncargada}
                  onChange={(e) => setFormData({...formData, personaEncargada: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono *</label>
                <input
                  type="text"
                  required
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                  placeholder="+56 9 1234 5678"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                  placeholder="contacto@empresa.cl"
                />
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Observaciones</label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
              rows="3"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              placeholder="Notas adicionales sobre el cliente..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
            >
              Crear Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Editar Cliente (similar al de crear)
const EditarClienteModal = ({ cliente, onClose, onSave }) => {
  const [formData, setFormData] = useState(cliente);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        <div className="p-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Editar Cliente</h3>
              <p className="text-white/80 text-sm">Código: {cliente.codigo}</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Mismo formulario que NuevoClienteModal pero con datos precargados */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Información Básica</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Razón Social *</label>
                <input
                  type="text"
                  required
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({...formData, razonSocial: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">RUT *</label>
                <input
                  type="text"
                  required
                  value={formData.rut}
                  onChange={(e) => setFormData({...formData, rut: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Giro/Rubro *</label>
                <input
                  type="text"
                  required
                  value={formData.giro}
                  onChange={(e) => setFormData({...formData, giro: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Ubicación</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad *</label>
                <input
                  type="text"
                  required
                  value={formData.ciudad}
                  onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Comuna *</label>
                <input
                  type="text"
                  required
                  value={formData.comuna}
                  onChange={(e) => setFormData({...formData, comuna: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">País *</label>
                <input
                  type="text"
                  required
                  value={formData.pais}
                  onChange={(e) => setFormData({...formData, pais: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Contacto</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Persona Encargada *</label>
                <input
                  type="text"
                  required
                  value={formData.personaEncargada}
                  onChange={(e) => setFormData({...formData, personaEncargada: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono *</label>
                <input
                  type="text"
                  required
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Observaciones</label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
              rows="3"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Historial Cliente
const HistorialClienteModal = ({ cliente, onClose }) => {
  // Datos de ejemplo - en producción vendrían de la base de datos
  const cotizaciones = [
    {
      numero: '000001',
      fecha: '2025-01-15',
      monto: 5500000,
      estado: 'ganada'
    },
    {
      numero: '000003',
      fecha: '2025-01-20',
      monto: 3200000,
      estado: 'emitida'
    }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'emitida': return 'bg-blue-100 text-blue-800';
      case 'ganada': return 'bg-green-100 text-green-800';
      case 'perdida': return 'bg-red-100 text-red-800';
      case 'standby': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl">
        <div className="p-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Historial de Cotizaciones</h3>
              <p className="text-white/80">{cliente.razonSocial} - Código: {cliente.codigo}</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {cotizaciones.length > 0 ? (
            <div className="space-y-4">
              {cotizaciones.map((cot) => (
                <div key={cot.numero} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-lg" style={{ color: '#235250' }}>
                        Cotización #{cot.numero}
                      </p>
                      <p className="text-sm text-gray-600">{cot.fecha}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-gray-800">
                     {cot.monto < 1000 ? (
                       <span className="text-orange-600">Por Definir</span>
                       ) : (
                      formatCurrency(cot.monto)
                       )}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getEstadoColor(cot.estado)}`}>
                        {cot.estado.charAt(0).toUpperCase() + cot.estado.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Este cliente aún no tiene cotizaciones</p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Módulo de Cotizaciones
const CotizacionesModule = ({ onAdjudicarVenta }) => {
const [showNewModal, setShowNewModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todas');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

// Cargar cotizaciones desde Supabase
  useEffect(() => {
    loadCotizaciones();
  }, []);

  const loadCotizaciones = async () => {
    try {
      setLoading(true);
      const data = await getCotizaciones();
      
      // Transformar datos de Supabase al formato del frontend
      const cotizacionesTransformadas = data.map(cot => ({
        id: cot.id,
        numero: cot.numero,
        fecha: cot.fecha,
        cliente: cot.clientes?.razon_social || 'Sin cliente',
        nombreProyecto: cot.nombre_proyecto,
        rut: cot.clientes?.rut || '',
        unidadNegocio: cot.unidad_negocio,
        monto: parseFloat(cot.monto),
        estado: cot.estado,
        cotizadoPor: cot.cotizado_por,
        condicionesPago: cot.condiciones_pago,
        adjudicada_a_protocolo: cot.adjudicada_a_protocolo
      }));
      
      setCotizaciones(cotizacionesTransformadas);
    } catch (error) {
      console.error('Error cargando cotizaciones:', error);
      alert('Error al cargar cotizaciones desde la base de datos');
    } finally {
      setLoading(false);
    }
  };

  const generarPDFCotizacion = (cotizacion) => {
    try {
      generarCotizacionPDF(cotizacion, null, []);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar PDF');
    }
  };

  // Estadísticas
  const stats = {
    total: cotizaciones.length,
    emitidas: cotizaciones.filter(c => c.estado === 'emitida').length,
    ganadas: cotizaciones.filter(c => c.estado === 'ganada').length,
    perdidas: cotizaciones.filter(c => c.estado === 'perdida').length,
    standby: cotizaciones.filter(c => c.estado === 'standby').length,
    montoTotal: cotizaciones.reduce((sum, c) => sum + c.monto, 0)
  };

  // Filtrar cotizaciones
  const cotizacionesFiltradas = cotizaciones.filter(cot => {
    const matchSearch = cot.numero.includes(searchTerm) || 
                       cot.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filterEstado === 'todas' || cot.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await updateCotizacion(id, { estado: nuevoEstado });
      await loadCotizaciones();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al cambiar estado');
    }
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'emitida': return 'bg-blue-100 text-blue-800';
      case 'ganada': return 'bg-green-100 text-green-800';
      case 'perdida': return 'bg-red-100 text-red-800';
      case 'standby': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatMonto = (monto) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(monto);
  };
  
// Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#45ad98] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cotizaciones...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Cotizaciones</h2>
          <p className="text-gray-600">Gestión de cotizaciones y propuestas comerciales</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
        >
          <FileText className="w-5 h-5" />
          <span>Nueva Cotización</span>
        </button>
      </div>

      {/* Mini Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-sm text-gray-500 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 shadow">
          <p className="text-sm text-blue-600 mb-1">Emitidas</p>
          <p className="text-2xl font-bold text-blue-800">{stats.emitidas}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow">
          <p className="text-sm text-green-600 mb-1">Ganadas</p>
          <p className="text-2xl font-bold text-green-800">{stats.ganadas}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 shadow">
          <p className="text-sm text-red-600 mb-1">Perdidas</p>
          <p className="text-2xl font-bold text-red-800">{stats.perdidas}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 shadow">
          <p className="text-sm text-yellow-600 mb-1">Standby</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.standby}</p>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por número o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
            />
          </div>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98] bg-white"
          >
            <option value="todas">Todos los estados</option>
            <option value="emitida">Emitidas</option>
            <option value="ganada">Ganadas</option>
            <option value="perdida">Perdidas</option>
            <option value="standby">Standby</option>
          </select>
        </div>
      </div>

      {/* Listado de Cotizaciones */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#45ad98' }}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">N° Cotización</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Fecha</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Nombre Proyecto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Unidad Negocio</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Monto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cotizacionesFiltradas.map((cot) => (
                <tr key={cot.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-semibold text-gray-800">#{cot.numero}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{cot.fecha}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800">{cot.cliente}</p>
                      <p className="text-sm text-gray-500">{cot.rut}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">{cot.nombreProyecto || 'Sin nombre'}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{cot.unidadNegocio}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{formatMonto(cot.monto)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(cot.estado)}`}>
                      {cot.estado.charAt(0).toUpperCase() + cot.estado.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {cot.estado === 'emitida' && (
                        <>
                          <button
                            onClick={() => cambiarEstado(cot.id, 'ganada')}
                            className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                            title="Marcar como Ganada"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => cambiarEstado(cot.id, 'perdida')}
                            className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                            title="Marcar como Perdida"
                          >
                            <XCircle className="w-4 h-4 text-red-600" />
                          </button>
                          <button
                            onClick={() => cambiarEstado(cot.id, 'standby')}
                            className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
                            title="Marcar como Standby"
                          >
                            <Pause className="w-4 h-4 text-yellow-600" />
                          </button>
                        </>
                      )}
                      {/* Crear Protocolo (solo si está ganada) */}
                      {cot.estado === 'ganada' && (
                        <button
                          onClick={() => onAdjudicarVenta(cot)}
                          className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                          title="Crear Protocolo"
                        >
                          <Package className="w-4 h-4 text-purple-600" />
                        </button>
                      )}
                      {/* Ver Detalle */}
                      <button
                        onClick={() => {
                          setCotizacionSeleccionada(cot);
                          setShowDetalleModal(true);
                        }}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Ver Detalle"
                      >
                        <FileText className="w-4 h-4 text-gray-600" />
                      </button>
                      {/* Editar */}
                      <button
                        onClick={() => {
                          setCotizacionSeleccionada(cot);
                          setShowEditModal(true);
                        }}
                        className="p-2 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                        title="Editar Cotización"
                      >
                        <Settings className="w-4 h-4 text-orange-600" />
                      </button>
                      {/* Descargar PDF */}
                      <button
                        onClick={() => generarPDFCotizacion(cot)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                        title="Descargar PDF"
                      >
                        <Download className="w-4 h-4 text-blue-600" />
                      </button>
                      {/* Eliminar */}
                      <button
                        onClick={async () => {
                          if (window.confirm('¿Estás seguro de eliminar esta cotización?')) {
                            try {
                              await deleteCotizacion(cot.id);
                              await loadCotizaciones();
                              alert('Cotización eliminada');
                            } catch (error) {
                              console.error('Error:', error);
                              alert('Error al eliminar');
                            }
                          }
                        }}
                        className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                        title="Eliminar Cotización"
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cotizacionesFiltradas.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No se encontraron cotizaciones</p>
          </div>
        )}
      </div>

      {/* Modal Nueva Cotización */}
      {showNewModal && (
        <NuevaCotizacionModal 
          onClose={() => setShowNewModal(false)}
          onSave={async (nuevaCotizacion) => {
            try {
              // Preparar datos para Supabase
              const cotizacionData = {
                numero: nuevaCotizacion.numero,
                fecha: nuevaCotizacion.fecha,
                cliente_id: null, // Por ahora null, después conectaremos clientes
                nombre_proyecto: nuevaCotizacion.nombreProyecto,
                unidad_negocio: nuevaCotizacion.unidadNegocio,
                condiciones_pago: nuevaCotizacion.condicionesPago,
                monto: nuevaCotizacion.monto,
                estado: 'emitida',
                cotizado_por: nuevaCotizacion.cotizadoPor
              };

              // Guardar en Supabase
              await createCotizacion(cotizacionData);
              
              // Recargar cotizaciones
              await loadCotizaciones();
              
              setShowNewModal(false);
              alert('Cotización guardada exitosamente');
            } catch (error) {
              console.error('Error guardando cotización:', error);
              alert('Error al guardar la cotización');
            }
          }}
        />
      )}
      
      {/* Modal Ver Detalle */}
      {showDetalleModal && cotizacionSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Detalle Cotización #{cotizacionSeleccionada.numero}</h3>
                <button onClick={() => setShowDetalleModal(false)} className="text-white hover:bg-white/20 p-2 rounded-lg">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-bold text-lg">{cotizacionSeleccionada.cliente}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nombre Proyecto</p>
                  <p className="font-bold text-lg">{cotizacionSeleccionada.nombreProyecto}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">RUT</p>
                  <p className="font-semibold">{cotizacionSeleccionada.rut}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unidad de Negocio</p>
                  <p className="font-semibold">{cotizacionSeleccionada.unidadNegocio}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-semibold">{cotizacionSeleccionada.fecha}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monto</p>
                  <p className="font-bold text-2xl" style={{color: '#235250'}}>{formatCurrency(cotizacionSeleccionada.monto)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Editar */}
      {showEditModal && cotizacionSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Editar Cotización #{cotizacionSeleccionada.numero}</h3>
                <button onClick={() => setShowEditModal(false)} className="text-white hover:bg-white/20 p-2 rounded-lg">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">Funcionalidad de edición en desarrollo.</p>
              <p className="text-sm text-gray-500">Aquí se mostrará el formulario para editar la cotización.</p>
              <button 
                onClick={() => setShowEditModal(false)}
                className="mt-4 px-6 py-3 rounded-xl text-white font-semibold"
                style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente Modal para Nueva Cotización
const NuevaCotizacionModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    codigoCliente: '',
    cliente: '',
    nombreProyecto: '',
    razonSocial: '',
    rut: '',
    direccion: '',
    contacto: '',
    telefono: '',
    fecha: new Date().toISOString().split('T')[0],
    condicionesPago: '',
    cotizadoPor: '',
    unidadNegocio: '',
    observaciones: '',
    items: [
      { id: 1, item: '', cantidad: 1, descripcion: '', valorUnitario: 0, descuento: 0 }
    ]
  });

  const [clientes, setClientes] = useState([]);
  const [clientesError, setClientesError] = useState('');

  useEffect(() => {
    const loadClientes = async () => {
      try {
        setClientesError('');
        const data = await getClientes();
        const transformados = data.map(c => ({
          id: c.id,
          codigo: c.codigo,
          razonSocial: c.razon_social,
          rut: c.rut,
          direccion: c.direccion,
          contacto: c.persona_encargada,
          telefono: c.telefono
        }));
        setClientes(transformados);
      } catch (error) {
        console.error('Error cargando clientes:', error);
        setClientesError('No se pudieron cargar los clientes');
      }
    };

    loadClientes();
  }, []);

  const buscarCliente = (codigo) => {
    const codigoNormalizado = codigo.trim();
    if (!codigoNormalizado) return;
    const cliente = clientes.find(c => String(c.codigo) === codigoNormalizado);
    if (cliente) {
      setFormData(prev => ({
        ...prev,
        codigoCliente: codigo,
        cliente: cliente.razonSocial,
        razonSocial: cliente.razonSocial,
        rut: cliente.rut,
        direccion: cliente.direccion,
        contacto: cliente.contacto,
        telefono: cliente.telefono
      }));
    }
  };

  const agregarItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { 
        id: prev.items.length + 1, 
        item: '', 
        cantidad: 1, 
        descripcion: '', 
        valorUnitario: 0, 
        descuento: 0 
      }]
    }));
  };

  const eliminarItem = (id) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const actualizarItem = (id, campo, valor) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [campo]: valor } : item
      )
    }));
  };

  const calcularSubtotalItem = (item) => {
    const subtotal = item.cantidad * item.valorUnitario;
    const descuento = subtotal * (item.descuento / 100);
    return subtotal - descuento;
  };

  const calcularTotales = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + calcularSubtotalItem(item), 0);
    const iva = subtotal * 0.19;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // Obtener todas las cotizaciones para calcular el siguiente número
    const cotizaciones = await getCotizaciones();
    const ultimoNumero = cotizaciones.length > 0
      ? Math.max(...cotizaciones.map(c => parseInt(c.numero) || 5540))
      : 5540;
    
    const { total } = calcularTotales();
    const nuevaCotizacion = {
      numero: `${ultimoNumero + 1}`,
      ...formData,
      monto: total,
      estado: 'emitida'
    };
    
    onSave(nuevaCotizacion);
  } catch (error) {
    console.error('Error:', error);
    alert('Error al crear cotización');
  }
};

  const totales = calcularTotales();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8">
        <div className="p-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Nueva Cotización</h3>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Datos del Cliente */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-[#45ad98]" />
              Datos del Cliente
            </h4>
            
            {/* Campo de Código de Cliente */}
            <div className="mb-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <label className="block text-sm font-semibold text-blue-800 mb-2">
                🔍 Código de Cliente (Ingresa el código para autocompletar)
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={formData.codigoCliente}
                  onChange={(e) => setFormData({...formData, codigoCliente: e.target.value})}
                  onBlur={(e) => buscarCliente(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 font-mono text-lg font-bold"
                  placeholder="Ej: 1000"
                />
                <button
                  type="button"
                  onClick={() => buscarCliente(formData.codigoCliente)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Buscar
                </button>
              </div>
              {clientesError && (
                <p className="text-xs text-red-600 mt-2">{clientesError}</p>
              )}
              <p className="text-xs text-blue-600 mt-2">
                💡 Tip: Ingresa el código de 4 dígitos del cliente para llenar automáticamente sus datos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Razón Social *</label>
                <input
                  type="text"
                  required
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({...formData, razonSocial: e.target.value, cliente: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">RUT *</label>
                <input
                  type="text"
                  required
                  value={formData.rut}
                  onChange={(e) => setFormData({...formData, rut: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                  placeholder="12.345.678-9"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del Proyecto * 
                <span className="text-xs text-gray-500 ml-2">Para identificar rápidamente</span>
              </label>
              <input
                type="text"
                required
                value={formData.nombreProyecto}
                onChange={(e) => setFormData({...formData, nombreProyecto: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                placeholder="Ej: Stand Feria Inmobiliaria 2025"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contacto</label>
                <input
                  type="text"
                  value={formData.contacto}
                  onChange={(e) => setFormData({...formData, contacto: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">N° Contacto</label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                  placeholder="+56 9 1234 5678"
                />
              </div>
            </div>
          </div>

          {/* Datos de la Cotización */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-[#45ad98]" />
              Datos de la Cotización
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Unidad de Negocio *</label>
                <select
                  required
                  value={formData.unidadNegocio}
                  onChange={(e) => setFormData({...formData, unidadNegocio: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98] bg-white"
                  style={{ fontWeight: '600' }}
                >
                  <option value="">Seleccione...</option>
                  {BUSINESS_UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">📊 Para análisis interno (no sale en PDF)</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha *</label>
                <input
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cotizado por *</label>
                <input
                  type="text"
                  required
                  value={formData.cotizadoPor}
                  onChange={(e) => setFormData({...formData, cotizadoPor: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Condiciones de Pago *</label>
                <select
                  required
                  value={formData.condicionesPago}
                  onChange={(e) => setFormData({...formData, condicionesPago: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98] bg-white"
                >
                  <option value="">Seleccione...</option>
                  <option value="Contado">Contado</option>
                  <option value="50% Adelanto">50% Adelanto</option>
                  <option value="Crédito 30 días">Crédito 30 días</option>
                  <option value="Crédito 60 días">Crédito 60 días</option>
                  <option value="Crédito 90 días">Crédito 90 días</option>
                </select>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                <Package className="w-5 h-5 mr-2 text-[#45ad98]" />
                Items
              </h4>
              <button
                type="button"
                onClick={agregarItem}
                className="px-4 py-2 bg-[#45ad98] text-white rounded-lg hover:bg-[#235250] transition-colors text-sm font-semibold"
              >
                + Agregar Item
              </button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={item.id} className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Item #{index + 1}</span>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => eliminarItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Item</label>
                      <input
                        type="text"
                        value={item.item}
                        onChange={(e) => actualizarItem(item.id, 'item', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#45ad98] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => actualizarItem(item.id, 'cantidad', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#45ad98] text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Descripción</label>
                      <input
                        type="text"
                        value={item.descripcion}
                        onChange={(e) => actualizarItem(item.id, 'descripcion', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#45ad98] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">V. Unitario</label>
                      <input
                        type="number"
                        min="0"
                        value={item.valorUnitario}
                        onChange={(e) => actualizarItem(item.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#45ad98] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Descuento %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.descuento}
                        onChange={(e) => actualizarItem(item.id, 'descuento', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#45ad98] text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-sm font-semibold text-gray-700">
                      Subtotal: {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(calcularSubtotalItem(item))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Observaciones */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Observaciones</label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
              rows="3"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              placeholder="Información adicional..."
            />
          </div>

          {/* Totales */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-semibold">Subtotal:</span>
              <span className="text-xl font-bold text-gray-800">
                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totales.subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-semibold">IVA 19%:</span>
              <span className="text-xl font-bold text-gray-800">
                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totales.iva)}
              </span>
            </div>
            <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
              <span className="text-gray-800 font-bold text-lg">TOTAL:</span>
              <span className="text-2xl font-bold" style={{ color: '#235250' }}>
                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totales.total)}
              </span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                const { total } = calcularTotales();
                const cotizacion = {
                  numero: (Math.floor(Math.random() * 900000) + 100000).toString(),
                  ...formData,
                  monto: total
                };
                generarPDFCotizacion(cotizacion);
              }}
              className="px-6 py-3 border-2 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
              style={{ borderColor: '#45ad98', color: '#45ad98' }}
            >
              <Download className="w-5 h-5" />
              <span>Vista Previa PDF</span>
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
            >
              Crear Cotización
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente de Dashboard
const Dashboard = ({ user, onLogout }) => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [selectedUnit, setSelectedUnit] = useState('Todas');

  // ===== ESTADOS COMPARTIDOS ENTRE MÓDULOS =====
  const [sharedCotizaciones, setSharedCotizaciones] = useState([]);
  const [sharedProtocolos, setSharedProtocolos] = useState([]);
  const [sharedOrdenesCompra, setSharedOrdenesCompra] = useState([]);
  const [datosPreOC, setDatosPreOC] = useState(null);
  const [protocoloParaAbrir, setProtocoloParaAbrir] = useState(null);

  useEffect(() => {
    const mapCotizacion = (cot) => ({
      id: cot.id,
      numero: cot.numero,
      fecha: cot.fecha,
      cliente: cot.clientes?.razon_social || 'Sin cliente',
      nombreProyecto: cot.nombre_proyecto,
      rut: cot.clientes?.rut || '',
      unidadNegocio: cot.unidad_negocio,
      monto: parseFloat(cot.monto) || 0,
      estado: cot.estado,
      cotizadoPor: cot.cotizado_por,
      condicionesPago: cot.condiciones_pago,
      adjudicada_a_protocolo: cot.adjudicada_a_protocolo
    });

    const mapProtocolo = (p) => ({
      id: p.id,
      folio: p.folio,
      numeroCotizacion: p.numero_cotizacion || '',
      cliente: p.clientes?.razon_social || 'Sin cliente',
      nombreProyecto: p.nombre_proyecto,
      rutCliente: p.clientes?.rut || '',
      tipo: p.tipo,
      ocCliente: p.oc_cliente,
      estado: p.estado,
      unidadNegocio: p.unidad_negocio,
      fechaCreacion: p.fecha_creacion,
      montoTotal: parseFloat(p.monto_total) || 0,
      items: []
    });

    const mapOrdenCompra = (o) => ({
      id: o.id,
      numero: o.numero,
      codigoProtocolo: o.codigo_protocolo,
      fecha: o.fecha,
      proveedor: o.proveedores?.razon_social || 'Sin proveedor',
      rutProveedor: o.proveedores?.rut || '',
      tipoCosto: o.tipo_costo,
      formaPago: o.forma_pago,
      subtotal: parseFloat(o.subtotal) || 0,
      iva: parseFloat(o.iva) || 0,
      total: parseFloat(o.total) || 0,
      estado: o.estado,
      numeroFactura: o.numero_factura || '',
      fechaFactura: o.fecha_factura || '',
      estadoPago: o.estado_pago || 'Pendiente',
      items: (o.ordenes_compra_items || []).map(item => ({
        id: item.id,
        cantidad: item.cantidad,
        descripcion: item.descripcion,
        valorUnitario: parseFloat(item.valor_unitario) || 0,
        valor_unitario: parseFloat(item.valor_unitario) || 0,
        descuento: parseFloat(item.descuento || 0)
      }))
    });

    const loadSharedData = async () => {
      try {
        const [cotData, protData, ocData] = await Promise.all([
          getCotizaciones(),
          getProtocolos(),
          getOrdenesCompra()
        ]);

        setSharedCotizaciones(cotData.map(mapCotizacion));
        setSharedProtocolos(protData.map(mapProtocolo));
        setSharedOrdenesCompra(ocData.map(mapOrdenCompra));
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      }
    };

    loadSharedData();
  }, []);

 // Handlers para comunicación entre módulos
  const handleAdjudicarVentaDesdeCotizacion = async (cotizacion) => {
    try {
      // Verificar si la cotización ya tiene protocolo
      if (cotizacion.adjudicada_a_protocolo) {
        alert(`Esta cotización ya tiene un protocolo asignado: ${cotizacion.adjudicada_a_protocolo}`);
        return;
      }

      // Obtener todos los protocolos para calcular el siguiente folio
      const protocolosExistentes = await getProtocolos();
      const ultimoFolio = protocolosExistentes.length > 0
        ? Math.max(...protocolosExistentes.map(p => {
            const num = parseInt(p.folio);
            return isNaN(num) ? 30650 : num;
          }))
        : 30649;

      const nuevoProtocolo = {
        folio: `${ultimoFolio + 1}`,
        numero_cotizacion: cotizacion.numero,
        cliente_id: null,
        nombre_proyecto: cotizacion.nombreProyecto,
        tipo: 'Venta',
        oc_cliente: '',
        estado: 'Abierto',
        unidad_negocio: cotizacion.unidadNegocio,
        fecha_creacion: new Date().toISOString().split('T')[0],
        monto_total: cotizacion.monto
      };

      const protocoloCreado = await createProtocolo(nuevoProtocolo);

      await updateCotizacion(cotizacion.id, {
        adjudicada_a_protocolo: protocoloCreado.folio
      });

      const [cotizacionesActualizadas, protocolosActualizados] = await Promise.all([
        getCotizaciones(),
        getProtocolos()
      ]);

      setSharedCotizaciones(cotizacionesActualizadas.map(cot => ({
        id: cot.id,
        numero: cot.numero,
        fecha: cot.fecha,
        cliente: cot.clientes?.razon_social || 'Sin cliente',
        nombreProyecto: cot.nombre_proyecto,
        rut: cot.clientes?.rut || '',
        unidadNegocio: cot.unidad_negocio,
        monto: parseFloat(cot.monto) || 0,
        estado: cot.estado,
        cotizadoPor: cot.cotizado_por,
        condicionesPago: cot.condiciones_pago,
        adjudicada_a_protocolo: cot.adjudicada_a_protocolo
      })));
      setSharedProtocolos(protocolosActualizados.map(p => ({
        id: p.id,
        folio: p.folio,
        numeroCotizacion: p.numero_cotizacion || '',
        cliente: p.clientes?.razon_social || 'Sin cliente',
        nombreProyecto: p.nombre_proyecto,
        rutCliente: p.clientes?.rut || '',
        tipo: p.tipo,
        ocCliente: p.oc_cliente,
        estado: p.estado,
        unidadNegocio: p.unidad_negocio,
        fechaCreacion: p.fecha_creacion,
        montoTotal: parseFloat(p.monto_total) || 0,
        items: []
      })));

      setProtocoloParaAbrir(protocoloCreado);
      setActiveModule('protocolos');
      
      alert('Protocolo creado exitosamente');
    } catch (error) {
      console.error('Error creando protocolo:', error);
      alert('Error al crear protocolo: ' + error.message);
    }
  };
  // ===== FIN ESTADOS COMPARTIDOS =====

  // Calcular estadísticas del dashboard desde datos reales
  const [stats, setStats] = useState({
    cotizacionesEmitidas: 0,
    cotizacionesGanadas: 0,
    cotizacionesPerdidas: 0,
    cotizacionesStandby: 0,
    montoVentas: 0,
    proyectosEnCurso: 0,
    proyectosTerminados: 0,
    protocolosAbiertos: 0,
    protocolosEnProceso: 0,
    ocSinFactura: 0,
    pagosPendientes: 0
  });

  // Actualizar estadísticas cuando cambien los datos
  useEffect(() => {
    const calcularStats = () => {
      // Filtrar cotizaciones por unidad de negocio si está seleccionada
      const cotizacionesFiltradas = selectedUnit === 'Todas'
        ? sharedCotizaciones
        : sharedCotizaciones.filter(c => c.unidadNegocio === selectedUnit);

      const protocolosFiltrados = selectedUnit === 'Todas'
        ? sharedProtocolos
        : sharedProtocolos.filter(p => p.unidadNegocio === selectedUnit);

      // Estadísticas de cotizaciones
      const cotizacionesEmitidas = cotizacionesFiltradas.filter(c => c.estado === 'emitida').length;
      const cotizacionesGanadas = cotizacionesFiltradas.filter(c => c.estado === 'ganada').length;
      const cotizacionesPerdidas = cotizacionesFiltradas.filter(c => c.estado === 'perdida').length;
      const cotizacionesStandby = cotizacionesFiltradas.filter(c => c.estado === 'standby').length;

      // Monto total de ventas (cotizaciones ganadas)
      const montoVentas = cotizacionesFiltradas
        .filter(c => c.estado === 'ganada')
        .reduce((sum, c) => sum + (c.monto || 0), 0);

      // Estadísticas de protocolos
      const protocolosAbiertos = protocolosFiltrados.filter(p => p.estado === 'Abierto').length;
      const protocolosEnProceso = protocolosFiltrados.filter(p => p.estado === 'En Proceso').length;
      const proyectosEnCurso = protocolosAbiertos + protocolosEnProceso;
      const proyectosTerminados = protocolosFiltrados.filter(p => p.estado === 'Cerrado').length;

      // Estadísticas de órdenes de compra
      const ocSinFactura = sharedOrdenesCompra.filter(o => !o.numeroFactura && o.estado !== 'Anulada').length;
      const pagosPendientes = sharedOrdenesCompra.filter(o => o.estadoPago === 'Pendiente' && o.estado !== 'Anulada').length;

      setStats({
        cotizacionesEmitidas,
        cotizacionesGanadas,
        cotizacionesPerdidas,
        cotizacionesStandby,
        montoVentas,
        proyectosEnCurso,
        proyectosTerminados,
        protocolosAbiertos,
        protocolosEnProceso,
        ocSinFactura,
        pagosPendientes
      });
    };

    calcularStats();
  }, [sharedCotizaciones, sharedProtocolos, sharedOrdenesCompra, selectedUnit]);

  // Permisos por rol
  const hasAccess = (module) => {
    if (user.role === 'admin') return true;
    if (user.role === 'compras' && ['protocolos', 'ordenes', 'proveedores', 'inventario'].includes(module)) return true;
    if (user.role === 'finanzas' && ['cotizaciones', 'clientes', 'facturacion'].includes(module)) return true;
    return false;
  };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, roles: ['admin', 'finanzas'] },
    { id: 'cotizaciones', name: 'Cotizaciones', icon: FileText, roles: ['admin', 'finanzas'] },
    { id: 'protocolos', name: 'Protocolos de Compra', icon: Package, roles: ['admin', 'compras'] },
    { id: 'ordenes', name: 'Órdenes de Compra', icon: ShoppingCart, roles: ['admin', 'compras'] },
    { id: 'inventario', name: 'Bodega/Inventario', icon: Package, roles: ['admin', 'compras'] },
    { id: 'proveedores', name: 'Proveedores', icon: Building2, roles: ['admin', 'compras'] },
    { id: 'clientes', name: 'Clientes', icon: Users, roles: ['admin', 'finanzas'] },
    { id: 'informes', name: 'Informes', icon: TrendingUp, roles: ['admin', 'finanzas'] },
    { id: 'administracion', name: 'Administración', icon: Settings, roles: ['admin'] }
  ];

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl`} style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-sm font-medium">{title}</p>
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="shadow-md" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between relative">
            {/* Logo KODIAK a la izquierda */}
            <div className="flex items-center space-x-3">
              <img 
                src="/logo-kodiak.png" 
                alt="KODIAK" 
                className="h-12 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            
            {/* Logo Building Me centrado */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <img 
                src="/logo-building-me.png" 
                alt="Building Me" 
                className="h-10 w-auto"
              />
            </div>
            
            {/* Usuario a la derecha */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-semibold">{user.name}</p>
                <p className="text-sm text-white/70 capitalize">{user.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación horizontal de módulos */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="px-8 py-3">
          <div className="flex items-center justify-center space-x-2 overflow-x-auto">
            {menuItems.map((item) => {
              if (item.roles.includes('all') || item.roles.includes(user.role)) {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg transition-all whitespace-nowrap ${
                      activeModule === item.id
                        ? 'text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    style={activeModule === item.id ? {
                      background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)'
                    } : {}}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              }
              return null;
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-8">
          {activeModule === 'dashboard' && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
                <p className="text-gray-600">Vista general de proyectos y ventas</p>
              </div>

              {/* Filtro por Unidad de Negocio */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrar por Unidad de Negocio</label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98] bg-white"
                >
                  <option>Todas</option>
                  {BUSINESS_UNITS.map(unit => (
                    <option key={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Cotizaciones Emitidas"
                  value={stats.cotizacionesEmitidas}
                  icon={FileText}
                  color="#33b4e9"
                />
                <StatCard
                  title="Cotizaciones Ganadas"
                  value={stats.cotizacionesGanadas}
                  icon={CheckCircle}
                  color="#45ad98"
                  subtitle={stats.cotizacionesEmitidas > 0 ? `${Math.round((stats.cotizacionesGanadas / stats.cotizacionesEmitidas) * 100)}% tasa de éxito` : '0% tasa de éxito'}
                />
                <StatCard
                  title="Cotizaciones Perdidas"
                  value={stats.cotizacionesPerdidas}
                  icon={XCircle}
                  color="#ef4444"
                />
                <StatCard
                  title="Cotizaciones Standby"
                  value={stats.cotizacionesStandby}
                  icon={Pause}
                  color="#f59e0b"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Monto Total en Ventas"
                  value={`$${(stats.montoVentas / 1000000).toFixed(1)}M`}
                  icon={DollarSign}
                  color="#235250"
                  subtitle="CLP"
                />
                <StatCard
                  title="Proyectos en Curso"
                  value={stats.proyectosEnCurso}
                  icon={Clock}
                  color="#45ad98"
                />
                <StatCard
                  title="Proyectos Terminados"
                  value={stats.proyectosTerminados}
                  icon={CheckCircle}
                  color="#33b4e9"
                />
              </div>

              {/* Sección de Protocolos */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Estado de Protocolos</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <StatCard
                    title="Protocolos Abiertos"
                    value={stats.protocolosAbiertos}
                    icon={Package}
                    color="#45ad98"
                  />
                  <StatCard
                    title="Protocolos En Proceso"
                    value={stats.protocolosEnProceso}
                    icon={Clock}
                    color="#f59e0b"
                  />
                  <StatCard
                    title="OC Sin Factura"
                    value={stats.ocSinFactura}
                    icon={FileText}
                    color="#ef4444"
                    subtitle="Requieren atención"
                  />
                  <StatCard
                    title="Pagos Pendientes"
                    value={stats.pagosPendientes}
                    icon={DollarSign}
                    color="#8b5cf6"
                    subtitle="Por pagar"
                  />
                </div>
              </div>

              {/* Alertas */}
              {(stats.ocSinFactura > 0 || stats.pagosPendientes > 0) && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">🔔 Alertas</h3>
                  <div className="space-y-3">
                    {stats.ocSinFactura > 0 && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-red-600 mr-3" />
                          <div>
                            <p className="font-semibold text-red-800">
                              {stats.ocSinFactura} Órdenes de Compra sin factura asignada
                            </p>
                            <p className="text-sm text-red-600">Revisa los protocolos activos para actualizar</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {stats.pagosPendientes > 0 && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                        <div className="flex items-center">
                          <DollarSign className="w-5 h-5 text-yellow-600 mr-3" />
                          <div>
                            <p className="font-semibold text-yellow-800">
                              {stats.pagosPendientes} Facturas pendientes de pago
                            </p>
                            <p className="text-sm text-yellow-600">Coordina con el área de finanzas</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeModule === 'cotizaciones' && (
            <CotizacionesModule 
              sharedCotizaciones={sharedCotizaciones}
              setSharedCotizaciones={setSharedCotizaciones}
              onAdjudicarVenta={handleAdjudicarVentaDesdeCotizacion}
            />
          )}

          {activeModule === 'protocolos' && hasAccess('protocolos') && (
            <ProtocolosModule 
              sharedProtocolos={sharedProtocolos}
              setSharedProtocolos={setSharedProtocolos}
              sharedOrdenesCompra={sharedOrdenesCompra}
              setSharedOrdenesCompra={setSharedOrdenesCompra}
              sharedCotizaciones={sharedCotizaciones.filter(c => c.estado === 'Ganada' && !c.adjudicadaAProtocolo)}
              protocoloParaAbrir={protocoloParaAbrir}
              onAdjudicarVentaDesdeCotizacion={handleAdjudicarVentaDesdeCotizacion}
              onLimpiarProtocoloParaAbrir={() => setProtocoloParaAbrir(null)}
            />
          )}

          {activeModule === 'ordenes' && hasAccess('ordenes') && (
  <OrdenesCompraModule 
    user={user}
    sharedOrdenesCompra={sharedOrdenesCompra}
    setSharedOrdenesCompra={setSharedOrdenesCompra}
    sharedProtocolos={sharedProtocolos}
    datosPreOC={datosPreOC}
    onCancelarPreOC={() => setDatosPreOC(null)}
  />
)}

          {activeModule === 'proveedores' && hasAccess('proveedores') && (
            <ProveedoresModule />
          )}

          {activeModule === 'clientes' && hasAccess('clientes') && (
            <ClientesModule />
          )}

          {activeModule === 'administracion' && user.role === 'admin' && (
            <AdministracionModule />
          )}

          {/* Módulo de Inventario/Bodega */}
          <InventarioModule activeModule={activeModule} />

          {/* Módulo de Informes */}
          <InformesModule activeModule={activeModule} />
        </main>
    </div>
  );
};

// App Principal
export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem('kurion_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('kurion_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kurion_user');
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}
