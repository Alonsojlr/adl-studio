import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Store, MapPin, ClipboardCheck, ChevronLeft, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { createTienda, updateTienda, deleteTienda } from '../../api/audit-tiendas';
import DetalleTienda from './DetalleTienda';

const TiendasTab = ({ tiendas, setTiendas, auditorias, implementaciones, tareas, plantillas, tiendaSeleccionada, setTiendaSeleccionada, formatCurrency, user, hideFinancialInfo = false, onReload }) => {
  const [showNuevaModal, setShowNuevaModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tiendaEditando, setTiendaEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRegion, setFiltroRegion] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const regiones = [...new Set(tiendas.map(t => t.region).filter(Boolean))].sort();

  const tiendasFiltradas = tiendas.filter(t => {
    const matchBusqueda = t.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.ciudad?.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.region?.toLowerCase().includes(busqueda.toLowerCase());
    const matchRegion = filtroRegion === 'todas' || t.region === filtroRegion;
    const matchEstado = filtroEstado === 'todos' || t.last_state === filtroEstado;
    return matchBusqueda && matchRegion && matchEstado;
  });

  const getEstadoBadge = (estado) => {
    const estilos = {
      ok: 'bg-green-100 text-green-800',
      observada: 'bg-yellow-100 text-yellow-800',
      critica: 'bg-red-100 text-red-800',
      en_riesgo: 'bg-orange-100 text-orange-800',
      sin_auditoría: 'bg-gray-100 text-gray-600'
    };
    return estilos[estado] || estilos.sin_auditoría;
  };

  const handleEliminar = async (tienda) => {
    if (!confirm(`¿Eliminar tienda "${tienda.nombre}"? Se eliminarán todas sus auditorías e implementaciones.`)) return;
    try {
      await deleteTienda(tienda.id);
      await onReload();
    } catch (error) {
      console.error('Error eliminando tienda:', error);
      alert('Error al eliminar la tienda');
    }
  };

  // Si hay tienda seleccionada, mostrar detalle
  if (tiendaSeleccionada) {
    return (
      <DetalleTienda
        tienda={tiendaSeleccionada}
        auditorias={auditorias.filter(a => a.tienda_id === tiendaSeleccionada.id)}
        implementaciones={implementaciones.filter(i => i.tienda_id === tiendaSeleccionada.id)}
        tareas={tareas.filter(t => t.tienda_id === tiendaSeleccionada.id)}
        plantillas={plantillas}
        formatCurrency={formatCurrency}
        user={user}
        hideFinancialInfo={hideFinancialInfo}
        onVolver={() => setTiendaSeleccionada(null)}
        onReload={onReload}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Tiendas</h2>
          <p className="text-gray-600">Gestión de ferreterías y puntos de venta</p>
        </div>
        <button
          onClick={() => setShowNuevaModal(true)}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Tienda</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar tienda..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98] text-sm"
          />
        </div>
        <select
          value={filtroRegion}
          onChange={(e) => setFiltroRegion(e.target.value)}
          className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#45ad98]"
        >
          <option value="todas">Todas las regiones</option>
          {regiones.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#45ad98]"
        >
          <option value="todos">Todos los estados</option>
          <option value="ok">OK</option>
          <option value="observada">Observada</option>
          <option value="critica">Crítica</option>
          <option value="en_riesgo">En riesgo</option>
          <option value="sin_auditoría">Sin auditoría</option>
        </select>
        <span className="text-sm text-gray-500">{tiendasFiltradas.length} tiendas</span>
      </div>

      {/* Lista de tiendas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiendasFiltradas.map((tienda) => {
          const implCount = implementaciones.filter(i => i.tienda_id === tienda.id && i.estado === 'activa').length;
          const diasSinAuditoria = tienda.last_audit_at
            ? Math.floor((new Date() - new Date(tienda.last_audit_at)) / (1000 * 60 * 60 * 24))
            : null;
          const vencida = diasSinAuditoria === null || diasSinAuditoria > 30;

          return (
            <div
              key={tienda.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden cursor-pointer"
              onClick={() => setTiendaSeleccionada(tienda)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">{tienda.nombre}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      {tienda.ciudad}{tienda.region ? `, ${tienda.region}` : ''}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getEstadoBadge(tienda.last_state)}`}>
                    {tienda.last_state?.replace('_', ' ') || 'Sin auditoría'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    {tienda.last_score != null && (
                      <p className="text-gray-600">
                        Score: <span className="font-bold" style={{ color: tienda.last_score >= 80 ? '#16a34a' : tienda.last_score >= 60 ? '#f59e0b' : '#dc2626' }}>
                          {tienda.last_score}%
                        </span>
                      </p>
                    )}
                    {!hideFinancialInfo && (
                      <p className="text-gray-500">{implCount} implementación{implCount !== 1 ? 'es' : ''}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {tienda.last_audit_at ? (
                      <p className={`text-xs ${vencida ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                        {vencida && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                        Última: {new Date(tienda.last_audit_at).toLocaleDateString('es-CL')}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">Sin auditorías</p>
                    )}
                  </div>
                </div>

                {tienda.kam && (
                  <p className="text-xs text-gray-400 mt-2">KAM: {tienda.kam}</p>
                )}
              </div>

              {/* Barra de acciones */}
              <div className="border-t border-gray-100 px-5 py-2.5 flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setTiendaSeleccionada(tienda)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Ver detalle"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setTiendaEditando(tienda);
                    setShowEditModal(true);
                  }}
                  className="p-1.5 text-gray-400 hover:text-[#235250] hover:bg-[#235250]/10 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEliminar(tienda)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {tiendasFiltradas.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {busqueda || filtroRegion !== 'todas' || filtroEstado !== 'todos'
              ? 'No se encontraron tiendas con esos filtros'
              : 'No hay tiendas registradas. Agrega la primera.'}
          </p>
        </div>
      )}

      {/* Modal Nueva/Editar Tienda */}
      {(showNuevaModal || showEditModal) && (
        <TiendaFormModal
          tienda={showEditModal ? tiendaEditando : null}
          onClose={() => {
            setShowNuevaModal(false);
            setShowEditModal(false);
            setTiendaEditando(null);
          }}
          onSave={async (data) => {
            try {
              if (showEditModal && tiendaEditando) {
                await updateTienda(tiendaEditando.id, data);
              } else {
                await createTienda(data);
              }
              await onReload();
              setShowNuevaModal(false);
              setShowEditModal(false);
              setTiendaEditando(null);
            } catch (error) {
              console.error('Error guardando tienda:', error);
              alert('Error al guardar la tienda');
            }
          }}
        />
      )}
    </div>
  );
};

