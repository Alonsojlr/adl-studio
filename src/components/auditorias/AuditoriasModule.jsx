import React, { useState, useEffect } from 'react';
import { BarChart3, Store, Wrench, ClipboardCheck, ListTodo, Map, Settings, Plus, Search, Filter } from 'lucide-react';
import { getTiendas } from '../../api/audit-tiendas';
import { getAuditorias, getPlantillas } from '../../api/audit-auditorias';
import { getImplementaciones } from '../../api/audit-implementaciones';
import { getTareas } from '../../api/audit-tareas';
import DashboardAudit from './DashboardAudit';
import TiendasTab from './TiendasTab';
import ImplementacionesTab from './ImplementacionesTab';
import AuditoriasTab from './AuditoriasTab';
import TareasTab from './TareasTab';
import ConfigTab from './ConfigTab';

const AuditoriasModule = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tiendas, setTiendas] = useState([]);
  const [auditorias, setAuditorias] = useState([]);
  const [implementaciones, setImplementaciones] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tiendasData, auditoriasData, implData, tareasData, plantillasData] = await Promise.all([
        getTiendas(),
        getAuditorias(),
        getImplementaciones(),
        getTareas(),
        getPlantillas()
      ]);
      setTiendas(tiendasData || []);
      setAuditorias(auditoriasData || []);
      setImplementaciones(implData || []);
      setTareas(tareasData || []);
      setPlantillas(plantillasData || []);
    } catch (error) {
      console.error('Error cargando datos de auditorías:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isAdmin = ['admin', 'comercial'].includes(user?.role);

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'tiendas', name: 'Tiendas', icon: Store },
    { id: 'implementaciones', name: 'Implementaciones', icon: Wrench },
    { id: 'auditorias', name: 'Auditorías', icon: ClipboardCheck },
    { id: 'tareas', name: 'Tareas', icon: ListTodo },
    ...(isAdmin ? [{ id: 'config', name: 'Config', icon: Settings }] : [])
  ];

  const handleVerDetalleTienda = (tienda) => {
    setTiendaSeleccionada(tienda);
    setActiveTab('tiendas');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#45ad98]/30 border-t-[#45ad98] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Cargando módulo de auditorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Sub-navegación del módulo */}
      <div className="flex items-center space-x-1 mb-6 bg-white rounded-xl shadow-sm p-1.5 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== 'tiendas') setTiendaSeleccionada(null);
              }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap text-sm font-medium ${
                activeTab === tab.id
                  ? 'text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={activeTab === tab.id ? {
                background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)'
              } : {}}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Contenido del tab activo */}
      {activeTab === 'dashboard' && (
        <DashboardAudit
          tiendas={tiendas}
          auditorias={auditorias}
          implementaciones={implementaciones}
          tareas={tareas}
          formatCurrency={formatCurrency}
          onVerTienda={handleVerDetalleTienda}
        />
      )}

      {activeTab === 'tiendas' && (
        <TiendasTab
          tiendas={tiendas}
          setTiendas={setTiendas}
          auditorias={auditorias}
          implementaciones={implementaciones}
          tareas={tareas}
          plantillas={plantillas}
          tiendaSeleccionada={tiendaSeleccionada}
          setTiendaSeleccionada={setTiendaSeleccionada}
          formatCurrency={formatCurrency}
          user={user}
          onReload={loadData}
        />
      )}

      {activeTab === 'implementaciones' && (
        <ImplementacionesTab
          implementaciones={implementaciones}
          tiendas={tiendas}
          formatCurrency={formatCurrency}
          user={user}
          onReload={loadData}
        />
      )}

      {activeTab === 'auditorias' && (
        <AuditoriasTab
          auditorias={auditorias}
          tiendas={tiendas}
          plantillas={plantillas}
          formatCurrency={formatCurrency}
          user={user}
          onReload={loadData}
        />
      )}

      {activeTab === 'tareas' && (
        <TareasTab
          tareas={tareas}
          tiendas={tiendas}
          user={user}
          onReload={loadData}
        />
      )}

      {activeTab === 'config' && isAdmin && (
        <ConfigTab
          plantillas={plantillas}
          onReload={loadData}
        />
      )}
    </div>
  );
};

export default AuditoriasModule;
