import React from 'react';
import { Store, ClipboardCheck, AlertTriangle, DollarSign, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

const DashboardAudit = ({ tiendas, auditorias, implementaciones, tareas, formatCurrency, onVerTienda }) => {
  // Calcular KPIs
  const tiendasActivas = tiendas.filter(t => t.is_active);
  const hace30Dias = new Date();
  hace30Dias.setDate(hace30Dias.getDate() - 30);

  const tiendasEnRiesgo = tiendasActivas.filter(t =>
    !t.last_audit_at || new Date(t.last_audit_at) < hace30Dias
  );

  const tiendasOK = tiendasActivas.filter(t => t.last_state === 'ok');
  const tiendasObservadas = tiendasActivas.filter(t => t.last_state === 'observada');
  const tiendasCriticas = tiendasActivas.filter(t => t.last_state === 'critica');

  const implActivas = implementaciones.filter(i => i.estado === 'activa');
  const inversionActiva = implActivas.reduce((sum, i) => sum + (parseFloat(i.costo_total) || 0), 0);

  const auditoriasUltimoMes = auditorias.filter(a => new Date(a.fecha_auditoria) >= hace30Dias);
  const tareasAbiertas = tareas.filter(t => t.estado !== 'cerrada');

  const pctTiendasOK = tiendasActivas.length > 0
    ? Math.round((tiendasOK.length / tiendasActivas.length) * 100)
    : 0;

  const scorePromedio = tiendasActivas.filter(t => t.last_score != null).length > 0
    ? Math.round(tiendasActivas.filter(t => t.last_score != null).reduce((sum, t) => sum + parseFloat(t.last_score), 0) / tiendasActivas.filter(t => t.last_score != null).length)
    : 0;

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Tiendas Activas" value={tiendasActivas.length} icon={Store} color="#235250" subtitle={`${implActivas.length} implementaciones`} />
        <StatCard title="Inversión Activa" value={formatCurrency(inversionActiva)} icon={DollarSign} color="#16a34a" />
        <StatCard title="Auditorías (30d)" value={auditoriasUltimoMes.length} icon={ClipboardCheck} color="#2563eb" subtitle={`Score promedio: ${scorePromedio}%`} />
        <StatCard title="% Tiendas OK" value={`${pctTiendasOK}%`} icon={CheckCircle} color="#45ad98" subtitle={`${tiendasOK.length} de ${tiendasActivas.length}`} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="En Riesgo" value={tiendasEnRiesgo.length} icon={AlertTriangle} color="#dc2626" subtitle="Auditoría vencida" />
        <StatCard title="Observadas" value={tiendasObservadas.length} icon={Clock} color="#f59e0b" subtitle="Score 60-79" />
        <StatCard title="Críticas" value={tiendasCriticas.length} icon={XCircle} color="#dc2626" subtitle="Score < 60" />
        <StatCard title="Tareas Abiertas" value={tareasAbiertas.length} icon={TrendingUp} color="#7c3aed" />
      </div>

      {/* Tiendas en riesgo */}
      {tiendasEnRiesgo.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Tiendas en Riesgo (auditoría vencida)</span>
          </h3>
          <div className="space-y-3">
            {tiendasEnRiesgo.slice(0, 10).map((tienda) => {
              const diasSinAuditoria = tienda.last_audit_at
                ? Math.floor((new Date() - new Date(tienda.last_audit_at)) / (1000 * 60 * 60 * 24))
                : null;
              return (
                <div
                  key={tienda.id}
                  onClick={() => onVerTienda(tienda)}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-xl hover:bg-red-100 cursor-pointer transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{tienda.nombre}</p>
                    <p className="text-sm text-gray-500">{tienda.region} · {tienda.ciudad}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-600">
                      {diasSinAuditoria != null ? `${diasSinAuditoria} días sin auditoría` : 'Sin auditoría'}
                    </p>
                    {tienda.last_score != null && (
                      <p className="text-xs text-gray-500">Último score: {tienda.last_score}%</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Últimas auditorías */}
      {auditorias.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <ClipboardCheck className="w-5 h-5 text-blue-500" />
            <span>Últimas Auditorías</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Tienda</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Fecha</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Auditor</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Score</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Estado</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Hallazgos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditorias.slice(0, 10).map((aud) => {
                  const tienda = tiendas.find(t => t.id === aud.tienda_id);
                  const estadoColor = aud.estado === 'ok' ? 'bg-green-100 text-green-800'
                    : aud.estado === 'observada' ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800';
                  return (
                    <tr key={aud.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{tienda?.nombre || 'N/A'}</td>
                      <td className="px-4 py-3">{new Date(aud.fecha_auditoria).toLocaleDateString('es-CL')}</td>
                      <td className="px-4 py-3">{aud.auditor_nombre || '-'}</td>
                      <td className="px-4 py-3 text-center font-bold">{aud.score_final != null ? `${aud.score_final}%` : '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${estadoColor}`}>
                          {aud.estado || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{aud.hallazgos_count || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {tiendas.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">Sin tiendas registradas</h3>
          <p className="text-gray-400">Comienza agregando tiendas en la pestaña "Tiendas" para empezar a auditar.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardAudit;
