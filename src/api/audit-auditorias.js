import { supabase } from '../lib/supabaseClient'

// =====================================================
// AUDITORÍAS
// =====================================================

export const getAuditorias = async () => {
  const { data, error } = await supabase
    .from('audit_auditorias')
    .select('*')
    .order('fecha_auditoria', { ascending: false })
  if (error) throw error
  return data
}

export const getAuditoriasByTienda = async (tiendaId) => {
  const { data, error } = await supabase
    .from('audit_auditorias')
    .select('*')
    .eq('tienda_id', tiendaId)
    .order('fecha_auditoria', { ascending: false })
  if (error) throw error
  return data
}

export const getAuditoriaById = async (id) => {
  const { data, error } = await supabase
    .from('audit_auditorias')
    .select('*, audit_respuestas(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const createAuditoria = async (auditoria) => {
  const { data, error } = await supabase
    .from('audit_auditorias')
    .insert([auditoria])
    .select()
  if (error) throw error
  return data[0]
}

export const updateAuditoria = async (id, updates) => {
  const { data, error } = await supabase
    .from('audit_auditorias')
    .update(updates)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

export const deleteAuditoria = async (id) => {
  const { error } = await supabase
    .from('audit_auditorias')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// =====================================================
// RESPUESTAS
// =====================================================

export const createRespuestas = async (respuestas) => {
  const { data, error } = await supabase
    .from('audit_respuestas')
    .insert(respuestas)
    .select()
  if (error) throw error
  return data
}

export const getRespuestasByAuditoria = async (auditoriaId) => {
  const { data, error } = await supabase
    .from('audit_respuestas')
    .select('*')
    .eq('auditoria_id', auditoriaId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

// =====================================================
// HALLAZGOS
// =====================================================

export const getHallazgos = async () => {
  const { data, error } = await supabase
    .from('audit_hallazgos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getHallazgosByTienda = async (tiendaId) => {
  const { data, error } = await supabase
    .from('audit_hallazgos')
    .select('*')
    .eq('tienda_id', tiendaId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const createHallazgo = async (hallazgo) => {
  const { data, error } = await supabase
    .from('audit_hallazgos')
    .insert([hallazgo])
    .select()
  if (error) throw error
  return data[0]
}

export const createHallazgosBatch = async (hallazgos) => {
  const { data, error } = await supabase
    .from('audit_hallazgos')
    .insert(hallazgos)
    .select()
  if (error) throw error
  return data
}

export const updateHallazgo = async (id, updates) => {
  const { data, error } = await supabase
    .from('audit_hallazgos')
    .update(updates)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

// =====================================================
// FOTOS (Supabase Storage)
// =====================================================

export const uploadFotoAuditoria = async (file, path) => {
  const { data, error } = await supabase.storage
    .from('audit-fotos')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })
  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('audit-fotos')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

// =====================================================
// PLANTILLAS
// =====================================================

export const getPlantillas = async () => {
  const { data, error } = await supabase
    .from('audit_plantillas')
    .select('*, audit_plantilla_items(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getPlantillaById = async (id) => {
  const { data, error } = await supabase
    .from('audit_plantillas')
    .select('*, audit_plantilla_items(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  // Ordenar items por orden
  if (data && data.audit_plantilla_items) {
    data.audit_plantilla_items.sort((a, b) => a.orden - b.orden)
  }
  return data
}

export const createPlantilla = async (plantilla) => {
  const { data, error } = await supabase
    .from('audit_plantillas')
    .insert([plantilla])
    .select()
  if (error) throw error
  return data[0]
}

export const updatePlantilla = async (id, updates) => {
  const { data, error } = await supabase
    .from('audit_plantillas')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

export const deletePlantilla = async (id) => {
  const { error } = await supabase
    .from('audit_plantillas')
    .update({ is_active: false })
    .eq('id', id)
  if (error) throw error
}

// =====================================================
// ITEMS DE PLANTILLA
// =====================================================

export const createPlantillaItem = async (item) => {
  const { data, error } = await supabase
    .from('audit_plantilla_items')
    .insert([item])
    .select()
  if (error) throw error
  return data[0]
}

export const updatePlantillaItem = async (id, updates) => {
  const { data, error } = await supabase
    .from('audit_plantilla_items')
    .update(updates)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

export const deletePlantillaItem = async (id) => {
  const { error } = await supabase
    .from('audit_plantilla_items')
    .delete()
    .eq('id', id)
  if (error) throw error
}
