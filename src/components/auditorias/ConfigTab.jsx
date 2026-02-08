import React, { useState } from 'react';
import { Settings, Plus, Edit2, Trash2, XCircle, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { createPlantilla, updatePlantilla, deletePlantilla, createPlantillaItem, updatePlantillaItem, deletePlantillaItem } from '../../api/audit-auditorias';

const ConfigTab = ({ plantillas, onReload }) => {
  const [showModal, setShowModal] = useState(false);
  const [editandoPlantilla, setEditandoPlantilla] = useState(null);
  const [expandida, setExpandida] = useState(null);

  const handleEliminar = async (p) => {
    if (!confirm(`¿Desactivar plantilla "${p.nombre}"?`)) return;
    try {
      await deletePlantilla(p.id);
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
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Plantillas de Checklist</h2>
          <p className="text-gray-600">Configuración de plantillas de auditoría</p>
        </div>
        <button
          onClick={() => { setEditandoPlantilla(null); setShowModal(true); }}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Plantilla</span>
        </button>
      </div>

      <div className="space-y-4">
        {plantillas.map(p => {
          const items = (p.audit_plantilla_items || []).sort((a, b) => a.orden - b.orden);
          const isExpanded = expandida === p.id;
          const totalPuntos = items.reduce((sum, i) => sum + (parseFloat(i.max_puntos) || 0), 0);

          return (
            <div key={p.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setExpandida(isExpanded ? null : p.id)}>
                <div>
                  <h3 className="font-bold text-gray-800">{p.nombre}</h3>
                  <p className="text-sm text-gray-500">{p.descripcion}</p>
                  <div className="flex gap-3 mt-2 text-xs text-gray-400">
                    <span>Tipo: {p.tipo_auditoria}</span>
                    <span>{items.length} ítems</span>
                    <span>{totalPuntos} puntos</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setEditandoPlantilla(p); setShowModal(true); }}
                    className="p-1.5 text-gray-400 hover:text-[#235250] rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleEliminar(p); }}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t px-5 pb-5">
                  <table className="w-full text-sm mt-3">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">#</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Zona</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Ítem</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Puntos</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Foto NO</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Foto Siempre</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-400">{item.orden || idx + 1}</td>
                          <td className="px-3 py-2 capitalize text-xs">{item.zona?.replace('_', ' ')}</td>
                          <td className="px-3 py-2">{item.label}</td>
                          <td className="px-3 py-2 text-center font-semibold">{item.max_puntos}</td>
                          <td className="px-3 py-2 text-center">{item.requiere_foto_no ? '✓' : '-'}</td>
                          <td className="px-3 py-2 text-center">{item.requiere_foto_siempre ? '✓' : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-right mt-2 text-sm">
                    <span className="text-gray-500">Total puntos: </span>
                    <span className="font-bold" style={{ color: totalPuntos === 100 ? '#16a34a' : '#dc2626' }}>{totalPuntos}</span>
                    {totalPuntos !== 100 && <span className="text-red-500 text-xs ml-2">(debe sumar 100)</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {plantillas.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay plantillas configuradas</p>
        </div>
      )}

      {showModal && (
        <PlantillaFormModal
          plantilla={editandoPlantilla}
          onClose={() => { setShowModal(false); setEditandoPlantilla(null); }}
          onSave={async (data, items) => {
            try {
              if (editandoPlantilla) {
                await updatePlantilla(editandoPlantilla.id, data);
              } else {
                const nueva = await createPlantilla(data);
                for (const item of items) {
                  await createPlantillaItem({ ...item, plantilla_id: nueva.id });
                }
              }
              await onReload();
              setShowModal(false);
              setEditandoPlantilla(null);
            } catch (error) {
              console.error('Error:', error);
              alert('Error al guardar');
            }
          }}
        />
      )}
    </div>
  );
};

const PlantillaFormModal = ({ plantilla, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: plantilla?.nombre || '',
    tipo_auditoria: plantilla?.tipo_auditoria || 'rapida',
    descripcion: plantilla?.descripcion || ''
  });

  const [items, setItems] = useState([]);

  const agregarItem = () => {
    setItems([...items, {
      zona: 'general',
      label: '',
      descripcion_ayuda: '',
      peso: 1,
      max_puntos: 0,
      requiere_foto_no: true,
      requiere_foto_siempre: false,
      orden: items.length + 1
    }]);
  };

  const totalPuntos = items.reduce((sum, i) => sum + (parseFloat(i.max_puntos) || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex-shrink-0" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">{plantilla ? 'Editar' : 'Nueva'} Plantilla</h3>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg"><XCircle className="w-6 h-6" /></button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
              <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]" placeholder="Ej: Checklist Promotor DeWalt" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo</label>
              <select value={formData.tipo_auditoria} onChange={(e) => setFormData({ ...formData, tipo_auditoria: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]">
                <option value="rapida">Rápida</option>
                <option value="completa">Completa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
              <input type="text" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#45ad98]" />
            </div>
          </div>

          {!plantilla && (
            <>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-700">
                  Ítems del Checklist
                  <span className={`ml-2 text-sm ${totalPuntos === 100 ? 'text-green-600' : 'text-red-500'}`}>
                    ({totalPuntos}/100 puntos)
                  </span>
                </h4>
                <button onClick={agregarItem} className="text-sm text-[#235250] font-semibold hover:underline">+ Agregar ítem</button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-6 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Zona</label>
                        <select value={item.zona} onChange={(e) => { const n = [...items]; n[idx].zona = e.target.value; setItems(n); }}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm">
                          {['general', 'marca', 'orden', 'stock', 'precios', 'mallas', 'vitrinas', 'mueble_central', 'facing', 'seguridad', 'cierre'].map(z =>
                            <option key={z} value={z}>{z.replace('_', ' ')}</option>
                          )}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <label className="text-xs text-gray-500">Ítem *</label>
                        <input type="text" value={item.label} onChange={(e) => { const n = [...items]; n[idx].label = e.target.value; setItems(n); }}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm" placeholder="Descripción del ítem" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Puntos</label>
                        <input type="number" value={item.max_puntos} onChange={(e) => { const n = [...items]; n[idx].max_puntos = parseFloat(e.target.value) || 0; setItems(n); }}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
                      </div>
                      <div className="flex items-end">
                        <button onClick={() => setItems(items.filter((_, i) => i !== idx))}
                          className="p-1.5 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-1.5 text-xs text-gray-500">
                        <input type="checkbox" checked={item.requiere_foto_no} onChange={(e) => { const n = [...items]; n[idx].requiere_foto_no = e.target.checked; setItems(n); }} />
                        Foto si NO
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-gray-500">
                        <input type="checkbox" checked={item.requiere_foto_siempre} onChange={(e) => { const n = [...items]; n[idx].requiere_foto_siempre = e.target.checked; setItems(n); }} />
                        Foto siempre
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t flex justify-end space-x-3 flex-shrink-0">
          <button onClick={onClose} className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50">Cancelar</button>
          <button
            onClick={() => {
              if (!formData.nombre) { alert('Nombre es obligatorio'); return; }
              onSave(formData, items);
            }}
            className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg"
            style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
          >
            {plantilla ? 'Guardar' : 'Crear Plantilla'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigTab;
