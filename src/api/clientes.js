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