// Modal formulario tienda
const TiendaFormModal = ({ tienda, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: tienda?.nombre || '',
    direccion: tienda?.direccion || '',
    ciudad: tienda?.ciudad || '',
    region: tienda?.region || '',
    comuna: tienda?.comuna || '',
    tipo_tienda: tienda?.tipo_tienda || 'ferretería',
    lat: tienda?.lat || '',
    lng: tienda?.lng || '',
    kam: tienda?.kam || '',
    contacto_nombre: tienda?.contacto_nombre || '',
    contacto_telefono: tienda?.contacto_telefono || '',
    contacto_email: tienda?.contacto_email || '',
    notas: tienda?.notas || ''
  });
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState({ type: '', message: '' });

  const normalizeCoordinate = (value, fieldLabel, min, max) => {
    if (value == null || value === '') return undefined;

    const normalizedValue = String(value).trim().replace(',', '.');
    if (!normalizedValue) return undefined;

    const parsed = Number(normalizedValue);
    if (!Number.isFinite(parsed)) {
      throw new Error(`${fieldLabel} debe ser un número válido`);
    }
    if (parsed < min || parsed > max) {
      throw new Error(`${fieldLabel} debe estar entre ${min} y ${max}`);
    }

    return Math.round(parsed * 1e7) / 1e7;
  };

  const buildDataToSave = () => {
    const dataToSave = { ...formData };
    dataToSave.lat = normalizeCoordinate(dataToSave.lat, 'Latitud', -90, 90);
    dataToSave.lng = normalizeCoordinate(dataToSave.lng, 'Longitud', -180, 180);

    if (dataToSave.lat === undefined) delete dataToSave.lat;
    if (dataToSave.lng === undefined) delete dataToSave.lng;

    return dataToSave;
  };

  const handleBuscarCoordenadas = async () => {
    const direccion = formData.direccion.trim();
    const comuna = formData.comuna.trim();
    const ciudad = formData.ciudad.trim();
    const region = formData.region.trim();

    if (!ciudad || !region) {
      alert('Para buscar coordenadas, completa al menos Ciudad y Región');
      return;
    }

    const queryParts = [direccion, comuna, ciudad, region, 'Chile'].filter(Boolean);
    const query = queryParts.join(', ');
    if (!query) {
      alert('Ingresa una dirección o datos de ubicación para buscar coordenadas');
      return;
    }

    setGeocoding(true);
    setGeocodeResult({ type: '', message: '' });

    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('limit', '1');
      url.searchParams.set('countrycodes', 'cl');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('q', query);

      const response = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'es-CL,es;q=0.9,en;q=0.8'
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      const results = await response.json();
      if (!Array.isArray(results) || results.length === 0) {
        setGeocodeResult({
          type: 'error',
          message: 'No se encontraron coordenadas para esa dirección. Intenta con una dirección más específica.'
        });
        return;
      }

      const best = results[0];
      const lat = Number(best.lat);
      const lng = Number(best.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error('Coordenadas inválidas');
      }

      setFormData((prev) => ({
        ...prev,
        lat: lat.toFixed(6),
        lng: lng.toFixed(6)
      }));
      setGeocodeResult({
        type: 'success',
        message: 'Coordenadas actualizadas automáticamente desde la dirección.'
      });
    } catch (error) {
      console.error('Error geocodificando dirección:', error);
      setGeocodeResult({
        type: 'error',
        message: 'No se pudo geocodificar la dirección en este momento. Puedes ingresar lat/lng manualmente.'
      });
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      onSave(buildDataToSave());
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex-shrink-0" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">{tienda ? 'Editar Tienda' : 'Nueva Tienda'}</h3>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Tienda *</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                placeholder="Ej: Sodimac Maipú"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ciudad *</label>
              <input
                type="text"
                required
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Región *</label>
              <input
                type="text"
                required
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Comuna</label>
              <input
                type="text"
                value={formData.comuna}
                onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo Tienda</label>
              <select
                value={formData.tipo_tienda}
                onChange={(e) => setFormData({ ...formData, tipo_tienda: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              >
                <option value="ferretería">Ferretería</option>
                <option value="home_center">Home Center</option>
                <option value="especializada">Especializada</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">KAM</label>
              <input
                type="text"
                value={formData.kam}
                onChange={(e) => setFormData({ ...formData, kam: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              />
            </div>

            <div className="md:col-span-2 border-t pt-4 mt-2">
              <h4 className="font-semibold text-gray-700 mb-3">Contacto de la Tienda</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formData.contacto_nombre}
                    onChange={(e) => setFormData({ ...formData, contacto_nombre: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.contacto_telefono}
                    onChange={(e) => setFormData({ ...formData, contacto_telefono: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.contacto_email}
                    onChange={(e) => setFormData({ ...formData, contacto_email: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 border-t pt-4 mt-2">
              <h4 className="font-semibold text-gray-700 mb-3">Coordenadas (para mapa)</h4>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleBuscarCoordenadas}
                  disabled={geocoding}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${
                    geocoding
                      ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                      : 'bg-[#235250] text-white hover:bg-[#1f4442]'
                  }`}
                >
                  {geocoding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    'Buscar por dirección'
                  )}
                </button>
                <p className="text-xs text-gray-500">Usa Dirección, Comuna, Ciudad y Región para encontrar lat/lng.</p>
              </div>
              {geocodeResult.message && (
                <p className={`mb-3 text-xs ${geocodeResult.type === 'success' ? 'text-green-700' : 'text-amber-700'}`}>
                  {geocodeResult.message}
                </p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Latitud</label>
                  <input
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                    placeholder="-33.4489"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Longitud</label>
                  <input
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
                    placeholder="-70.6693"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Notas</label>
              <textarea
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]"
              />
            </div>
          </div>
        </form>

        <div className="p-6 border-t flex justify-end space-x-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              const nombre = formData.nombre.trim();
              const ciudad = formData.ciudad.trim();
              const region = formData.region.trim();
              if (!nombre || !ciudad || !region) {
                alert('Completa los campos obligatorios: Nombre, Ciudad, Región');
                return;
              }
              try {
                onSave(buildDataToSave());
              } catch (error) {
                alert(error.message);
              }
            }}
            className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
          >
            {tienda ? 'Guardar Cambios' : 'Crear Tienda'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TiendasTab;
