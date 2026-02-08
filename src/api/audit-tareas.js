import { supabase } from '../lib/supabaseClient'

// =====================================================
// TAREAS
// =====================================================

export const getTareas = async () => {
  const { data, error } = await supabase
    .from('audit_tareas')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getTareasByTienda = async (tiendaId) => {
  const { data, error } = await supabase
    .from('audit_tareas')
    .select('*')
    .eq('tienda_id', tiendaId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getTareasByResponsable = async (responsable) => {
  const { data, error } = await supabase
    .from('audit_tareas')
    .select('*')
    .eq('responsable', responsable)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const createTarea = async (tarea) => {
  const { data, error } = await supabase
    .from('audit_tareas')
    .insert([tarea])
    .select()
  if (error) throw error
  return data[0]
}

export const updateTarea = async (id, updates) => {
  if (updates.estado === 'cerrada' && !updates.closed_at) {
    updates.closed_at = new Date().toISOString()
  }
  const { data, error } = await supabase
    .from('audit_tareas')
    .update(updates)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

export const deleteTarea = async (id) => {
  const { error } = await supabase
    .from('audit_tareas')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// =====================================================
// AJUSTES / REITERACIONES
// =====================================================

export const getAjustes = async () => {
  const { data, error } = await supabase
    .from('audit_ajustes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getAjustesByTienda = async (tiendaId) => {
  const { data, error } = await supabase
    .from('audit_ajustes')
    .select('*')
    .eq('tienda_id', tiendaId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const createAjuste = async (ajuste) => {
  const { data, error } = await supabase
    .from('audit_ajustes')
    .insert([ajuste])
    .select()
  if (error) throw error
  return data[0]
}

export const updateAjuste = async (id, updates) => {
  const { data, error } = await supabase
    .from('audit_ajustes')
    .update(updates)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

export const deleteAjuste = async (id) => {
  const { error } = await supabase
    .from('audit_ajustes')
    .delete()
    .eq('id', id)
  if (error) throw error
}
