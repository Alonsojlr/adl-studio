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

// ===== Facturas de protocolo =====
export const getProtocolosFacturas = async (protocolosIds = []) => {
  let query = supabase
    .from('protocolos_facturas')
    .select('*')
    .order('fecha', { ascending: false })

  if (protocolosIds.length > 0) {
    query = query.in('protocolo_id', protocolosIds)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export const createProtocoloFactura = async (factura) => {
  const { data, error } = await supabase
    .from('protocolos_facturas')
    .insert([factura])
    .select()

  if (error) throw error
  return data[0]
}

export const updateProtocoloFactura = async (id, updates) => {
  const { data, error } = await supabase
    .from('protocolos_facturas')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

export const deleteProtocoloFactura = async (id) => {
  const { error } = await supabase
    .from('protocolos_facturas')
    .delete()
    .eq('id', id)

  if (error) throw error
}
