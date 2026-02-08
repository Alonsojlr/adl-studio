import { supabase } from '../lib/supabaseClient'

// =====================================================
// IMPLEMENTACIONES
// =====================================================

export const getImplementaciones = async () => {
  const { data, error } = await supabase
    .from('audit_implementaciones')
    .select('*, audit_activos(*)')
    .order('fecha_instalacion', { ascending: false })
  if (error) throw error
  return data
}

export const getImplementacionesByTienda = async (tiendaId) => {
  const { data, error } = await supabase
    .from('audit_implementaciones')
    .select('*, audit_activos(*)')
    .eq('tienda_id', tiendaId)
    .order('fecha_instalacion', { ascending: false })
  if (error) throw error
  return data
}

export const createImplementacion = async (impl) => {
  const { data, error } = await supabase
    .from('audit_implementaciones')
    .insert([impl])
    .select()
  if (error) throw error
  return data[0]
}

export const updateImplementacion = async (id, updates) => {
  const { data, error } = await supabase
    .from('audit_implementaciones')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

export const deleteImplementacion = async (id) => {
  const { error } = await supabase
    .from('audit_implementaciones')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// =====================================================
// ACTIVOS
// =====================================================

export const getActivosByImplementacion = async (implId) => {
  const { data, error } = await supabase
    .from('audit_activos')
    .select('*')
    .eq('implementacion_id', implId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export const createActivo = async (activo) => {
  const { data, error } = await supabase
    .from('audit_activos')
    .insert([activo])
    .select()
  if (error) throw error
  return data[0]
}

export const updateActivo = async (id, updates) => {
  const { data, error } = await supabase
    .from('audit_activos')
    .update(updates)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

export const deleteActivo = async (id) => {
  const { error } = await supabase
    .from('audit_activos')
    .delete()
    .eq('id', id)
  if (error) throw error
}
