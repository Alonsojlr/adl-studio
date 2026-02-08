import { supabase } from '../lib/supabaseClient'

// Obtener todas las tiendas
export const getTiendas = async () => {
  const { data, error } = await supabase
    .from('audit_tiendas')
    .select('*')
    .order('nombre', { ascending: true })
  if (error) throw error
  return data
}

// Obtener tienda por ID
export const getTiendaById = async (id) => {
  const { data, error } = await supabase
    .from('audit_tiendas')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// Crear tienda
export const createTienda = async (tienda) => {
  const { data, error } = await supabase
    .from('audit_tiendas')
    .insert([tienda])
    .select()
  if (error) throw error
  return data[0]
}

// Actualizar tienda
export const updateTienda = async (id, updates) => {
  const { data, error } = await supabase
    .from('audit_tiendas')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

// Eliminar tienda
export const deleteTienda = async (id) => {
  const { error } = await supabase
    .from('audit_tiendas')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Obtener tiendas con auditoría vencida (>30 días)
export const getTiendasEnRiesgo = async () => {
  const hace30Dias = new Date()
  hace30Dias.setDate(hace30Dias.getDate() - 30)

  const { data, error } = await supabase
    .from('audit_tiendas')
    .select('*')
    .eq('is_active', true)
    .or(`last_audit_at.is.null,last_audit_at.lt.${hace30Dias.toISOString()}`)
    .order('last_audit_at', { ascending: true, nullsFirst: true })
  if (error) throw error
  return data
}
