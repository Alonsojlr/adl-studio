import React, { useState } from 'react';
import { Plus, Search, Wrench, XCircle, Trash2, Edit2 } from 'lucide-react';
import { createImplementacion, updateImplementacion, deleteImplementacion, createActivo, deleteActivo } from '../../api/audit-implementaciones';

const ImplementacionesTab = ({ implementaciones, tiendas, formatCurrency, user, onReload }) => {
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const implFiltradas = implementaciones.filter(i => {
    const tienda = tiendas.find(t => t.id === i.tienda_id);
    return (tienda?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.nombre?.toLowerCase().includes(busqueda.toLowerCase()));
  });

  const handleEliminar = async (impl) => {
    if (!confirm(`¿Eliminar implementación "${impl.nombre}"?`)) return;
    try {
      await deleteImplementacion(impl.id);
      await onReload();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Implementaciones</h2>
          <p className="text-gray-600">Registro de instalaciones y activos por tienda</p>
        </div>
        <button
          onClick={() => { setEditando(null); setShowModal(true); }}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Implementación</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por tienda o nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98] text-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
        {implFiltradas.map(impl => {
          const tienda = tiendas.find(t => t.id === impl.tienda_id);
          const activos = impl.audit_activos || [];
          return (
            <div key={impl.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">{impl.nombre}</h3>
                  <p className="text-sm text-gray-500">
                    {tienda?.nombre || 'Tienda no encontrada'} · Instalada: {impl.fecha_instalacion ? new Date(impl.fecha_instalacion).toLocaleDateString('es-CL') : '-'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                    impl.estado === 'activa' ? 'bg-green-100 text-green-800' :
                    impl.estado === 'retirada' ? 'bg-gray-100 text-gray-600' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>{impl.estado}</span>
                  <button onClick={() => { setEditando(impl); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-[#235250] rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleEliminar(impl)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mt-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-gray-500 text-xs">Fabricación</p>
                  <p className="font-semibold">{formatCurrency(impl.costo_fabricacion)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-gray-500 text-xs">Instalación</p>
                  <p className="font-semibold">{formatCurrency(impl.costo_instalacion)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-gray-500 text-xs">Transporte</p>
                  <p className="font-semibold">{formatCurrency(impl.costo_transporte)}</p>
                </div>
                <div className="rounded-lg p-2 text-center" style={{ backgroundColor: '#23525010' }}>
                  <p className="text-xs" style={{ color: '#235250' }}>Total</p>
                  <p className="font-bold" style={{ color: '#235250' }}>{formatCurrency(impl.costo_total)}</p>
                </div>
              </div>

              {activos.length > 0 && (
                <div className="mt-3 text-xs text-gray-500">
                  Activos: {activos.map(a => `${a.cantidad}x ${a.tipo}`).join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {implFiltradas.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay implementaciones registradas</p>
        </div>
      )}

      {showModal && (
        <ImplementacionFormModal
          implementacion={editando}
          tiendas={tiendas}
          formatCurrency={formatCurrency}
          onClose={() => { setShowModal(false); setEditando(null); }}
          onSave={async (data, activos) => {
            try {
              if (editando) {
                await updateImplementacion(editando.id, data);
              } else {
                const impl = await createImplementacion(data);
                if (activos.length > 0) {
                  for (const activo of activos) {
                    await createActivo({ ...activo, implementacion_id: impl.id });
                  }
                }
              }
              await onReload();
              setShowModal(false);
              setEditando(null);
            } catch (error) {
              console.error('Error:', error);
              alert('Error al guardar la implementación');
            }
          }}
        />
      )}
    </div>
  );
};

const ImplementacionFormModal = ({ implementacion, tiendas, formatCurrency, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    tienda_id: implementacion?.tienda_id || '',
    nombre: implementacion?.nombre || '',
    fecha_instalacion: implementacion?.fecha_instalacion || new Date().toISOString().split('T')[0],
    estado: implementacion?.estado || 'activa',
    costo_fabricacion: implementacion?.costo_fabricacion || 0,
    costo_instalacion: implementacion?.costo_instalacion || 0,
    costo_transporte: implementacion?.costo_transporte || 0,
    notas: implementacion?.notas || ''
  });

  const [activos, setActivos] = useState([]);

  const costoTotal = (parseFloat(formData.costo_fabricacion) || 0) + (parseFloat(formData.costo_instalacion) || 0) + (parseFloat(formData.costo_transporte) || 0);

  const agregarActivo = () => {
    setActivos([...activos, { tipo: 'malla', descripcion: '', cantidad: 1, costo_unitario: 0, costo_total: 0 }]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex-shrink-0" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">{implementacion ? 'Editar' : 'Nueva'} Implementación</h3>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg"><XCircle className="w-6 h-6" /></button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tienda *</label>
              <select required value={formData.tienda_id} onChange={(e) => setFormData({ ...formData, tienda_id: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]">
                <option value="">Seleccionar tienda...</option>
                {tiendas.map(t => <option key={t.id} value={t.id}>{t.nombre} - {t.ciudad}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
              <input type="text" required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]" placeholder="Ej: Implementación DeWalt Q1 2025" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha Instalación</label>
              <input type="date" value={formData.fecha_instalacion} onChange={(e) => setFormData({ ...formData, fecha_instalacion: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
              <select value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]">
                <option value="activa">Activa</option>
                <option value="retirada">Retirada</option>
                <option value="en_reparación">En reparación</option>
              </select>
            </div>

            <div className="md:col-span-2 border-t pt-4 mt-2">
              <h4 className="font-semibold text-gray-700 mb-3">Costos</h4>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fabricación</label>
                  <input type="number" value={formData.costo_fabricacion} onChange={(e) => setFormData({ ...formData, costo_fabricacion: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98] text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Instalación</label>
                  <input type="number" value={formData.costo_instalacion} onChange={(e) => setFormData({ ...formData, costo_instalacion: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98] text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Transporte</label>
                  <input type="number" value={formData.costo_transporte} onChange={(e) => setFormData({ ...formData, costo_transporte: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98] text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Total</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-xl text-sm font-bold" style={{ color: '#235250' }}>{formatCurrency(costoTotal)}</div>
                </div>
              </div>
            </div>

            {/* Activos */}
            {!implementacion && (
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-700">Activos Instalados</h4>
                  <button onClick={agregarActivo} className="text-sm text-[#235250] font-semibold hover:underline">+ Agregar activo</button>
                </div>
                {activos.map((activo, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-2 mb-2">
                    <select value={activo.tipo} onChange={(e) => { const n = [...activos]; n[idx].tipo = e.target.value; setActivos(n); }}
                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm">
                      <option value="malla">Malla</option>
                      <option value="vitrina">Vitrina</option>
                      <option value="mueble_central">Mueble Central</option>
                      <option value="grafica">Gráfica</option>
                      <option value="otro">Otro</option>
                    </select>
                    <input type="text" placeholder="Descripción" value={activo.descripcion} onChange={(e) => { const n = [...activos]; n[idx].descripcion = e.target.value; setActivos(n); }}
                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
                    <input type="number" placeholder="Cant" value={activo.cantidad} onChange={(e) => { const n = [...activos]; n[idx].cantidad = parseInt(e.target.value) || 1; setActivos(n); }}
                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
                    <input type="number" placeholder="Costo unit." value={activo.costo_unitario} onChange={(e) => { const n = [...activos]; n[idx].costo_unitario = parseFloat(e.target.value) || 0; n[idx].costo_total = n[idx].cantidad * n[idx].costo_unitario; setActivos(n); }}
                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
                    <button onClick={() => setActivos(activos.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Notas</label>
              <textarea value={formData.notas} onChange={(e) => setFormData({ ...formData, notas: e.target.value })} rows={2}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]" />
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end space-x-3 flex-shrink-0">
          <button onClick={onClose} className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50">Cancelar</button>
          <button
            onClick={() => {
              if (!formData.tienda_id || !formData.nombre) { alert('Completa tienda y nombre'); return; }
              onSave({ ...formData, costo_total: costoTotal }, activos);
            }}
            className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg"
            style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
          >
            {implementacion ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImplementacionesTab;
