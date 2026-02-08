import React, { useState } from 'react';
import { ListTodo, Search, Plus, XCircle, Camera, Clock } from 'lucide-react';
import { createTarea, updateTarea, deleteTarea } from '../../api/audit-tareas';
import { uploadFotoAuditoria } from '../../api/audit-auditorias';

const TareasTab = ({ tareas, tiendas, user, onReload }) => {
  const [filtroEstado, setFiltroEstado] = useState('abiertas');
  const [busqueda, setBusqueda] = useState('');
  const [showNuevaModal, setShowNuevaModal] = useState(false);

  const tareasFiltradas = tareas.filter(t => {
    const tienda = tiendas.find(ti => ti.id === t.tienda_id);
    const matchBusqueda = t.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      tienda?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.responsable?.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === 'todas' ||
      (filtroEstado === 'abiertas' && t.estado !== 'cerrada') ||
      t.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const handleCambiarEstado = async (tarea, nuevoEstado) => {
    try {
      await updateTarea(tarea.id, { estado: nuevoEstado });
      await onReload();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar la tarea');
    }
  };

  const handleCerrarConFoto = async (tarea, file) => {
    try {
      let fotoUrl = null;
      if (file) {
        const path = `tareas/${tarea.id}/${Date.now()}-after-${file.name}`;
        fotoUrl = await uploadFotoAuditoria(file, path);
      }
      await updateTarea(tarea.id, {
        estado: 'cerrada',
        foto_despues_url: fotoUrl
      });
      await onReload();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cerrar la tarea');
    }
  };

  const prioColor = (prio) => {
    return prio === 'urgente' ? 'bg-red-100 text-red-800' :
      prio === 'alta' ? 'bg-orange-100 text-orange-800' :
      prio === 'media' ? 'bg-yellow-100 text-yellow-800' :
      'bg-gray-100 text-gray-600';
  };

  const estadoColor = (estado) => {
    return estado === 'cerrada' ? 'bg-green-100 text-green-800' :
      estado === 'en_progreso' ? 'bg-blue-100 text-blue-800' :
      estado === 'revision' ? 'bg-purple-100 text-purple-800' :
      'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Tareas</h2>
          <p className="text-gray-600">Seguimiento de tareas y acciones correctivas</p>
        </div>
        <button
          onClick={() => setShowNuevaModal(true)}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Tarea</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar tarea..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98] text-sm" />
        </div>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#45ad98]">
          <option value="abiertas">Abiertas</option>
          <option value="todas">Todas</option>
          <option value="abierta">Pendientes</option>
          <option value="en_progreso">En progreso</option>
          <option value="revision">En revisión</option>
          <option value="cerrada">Cerradas</option>
        </select>
        <span className="text-sm text-gray-500">{tareasFiltradas.length} tareas</span>
      </div>

      <div className="space-y-3">
        {tareasFiltradas.map(tarea => {
          const tienda = tiendas.find(t => t.id === tarea.tienda_id);
          return (
            <div key={tarea.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${prioColor(tarea.prioridad)}`}>{tarea.prioridad}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${estadoColor(tarea.estado)}`}>{tarea.estado?.replace('_', ' ')}</span>
                  </div>
                  <h3 className="font-bold text-gray-800">{tarea.titulo}</h3>
                  {tarea.descripcion && <p className="text-sm text-gray-500 mt-1">{tarea.descripcion}</p>}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>{tienda?.nombre || 'Sin tienda'}</span>
                    {tarea.responsable && <span>→ {tarea.responsable}</span>}
                    {tarea.fecha_limite && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(tarea.fecha_limite).toLocaleDateString('es-CL')}
                      </span>
                    )}
                  </div>
                </div>

                {tarea.estado !== 'cerrada' && (
                  <div className="flex items-center gap-2 ml-4">
                    {tarea.estado === 'abierta' && (
                      <button onClick={() => handleCambiarEstado(tarea, 'en_progreso')}
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                        Iniciar
                      </button>
                    )}
                    {tarea.estado === 'en_progreso' && (
                      <button onClick={() => handleCambiarEstado(tarea, 'revision')}
                        className="px-3 py-1.5 text-xs font-semibold bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
                        A revisión
                      </button>
                    )}
                    <label className="px-3 py-1.5 text-xs font-semibold bg-green-50 text-green-700 rounded-lg hover:bg-green-100 cursor-pointer">
                      Cerrar
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => handleCerrarConFoto(tarea, e.target.files[0])} />
                    </label>
                  </div>
                )}
              </div>

              {(tarea.foto_antes_url || tarea.foto_despues_url) && (
                <div className="flex gap-3 mt-3">
                  {tarea.foto_antes_url && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Antes</p>
                      <img src={tarea.foto_antes_url} alt="Antes" className="w-20 h-20 object-cover rounded-lg" />
                    </div>
                  )}
                  {tarea.foto_despues_url && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Después</p>
                      <img src={tarea.foto_despues_url} alt="Después" className="w-20 h-20 object-cover rounded-lg" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {tareasFiltradas.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <ListTodo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay tareas {filtroEstado !== 'todas' ? 'con ese filtro' : ''}</p>
        </div>
      )}

      {showNuevaModal && (
        <NuevaTareaModal
          tiendas={tiendas}
          user={user}
          onClose={() => setShowNuevaModal(false)}
          onSave={async (data) => {
            try {
              await createTarea(data);
              await onReload();
              setShowNuevaModal(false);
            } catch (error) {
              console.error('Error:', error);
              alert('Error al crear la tarea');
            }
          }}
        />
      )}
    </div>
  );
};

const NuevaTareaModal = ({ tiendas, user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    tienda_id: '',
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    responsable: '',
    responsable_tipo: 'building_me',
    fecha_limite: ''
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex-shrink-0" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Nueva Tarea</h3>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg"><XCircle className="w-6 h-6" /></button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tienda *</label>
            <select value={formData.tienda_id} onChange={(e) => setFormData({ ...formData, tienda_id: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]">
              <option value="">Seleccionar...</option>
              {tiendas.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Título *</label>
            <input type="text" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
            <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} rows={2}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Prioridad</label>
              <select value={formData.prioridad} onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]">
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha límite</label>
              <input type="date" value={formData.fecha_limite} onChange={(e) => setFormData({ ...formData, fecha_limite: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Responsable</label>
              <input type="text" value={formData.responsable} onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]" placeholder="Nombre del responsable" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo responsable</label>
              <select value={formData.responsable_tipo} onChange={(e) => setFormData({ ...formData, responsable_tipo: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]">
                <option value="building_me">Building Me</option>
                <option value="tienda">Tienda</option>
                <option value="promotor">Promotor</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end space-x-3 flex-shrink-0">
          <button onClick={onClose} className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50">Cancelar</button>
          <button
            onClick={() => {
              if (!formData.tienda_id || !formData.titulo) { alert('Completa tienda y título'); return; }
              onSave(formData);
            }}
            className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg"
            style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
          >
            Crear Tarea
          </button>
        </div>
      </div>
    </div>
  );
};

export default TareasTab;
