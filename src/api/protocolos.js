import { supabase } from '../lib/supabaseClient'

// Obtener todos los protocolos
export const getProtocolos = async () => {
  const { data, error } = await supabase
    .from('protocolos')
    .select(`
      *,
      clientes (
        razon_social,
        rut
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Crear nuevo protocolo
export const createProtocolo = async (protocolo) => {
  const { data, error } = await supabase
    .from('protocolos')
    .insert([protocolo])
    .select()
  
  if (error) throw error
  return data[0]
}

// Actualizar protocolo
export const updateProtocolo = async (id, updates) => {
  const { data, error } = await supabase
    .from('protocolos')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

// Eliminar protocolo
export const deleteProtocolo = async (id) => {
  const { error } = await supabase
    .from('protocolos')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}
