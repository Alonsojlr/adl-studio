import React, { useState } from 'react';
import { ClipboardCheck, Search, Eye, ChevronLeft, Trash2 } from 'lucide-react';
import { deleteAuditoria, getRespuestasByAuditoria } from '../../api/audit-auditorias';

const AuditoriasTab = ({ auditorias, tiendas, plantillas, formatCurrency, user, onReload }) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [auditoriaDetalle, setAuditoriaDetalle] = useState(null);
  const [respuestasDetalle, setRespuestasDetalle] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [deletingAuditoriaId, setDeletingAuditoriaId] = useState(null);

  const auditoriasFiltradas = auditorias.filter(a => {
    const tienda = tiendas.find(t => t.id === a.tienda_id);
    const matchBusqueda = tienda?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.auditor_nombre?.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || a.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const verDetalle = async (aud) => {
    setLoadingDetalle(true);
    try {
      const resp = await getRespuestasByAuditoria(aud.id);
      setRespuestasDetalle(resp || []);
      setAuditoriaDetalle(aud);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleEliminarAuditoria = async (aud) => {
    const fecha = aud.fecha_auditoria ? new Date(aud.fecha_auditoria).toLocaleDateString('es-CL') : 'sin fecha';
    if (!confirm(`¿Eliminar auditoría del ${fecha}? Esta acción también eliminará respuestas y hallazgos asociados.`)) return;
    setDeletingAuditoriaId(aud.id);
    try {
      await deleteAuditoria(aud.id);
      if (auditoriaDetalle?.id === aud.id) {
        setAuditoriaDetalle(null);
        setRespuestasDetalle([]);
      }
      await onReload?.();
    } catch (error) {
      console.error('Error eliminando auditoría:', error);
      alert('No se pudo eliminar la auditoría');
    } finally {
      setDeletingAuditoriaId(null);
    }
  };

  if (auditoriaDetalle) {
    const tienda = tiendas.find(t => t.id === auditoriaDetalle.tienda_id);
    return (
      <div className="space-y-4">
        <button onClick={() => setAuditoriaDetalle(null)} className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-sm">
          <ChevronLeft className="w-4 h-4" /><span>Volver</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
            <h3 className="text-xl font-bold text-white">Detalle Auditoría</h3>
            <p className="text-white/80">{tienda?.nombre} · {new Date(auditoriaDetalle.fecha_auditoria).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold" style={{
                color: auditoriaDetalle.score_final >= 80 ? '#16a34a' : auditoriaDetalle.score_final >= 60 ? '#f59e0b' : '#dc2626'
              }}>
                {auditoriaDetalle.score_final}%
              </div>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-bold uppercase ${
                auditoriaDetalle.estado === 'ok' ? 'bg-green-100 text-green-800' :
                auditoriaDetalle.estado === 'observada' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>{auditoriaDetalle.estado}</span>
              <p className="text-sm text-gray-500 mt-2">Auditor: {auditoriaDetalle.auditor_nombre}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-green-50 rounded-lg p-3 text-center"><p className="text-xl font-bold text-green-700">{auditoriaDetalle.items_ok}</p><p className="text-xs text-green-600">OK</p></div>
              <div className="bg-red-50 rounded-lg p-3 text-center"><p className="text-xl font-bold text-red-700">{auditoriaDetalle.items_no}</p><p className="text-xs text-red-600">NO</p></div>
              <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xl font-bold text-gray-500">{auditoriaDetalle.items_na}</p><p className="text-xs text-gray-500">N/A</p></div>
            </div>

            {auditoriaDetalle.observacion_general && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm font-semibold text-gray-600 mb-1">Observación general</p>
                <p className="text-sm text-gray-700">{auditoriaDetalle.observacion_general}</p>
              </div>
            )}

            <h4 className="font-semibold text-gray-800 mb-3">Respuestas del Checklist</h4>
            <div className="space-y-2">
              {respuestasDetalle.map((resp, idx) => (
                <div key={resp.id || idx} className={`flex items-start gap-3 p-3 rounded-lg ${
                  resp.resultado === 'OK' ? 'bg-green-50' :
                  resp.resultado === 'NO' ? 'bg-red-50' :
                  'bg-gray-50'
                }`}>
                  {resp.foto_url && (
                    <img src={resp.foto_url} alt="" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-semibold text-gray-400">{resp.zona?.replace('_', ' ')}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        resp.resultado === 'OK' ? 'bg-green-200 text-green-800' :
                        resp.resultado === 'NO' ? 'bg-red-200 text-red-800' :
                        'bg-gray-200 text-gray-600'
                      }`}>{resp.resultado}</span>
                      {resp.severidad && (
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          resp.severidad === 3 ? 'bg-red-200 text-red-800' :
                          resp.severidad === 2 ? 'bg-orange-200 text-orange-800' :
                          'bg-yellow-200 text-yellow-800'
                        }`}>{resp.severidad === 3 ? 'Grave' : resp.severidad === 2 ? 'Moderado' : 'Leve'}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 mt-1">{resp.label}</p>
                    {resp.comentario && <p className="text-xs text-gray-500 mt-1">{resp.comentario}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Auditorías</h2>
        <p className="text-gray-600">Historial de auditorías realizadas</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar por tienda o auditor..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98] text-sm" />
        </div>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#45ad98]">
          <option value="todos">Todos los estados</option>
          <option value="ok">OK</option>
          <option value="observada">Observada</option>
          <option value="critica">Crítica</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Tienda</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Fecha</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Auditor</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Tipo</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Score</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Estado</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">OK/NO/NA</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {auditoriasFiltradas.map(aud => {
              const tienda = tiendas.find(t => t.id === aud.tienda_id);
              return (
                <tr key={aud.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{tienda?.nombre || 'N/A'}</td>
                  <td className="px-4 py-3">{new Date(aud.fecha_auditoria).toLocaleDateString('es-CL')}</td>
                  <td className="px-4 py-3">{aud.auditor_nombre || '-'}</td>
                  <td className="px-4 py-3 capitalize">{aud.tipo_auditoria}</td>
                  <td className="px-4 py-3 text-center font-bold" style={{
                    color: aud.score_final >= 80 ? '#16a34a' : aud.score_final >= 60 ? '#f59e0b' : '#dc2626'
                  }}>{aud.score_final != null ? `${aud.score_final}%` : '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                      aud.estado === 'ok' ? 'bg-green-100 text-green-800' :
                      aud.estado === 'observada' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>{aud.estado}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">
                    {aud.items_ok}/{aud.items_no}/{aud.items_na}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => verDetalle(aud)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg" title="Ver detalle">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEliminarAuditoria(aud)}
                        disabled={deletingAuditoriaId === aud.id}
                        className={`p-1.5 rounded-lg ${deletingAuditoriaId === aud.id ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-600'}`}
                        title="Eliminar auditoría"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {auditoriasFiltradas.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay auditorías registradas</p>
        </div>
      )}
    </div>
  );
};

export default AuditoriasTab;
