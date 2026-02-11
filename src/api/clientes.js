import { supabase } from '../lib/supabaseClient'

// Obtener todos los clientes
export const getClientes = async () => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('razon_social', { ascending: true })
  
  if (error) throw error
  return data
}

// Buscar cliente por código
export const getClienteByCodigo = async (codigo) => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('codigo', codigo)
    .single()
  
  if (error) throw error
  return data
}

// Crear nuevo cliente
export const createCliente = async (cliente) => {
  const { data, error } = await supabase
    .from('clientes')
    .insert([cliente])
    .select()
  
  if (error) throw error
  return data[0]
}

// Actualizar cliente
export const updateCliente = async (id, updates) => {
  const { data, error } = await supabase
    .from('clientes')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

// Eliminar cliente
export const deleteCliente = async (id) => {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// =====================================================
// CONTACTOS DE CLIENTES
// =====================================================

// Obtener contactos de un cliente
export const getContactosByCliente = async (clienteId) => {
  const { data, error } = await supabase
    .from('clientes_contactos')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('es_principal', { ascending: false })
    .order('nombre', { ascending: true })

  if (error) throw error
  return data
}

// Crear contacto
export const createContacto = async (contacto) => {
  const { data, error } = await supabase
    .from('clientes_contactos')
    .insert([contacto])
    .select()

  if (error) throw error
  return data[0]
}

// Actualizar contacto
export const updateContacto = async (id, updates) => {
  const { data, error } = await supabase
    .from('clientes_contactos')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

// Eliminar contacto
export const deleteContacto = async (id) => {
  const { error } = await supabase
    .from('clientes_contactos')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Obtener todos los contactos (para cargar con clientes)
export const getAllContactos = async () => {
  const { data, error } = await supabase
    .from('clientes_contactos')
    .select('*')
    .order('nombre', { ascending: true })

  if (error) throw error
  return data
}