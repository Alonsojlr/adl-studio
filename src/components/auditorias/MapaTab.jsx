import React, { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import { AlertTriangle, Camera, Calendar, CheckCircle2, Filter, Loader2, MapPin, Search, Store, XCircle } from 'lucide-react'
import { getStoreStatusSnapshot, getTiendaFotos, uploadTiendaFotosBatch } from '../../api/audit-mapa'
import {
  PHOTO_TYPE_LABELS,
  STATE_META,
  computeKPIs,
  formatDate,
  groupPhotosByDateAndType,
  hasValidLatLng,
  normalizeState,
  toNumber
} from './mapaUtils'

const DEFAULT_CENTER = [-70.6693, -33.4489]
const DEFAULT_ZOOM = 5
const PHOTO_TYPES = ['visita_inicial', 'implementacion', 'seguimiento', 'otra']
const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(toNumber(value))
}

const formatStateLabel = (state) => {
  const meta = STATE_META[normalizeState(state)]
  return meta?.label || 'Sin auditoría'
}

const formatStateColor = (state) => {
  const meta = STATE_META[normalizeState(state)]
  return meta?.color || '#64748b'
}

const buildStorePinIcon = (store, isSelected = false) => {
  const pinColor = formatStateColor(store?.last_state)
  const pinSize = isSelected ? 22 : 16
  const border = isSelected ? 3 : 2
  const overdueHalo = Boolean(store?.audit_overdue)
  const haloSize = isSelected ? 34 : 28

  return L.divIcon({
    className: '',
    html: `
      <span style="position:relative;display:inline-flex;align-items:center;justify-content:center;width:${haloSize}px;height:${haloSize}px;">
        ${overdueHalo ? `<span style="position:absolute;width:${haloSize}px;height:${haloSize}px;border-radius:9999px;background:#ef4444;opacity:0.25;"></span>` : ''}
        <span style="position:relative;display:inline-block;width:${pinSize}px;height:${pinSize}px;border-radius:9999px;background:${pinColor};border:${border}px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></span>
      </span>
    `,
    iconSize: [haloSize, haloSize],
    iconAnchor: [haloSize / 2, haloSize / 2]
  })
}

