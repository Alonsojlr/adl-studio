import React, { useState, useEffect } from 'react';
import { ChevronLeft, ClipboardCheck, Wrench, ListTodo, FileText, Camera, MapPin, AlertTriangle, Plus, Clock } from 'lucide-react';
import { getImplementacionesByTienda } from '../../api/audit-implementaciones';
import { getAuditoriasByTienda } from '../../api/audit-auditorias';
import { getTareasByTienda } from '../../api/audit-tareas';
import { getAjustesByTienda } from '../../api/audit-tareas';
import EjecutarAuditoria from './EjecutarAuditoria';

const DetalleTienda = ({ tienda, auditorias: initialAuditorias, implementaciones: initialImpl, tareas: initialTareas, plantillas, formatCurrency, user, hideFinancialInfo = false, onVolver, onReload }) => {
  const [activeSubTab, setActiveSubTab] = useState('resumen');
  const [showAuditoria, setShowAuditoria] = useState(false);
  const [ajustes, setAjustes] = useState([]);

  useEffect(() => {
    const loadAjustes = async () => {
      try {
        const data = await getAjustesByTienda(tienda.id);
        setAjustes(data || []);
      } catch (e) {
        console.error('Error cargando ajustes:', e);
      }
    };
    loadAjustes();
  }, [tienda.id]);

  const diasSinAuditoria = tienda.last_audit_at
    ? Math.floor((new Date() - new Date(tienda.last_audit_at)) / (1000 * 60 * 60 * 24))
    : null;
  const vencida = diasSinAuditoria === null || diasSinAuditoria > 30;

  const implActivas = initialImpl.filter(i => i.estado === 'activa');
  const inversionTotal = implActivas.reduce((sum, i) => sum + (parseFloat(i.costo_total) || 0), 0);
  const tareasAbiertas = initialTareas.filter(t => t.estado !== 'cerrada');

  const scoreColor = tienda.last_score >= 80 ? '#16a34a' : tienda.last_score >= 60 ? '#f59e0b' : '#dc2626';

  const subTabs = [
    { id: 'resumen', name: 'Resumen' },
    ...(!hideFinancialInfo ? [{ id: 'implementacion', name: 'Implementación' }] : []),
    { id: 'auditorias', name: 'Auditorías' },
    { id: 'ajustes', name: 'Ajustes' },
    { id: 'tareas', name: 'Tareas' }
  ];

  useEffect(() => {
    if (hideFinancialInfo && activeSubTab === 'implementacion') {
      setActiveSubTab('resumen');
    }
  }, [hideFinancialInfo, activeSubTab]);

  if (showAuditoria) {
    return (
      <EjecutarAuditoria
        tienda={tienda}
        plantillas={plantillas}
        user={user}
        onVolver={() => setShowAuditoria(false)}
        onComplete={async () => {
          setShowAuditoria(false);
          await onReload();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6" style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}>
          <button
            onClick={onVolver}
            className="flex items-center space-x-1 text-white/80 hover:text-white mb-4 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Volver a tiendas</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{tienda.nombre}</h2>
              <p className="text-white/80 flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {tienda.direccion || tienda.ciudad}{tienda.region ? `, ${tienda.region}` : ''}
              </p>
              {tienda.kam && <p className="text-white/60 text-sm mt-1">KAM: {tienda.kam}</p>}
            </div>

            <div className="text-right">
              {tienda.last_score != null ? (
                <div className="text-4xl font-bold text-white">{tienda.last_score}%</div>
              ) : (
                <div className="text-lg text-white/60">Sin score</div>
              )}
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                tienda.last_state === 'ok' ? 'bg-green-400/20 text-green-100' :
                tienda.last_state === 'observada' ? 'bg-yellow-400/20 text-yellow-100' :
                tienda.last_state === 'critica' ? 'bg-red-400/20 text-red-100' :
                'bg-white/20 text-white/80'
              }`}>
                {tienda.last_state?.replace('_', ' ')?.toUpperCase() || 'SIN AUDITORÍA'}
              </span>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={onVolver}
              className="flex items-center space-x-2 px-4 py-2 bg-white/25 hover:bg-white/35 rounded-xl text-white text-sm font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Volver al listado</span>
            </button>
            <button
              onClick={() => setShowAuditoria(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-medium transition-colors"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Nueva Auditoría</span>
            </button>
          </div>
        </div>

        {/* Info bar */}
        <div className="px-6 py-3 bg-gray-50 flex flex-wrap items-center gap-6 text-sm">
          <div>
            <span className="text-gray-500">Última auditoría:</span>{' '}
            <span className={`font-semibold ${vencida ? 'text-red-600' : 'text-gray-700'}`}>
              {tienda.last_audit_at ? new Date(tienda.last_audit_at).toLocaleDateString('es-CL') : 'Nunca'}
              {vencida && <AlertTriangle className="w-3.5 h-3.5 inline ml-1 text-red-500" />}
            </span>
          </div>
          {!hideFinancialInfo && (
            <div>
              <span className="text-gray-500">Implementaciones:</span>{' '}
              <span className="font-semibold text-gray-700">{implActivas.length}</span>
            </div>
          )}
          {!hideFinancialInfo && (
            <div>
              <span className="text-gray-500">Inversión activa:</span>{' '}
              <span className="font-semibold text-gray-700">{formatCurrency(inversionTotal)}</span>
            </div>
          )}
          <div>
            <span className="text-gray-500">Tareas abiertas:</span>{' '}
            <span className="font-semibold text-gray-700">{tareasAbiertas.length}</span>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex space-x-1 bg-white rounded-xl shadow-sm p-1">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSubTab === tab.id
                ? 'bg-[#235250] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Contenido del sub-tab */}
      {activeSubTab === 'resumen' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h4 className="font-semibold text-gray-700 mb-3">Score Actual</h4>
            <div className="text-center">
              <div className="text-5xl font-bold" style={{ color: scoreColor }}>
                {tienda.last_score != null ? `${tienda.last_score}%` : '-'}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {tienda.last_state === 'ok' ? 'Estado saludable' :
                 tienda.last_state === 'observada' ? 'Requiere atención' :
                 tienda.last_state === 'critica' ? 'Estado crítico' :
                 'Sin evaluar'}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h4 className="font-semibold text-gray-700 mb-3">Resumen</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Auditorías realizadas</span><span className="font-semibold">{initialAuditorias.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Ajustes realizados</span><span className="font-semibold">{ajustes.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tareas abiertas</span><span className="font-semibold">{tareasAbiertas.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tipo tienda</span><span className="font-semibold capitalize">{tienda.tipo_tienda || '-'}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h4 className="font-semibold text-gray-700 mb-3">Contacto</h4>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Nombre:</span> <span className="font-semibold">{tienda.contacto_nombre || '-'}</span></p>
              <p><span className="text-gray-500">Teléfono:</span> <span className="font-semibold">{tienda.contacto_telefono || '-'}</span></p>
              <p><span className="text-gray-500">Email:</span> <span className="font-semibold">{tienda.contacto_email || '-'}</span></p>
            </div>
          </div>
        </div>
      )}

      {!hideFinancialInfo && activeSubTab === 'implementacion' && (
        <div className="space-y-4">
          {implActivas.length > 0 ? implActivas.map(impl => (
            <div key={impl.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-800">{impl.nombre}</h4>
                  <p className="text-sm text-gray-500">
                    Instalada: {impl.fecha_instalacion ? new Date(impl.fecha_instalacion).toLocaleDateString('es-CL') : '-'}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold capitalize">{impl.estado}</span>
              </div>

              {/* Costos */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-gray-500 text-xs">Valor Implementación</p>
                  <p className="font-semibold">{formatCurrency((parseFloat(impl.costo_total) || parseFloat(impl.costo_fabricacion) || 0))}</p>
                </div>
                <div className="rounded-lg p-2 text-center" style={{ backgroundColor: '#23525010' }}>
                  <p className="text-xs" style={{ color: '#235250' }}>Total</p>
                  <p className="font-bold" style={{ color: '#235250' }}>{formatCurrency((parseFloat(impl.costo_total) || parseFloat(impl.costo_fabricacion) || 0))}</p>
                </div>
              </div>

              {/* Activos */}
              {impl.audit_activos && impl.audit_activos.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Activos instalados</p>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Tipo</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Descripción</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Cant.</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Costo</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {impl.audit_activos.map(activo => (
                        <tr key={activo.id}>
                          <td className="px-3 py-2 capitalize">{activo.tipo?.replace('_', ' ')}</td>
                          <td className="px-3 py-2">{activo.descripcion || '-'}</td>
                          <td className="px-3 py-2 text-center">{activo.cantidad}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(activo.costo_total)}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              activo.estado === 'bueno' ? 'bg-green-100 text-green-700' :
                              activo.estado === 'regular' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {activo.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay implementaciones registradas en esta tienda</p>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'auditorias' && (
        <div className="space-y-3">
          {initialAuditorias.length > 0 ? initialAuditorias.map(aud => {
            const estadoColor = aud.estado === 'ok' ? 'bg-green-100 text-green-800'
              : aud.estado === 'observada' ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800';
            return (
              <div key={aud.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {new Date(aud.fecha_auditoria).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-500">
                      Auditor: {aud.auditor_nombre || '-'} · Tipo: {aud.tipo_auditoria}
                    </p>
                    {aud.observacion_general && (
                      <p className="text-sm text-gray-600 mt-1 italic">"{aud.observacion_general}"</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{
                      color: aud.score_final >= 80 ? '#16a34a' : aud.score_final >= 60 ? '#f59e0b' : '#dc2626'
                    }}>
                      {aud.score_final != null ? `${aud.score_final}%` : '-'}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${estadoColor}`}>
                      {aud.estado}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span>OK: {aud.items_ok || 0}</span>
                  <span>NO: {aud.items_no || 0}</span>
                  <span>NA: {aud.items_na || 0}</span>
                  <span>Hallazgos: {aud.hallazgos_count || 0}</span>
                </div>
              </div>
            );
          }) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay auditorías registradas</p>
              <button
                onClick={() => setShowAuditoria(true)}
                className="mt-3 px-4 py-2 rounded-xl text-white text-sm font-medium"
                style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
              >
                Realizar primera auditoría
              </button>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'ajustes' && (
        <div className="space-y-3">
          {ajustes.length > 0 ? ajustes.map(aj => (
            <div key={aj.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                    aj.tipo === 'correccion' ? 'bg-blue-100 text-blue-800' :
                    aj.tipo === 'ampliacion' ? 'bg-green-100 text-green-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {aj.tipo}
                  </span>
                  <p className="font-semibold text-gray-800 mt-2">{aj.descripcion || aj.motivo}</p>
                  <p className="text-sm text-gray-500">{new Date(aj.created_at).toLocaleDateString('es-CL')}</p>
                </div>
                {!hideFinancialInfo && (
                  <div className="text-right">
                    {aj.costo > 0 && <p className="font-bold text-gray-800">{formatCurrency(aj.costo)}</p>}
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay ajustes registrados</p>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'tareas' && (
        <div className="space-y-3">
          {initialTareas.length > 0 ? initialTareas.map(tarea => {
            const prioColor = tarea.prioridad === 'urgente' ? 'bg-red-100 text-red-800' :
              tarea.prioridad === 'alta' ? 'bg-orange-100 text-orange-800' :
              tarea.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-600';
            const estadoColor = tarea.estado === 'cerrada' ? 'bg-green-100 text-green-800' :
              tarea.estado === 'en_progreso' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-600';
            return (
              <div key={tarea.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{tarea.titulo}</p>
                    {tarea.descripcion && <p className="text-sm text-gray-500 mt-1">{tarea.descripcion}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${prioColor}`}>{tarea.prioridad}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${estadoColor}`}>{tarea.estado?.replace('_', ' ')}</span>
                      {tarea.responsable && <span className="text-xs text-gray-400">→ {tarea.responsable}</span>}
                    </div>
                  </div>
                  {tarea.fecha_limite && (
                    <p className="text-xs text-gray-400">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(tarea.fecha_limite).toLocaleDateString('es-CL')}
                    </p>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <ListTodo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay tareas registradas</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DetalleTienda;