const MapaTab = ({ user, hideFinancialInfo = false, onOpenStore }) => {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersLayerRef = useRef(null)
  const markerRefsById = useRef(new Map())
  const storesByIdRef = useRef(new Map())

  const [loading, setLoading] = useState(true)
  const [dataError, setDataError] = useState('')
  const [mapError, setMapError] = useState('')
  const [mapReady, setMapReady] = useState(false)
  const [stores, setStores] = useState([])
  const [regions, setRegions] = useState([])
  const [selectedStore, setSelectedStore] = useState(null)

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState({
    region: 'todas',
    state: 'todos',
    overdueOnly: false,
    dateFrom: '',
    dateTo: '',
    minInvestment: 0
  })

  const [photoForm, setPhotoForm] = useState({
    tipo: 'visita_inicial',
    fecha_evento: new Date().toISOString().split('T')[0],
    descripcion: '',
    files: []
  })
  const [loadingPhotos, setLoadingPhotos] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [photos, setPhotos] = useState([])

  const canCreateAuditoria = ['admin', 'comercial', 'trade_marketing', 'auditor'].includes(user?.role)
  const canRegistrarAjuste = ['admin', 'comercial', 'trade_marketing'].includes(user?.role)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const allStores = await getStoreStatusSnapshot({})
        const uniqueRegions = [...new Set((allStores || []).map((s) => s.region).filter(Boolean))].sort()
        setRegions(uniqueRegions)
      } catch (e) {
        console.error('Error cargando regiones del mapa:', e)
      }
    }
    loadRegions()
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadStores = async () => {
      setLoading(true)
      setDataError('')
      try {
        const data = await getStoreStatusSnapshot({
          search: debouncedSearch || undefined,
          region: filters.region,
          state: filters.state,
          overdueOnly: filters.overdueOnly,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          minInvestment: hideFinancialInfo ? 0 : toNumber(filters.minInvestment)
        })
        if (cancelled) return
        setStores(data || [])
      } catch (e) {
        if (cancelled) return
        console.error('Error cargando snapshot del mapa:', e)
        setDataError('No se pudo cargar el mapa de tiendas')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadStores()
    return () => {
      cancelled = true
    }
  }, [debouncedSearch, filters, hideFinancialInfo])

  useEffect(() => {
    const mappedById = new Map()
    stores.forEach((store) => mappedById.set(store.store_id, store))
    storesByIdRef.current = mappedById

    if (selectedStore?.store_id) {
      const updated = mappedById.get(selectedStore.store_id)
      setSelectedStore(updated || null)
    }
  }, [stores])

  const mapStores = useMemo(() => {
    return stores.filter((store) => hasValidLatLng(store))
  }, [stores])

  const kpis = useMemo(() => computeKPIs(stores, hideFinancialInfo), [stores, hideFinancialInfo])

  const groupedPhotos = useMemo(() => groupPhotosByDateAndType(photos), [photos])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    setMapError('')
    setMapReady(false)

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      preferCanvas: true,
      worldCopyJump: true
    }).setView([DEFAULT_CENTER[1], DEFAULT_CENTER[0]], DEFAULT_ZOOM)
    mapRef.current = map
    L.control.zoom({ position: 'topright' }).addTo(map)

    let tileErrors = 0
    const tileLayer = L.tileLayer(OSM_TILE_URL, {
      maxZoom: 19,
      attribution: OSM_ATTRIBUTION
    })

    tileLayer.on('tileerror', () => {
      tileErrors += 1
      if (tileErrors > 3) {
        setMapError('No se pudo cargar correctamente el mapa base. Revisa tu conexión de red.')
      }
    })

    tileLayer.addTo(map)
    markersLayerRef.current = L.layerGroup().addTo(map)
    setMapReady(true)
    requestAnimationFrame(() => map.invalidateSize())
    const resizeTimeout = setTimeout(() => map.invalidateSize(), 180)

    return () => {
      clearTimeout(resizeTimeout)
      setMapReady(false)
      map.remove()
      mapRef.current = null
      markersLayerRef.current = null
      markerRefsById.current.clear()
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    const timeout = setTimeout(() => {
      mapRef.current?.invalidateSize()
    }, 120)
    return () => clearTimeout(timeout)
  }, [stores.length, selectedStore?.store_id])

  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return

    const markersLayer = markersLayerRef.current
    markersLayer.clearLayers()
    markerRefsById.current.clear()

    mapStores.forEach((store) => {
      const lat = toNumber(store.lat)
      const lng = toNumber(store.lng)
      const isSelected = selectedStore?.store_id === store.store_id
      const marker = L.marker([lat, lng], {
        icon: buildStorePinIcon(store, isSelected),
        title: store.store_name || 'Tienda',
        keyboard: true
      })
      marker.on('click', () => {
        const targetStore = storesByIdRef.current.get(store.store_id) || store
        setSelectedStore(targetStore)
      })
      marker.addTo(markersLayer)
      markerRefsById.current.set(store.store_id, marker)
    })
  }, [mapStores, selectedStore?.store_id])

  useEffect(() => {
    if (!mapRef.current) return
    if (mapStores.length === 0) {
      mapRef.current.setView([DEFAULT_CENTER[1], DEFAULT_CENTER[0]], DEFAULT_ZOOM, { animate: false })
      return
    }

    const bounds = L.latLngBounds(
      mapStores.map((store) => [toNumber(store.lat, DEFAULT_CENTER[1]), toNumber(store.lng, DEFAULT_CENTER[0])])
    )
    mapRef.current.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 12,
      animate: true
    })
  }, [mapStores])

  useEffect(() => {
    if (!mapRef.current) return
    if (selectedStore?.lng != null && selectedStore?.lat != null) {
      mapRef.current.flyTo(
        [toNumber(selectedStore.lat, DEFAULT_CENTER[1]), toNumber(selectedStore.lng, DEFAULT_CENTER[0])],
        Math.max(mapRef.current.getZoom(), 12),
        { animate: true, duration: 0.6 }
      )
    }
  }, [selectedStore])

  useEffect(() => {
    let cancelled = false
    const loadPhotos = async () => {
      if (!selectedStore?.store_id) {
        setPhotos([])
        return
      }
      setLoadingPhotos(true)
      try {
        const data = await getTiendaFotos(selectedStore.store_id)
        if (!cancelled) setPhotos(data || [])
      } catch (e) {
        console.error('Error cargando fotos de tienda:', e)
      } finally {
        if (!cancelled) setLoadingPhotos(false)
      }
    }
    loadPhotos()
    return () => {
      cancelled = true
    }
  }, [selectedStore?.store_id])

  const handleStoreCardClick = (store) => {
    setSelectedStore(store)
  }

  const handleUploadPhotos = async () => {
    if (!selectedStore?.store_id) {
      alert('Selecciona una tienda')
      return
    }
    if (!photoForm.files || photoForm.files.length === 0) {
      alert('Selecciona al menos una foto')
      return
    }

    try {
      setUploadingPhotos(true)
      await uploadTiendaFotosBatch(selectedStore.store_id, photoForm.files, {
        tipo: photoForm.tipo,
        fecha_evento: photoForm.fecha_evento,
        descripcion: photoForm.descripcion,
        created_by: user?.id || null,
        created_by_name: user?.name || null
      })

      const updatedPhotos = await getTiendaFotos(selectedStore.store_id)
      setPhotos(updatedPhotos || [])
      setPhotoForm((prev) => ({ ...prev, descripcion: '', files: [] }))
      alert('Fotos registradas correctamente')
    } catch (e) {
      console.error('Error subiendo fotos de tienda:', e)
      alert('Error al subir fotos de la tienda')
    } finally {
      setUploadingPhotos(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Mapa</h2>
        <p className="text-gray-600">Visualiza tiendas por ubicación y estado operacional</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="order-2 lg:order-1 lg:w-[360px] xl:w-[390px] shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5 h-fit">
          <div className="grid grid-cols-2 gap-3">
            <KpiCard title="Tiendas" value={kpis.visibleStores} icon={Store} color="#235250" />
            <KpiCard title="Críticas" value={kpis.criticalStores} icon={XCircle} color="#dc2626" />
            <KpiCard title="Vencidas" value={kpis.overdueStores} icon={AlertTriangle} color="#f59e0b" />
            {!hideFinancialInfo && (
              <KpiCard title="Inversión" value={formatCurrency(kpis.visibleInvestment)} icon={CheckCircle2} color="#2563eb" />
            )}
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Filter className="w-4 h-4" />
              Filtros
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar tienda..."
                className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#45ad98] text-sm"
              />
            </div>

            <select
              value={filters.region}
              onChange={(e) => setFilters((prev) => ({ ...prev, region: e.target.value }))}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#45ad98]"
            >
              <option value="todas">Todas las regiones</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>

            <select
              value={filters.state}
              onChange={(e) => setFilters((prev) => ({ ...prev, state: e.target.value }))}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#45ad98]"
            >
              <option value="todos">Todos los estados</option>
              <option value="ok">OK</option>
              <option value="observada">Observada</option>
              <option value="critica">Crítica</option>
              <option value="sin_auditoria">Sin auditoría</option>
            </select>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={filters.overdueOnly}
                onChange={(e) => setFilters((prev) => ({ ...prev, overdueOnly: e.target.checked }))}
                className="rounded"
              />
              Solo vencidas
            </label>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Desde</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#45ad98]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#45ad98]"
                />
              </div>
            </div>

            {!hideFinancialInfo && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Inversión mínima: {formatCurrency(filters.minInvestment)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="15000000"
                  step="250000"
                  value={filters.minInvestment}
                  onChange={(e) => setFilters((prev) => ({ ...prev, minInvestment: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Tiendas</h3>
              <span className="text-xs text-gray-500">{stores.length}</span>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {loading && (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando tiendas...
                </div>
              )}
              {!loading && stores.length === 0 && (
                <p className="text-sm text-gray-500">No hay tiendas para esos filtros.</p>
              )}
              {!loading &&
                stores.map((store) => {
                  const active = selectedStore?.store_id === store.store_id
                  const stateColor = formatStateColor(store.last_state)
                  return (
                    <button
                      key={store.store_id}
                      onClick={() => handleStoreCardClick(store)}
                      className={`w-full text-left border rounded-xl p-3 transition-all ${
                        active ? 'border-[#45ad98] bg-[#45ad98]/5' : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <p className="font-semibold text-gray-800">{store.store_name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {store.city || 'Sin ciudad'}{store.region ? `, ${store.region}` : ''}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span
                          className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
                          style={{ backgroundColor: stateColor }}
                        >
                          {formatStateLabel(store.last_state)}
                        </span>
                        {store.last_score != null && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                            {Math.round(toNumber(store.last_score))}%
                          </span>
                        )}
                        {store.audit_overdue && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">
                            Vencida
                          </span>
                        )}
                        {!hideFinancialInfo && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">
                            {formatCurrency(store.active_investment_total)}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
            </div>
          </div>
        </aside>

        <section className="order-1 lg:order-2 relative bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[560px] lg:min-h-[760px] lg:flex-1 overflow-hidden">
          {dataError && (
            <div className="absolute top-4 left-4 right-4 z-20 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
              {dataError}
            </div>
          )}

          {mapError && (
            <div className="absolute top-4 left-4 right-4 z-20 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-800 text-sm">
              {mapError}
            </div>
          )}

          <div ref={mapContainerRef} className="absolute inset-0" />

          {!mapReady && !mapError && (
            <div className="absolute top-4 left-4 z-20 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-blue-800 text-sm">
              Cargando vista del mapa...
            </div>
          )}

          {mapStores.length === 0 && (
            <div className="absolute top-4 left-4 right-4 z-20 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 text-sm">
              No hay tiendas con coordenadas válidas (lat/lng) para mostrar pins en el mapa.
            </div>
          )}

          {selectedStore && (
            <div className="absolute top-4 right-4 bottom-4 w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-30 flex flex-col overflow-hidden">
              <div className="px-5 py-4 border-b bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{selectedStore.store_name}</h3>
                    <p className="text-sm text-gray-500">{selectedStore.city || '-'}{selectedStore.region ? `, ${selectedStore.region}` : ''}</p>
                  </div>
                  <button
                    onClick={() => setSelectedStore(null)}
                    className="text-gray-400 hover:text-gray-700"
                    title="Cerrar"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <InfoPill label="Estado" value={formatStateLabel(selectedStore.last_state)} />
                  <InfoPill label="Score" value={selectedStore.last_score != null ? `${Math.round(toNumber(selectedStore.last_score))}%` : '-'} />
                  <InfoPill label="Última auditoría" value={formatDate(selectedStore.last_audit_at)} />
                  <InfoPill
                    label="Vencida"
                    value={selectedStore.audit_overdue ? (selectedStore.overdue_days != null ? `${selectedStore.overdue_days} días` : 'Sí') : 'No'}
                  />
                  {!hideFinancialInfo && (
                    <InfoPill label="Inversión activa" value={formatCurrency(selectedStore.active_investment_total)} />
                  )}
                </div>

                {selectedStore.address && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-700">Dirección:</span> {selectedStore.address}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onOpenStore?.(selectedStore.store_id)}
                    className="px-3 py-2 rounded-lg text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #235250 0%, #45ad98 100%)' }}
                  >
                    Ver detalle tienda
                  </button>
                  <button
                    disabled={!canCreateAuditoria}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                      canCreateAuditoria
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={() => alert('Atajo a Crear Auditoría se incorporará en el siguiente ajuste.')}
                  >
                    Crear auditoría
                  </button>
                  <button
                    disabled={!canRegistrarAjuste}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                      canRegistrarAjuste
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={() => alert('Atajo a Registrar Ajuste se incorporará en el siguiente ajuste.')}
                  >
                    Registrar ajuste
                  </button>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-gray-500" />
                    <h4 className="font-semibold text-gray-800">Registro fotográfico</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tipo</label>
                      <select
                        value={photoForm.tipo}
                        onChange={(e) => setPhotoForm((prev) => ({ ...prev, tipo: e.target.value }))}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                      >
                        {PHOTO_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {PHOTO_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Fecha</label>
                      <input
                        type="date"
                        value={photoForm.fecha_evento}
                        onChange={(e) => setPhotoForm((prev) => ({ ...prev, fecha_evento: e.target.value }))}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <textarea
                    value={photoForm.descripcion}
                    onChange={(e) => setPhotoForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                    rows={2}
                    placeholder="Descripción opcional"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                  />

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setPhotoForm((prev) => ({ ...prev, files: Array.from(e.target.files || []) }))}
                    className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium"
                  />

                  <button
                    onClick={handleUploadPhotos}
                    disabled={uploadingPhotos}
                    className={`w-full py-2 rounded-lg text-sm font-semibold ${
                      uploadingPhotos ? 'bg-gray-200 text-gray-600' : 'bg-[#235250] text-white hover:bg-[#1f4442]'
                    }`}
                  >
                    {uploadingPhotos ? 'Subiendo fotos...' : 'Agregar fotos'}
                  </button>

                  <div className="space-y-3">
                    {loadingPhotos && (
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cargando fotos...
                      </div>
                    )}

                    {!loadingPhotos && groupedPhotos.length === 0 && (
                      <p className="text-sm text-gray-500">Aún no hay fotos registradas para esta tienda.</p>
                    )}

                    {!loadingPhotos &&
                      groupedPhotos.map((group) => (
                        <div key={`${group.fecha_evento}-${group.tipo}`} className="rounded-xl border border-gray-200 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                              {PHOTO_TYPE_LABELS[group.tipo] || 'Otra'}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(group.fecha_evento)}
                            </span>
                          </div>
                          {group.descripcion && (
                            <p className="text-xs text-gray-600 mb-2">{group.descripcion}</p>
                          )}
                          <div className="grid grid-cols-3 gap-2">
                            {group.items.map((photo) => (
                              <a
                                key={photo.id}
                                href={photo.foto_url}
                                target="_blank"
                                rel="noreferrer"
                                className="block rounded-lg overflow-hidden border border-gray-200"
                              >
                                <img
                                  src={photo.foto_url}
                                  alt={PHOTO_TYPE_LABELS[group.tipo] || 'Foto tienda'}
                                  className="w-full h-20 object-cover"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

const KpiCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
      <div className="flex items-center justify-between mb-1">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-[11px] text-gray-500">{title}</span>
      </div>
      <p className="text-sm font-bold text-gray-800 truncate">{value}</p>
    </div>
  )
}

const InfoPill = ({ label, value }) => (
  <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
    <p className="text-[11px] text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value}</p>
  </div>
)

export default MapaTab
