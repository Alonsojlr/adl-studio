import { supabase } from '../lib/supabaseClient'

// Obtener todos los proveedores
export const getProveedores = async () => {
  const { data, error } = await supabase
    .from('proveedores')
    .select('*')
    .order('razon_social', { ascending: true })
  
  if (error) throw error
  return data
}

// Buscar proveedor por código
export const getProveedorByCodigo = async (codigo) => {
  const { data, error } = await supabase
    .from('proveedores')
    .select('*')
    .eq('codigo', codigo)
    .single()
  
  if (error) throw error
  return data
}

// Crear nuevo proveedor
export const createProveedor = async (proveedor) => {
  const { data, error } = await supabase
    .from('proveedores')
    .insert([proveedor])
    .select()
  
  if (error) throw error
  return data[0]
}

// Actualizar proveedor
export const updateProveedor = async (id, updates) => {
  const { data, error } = await supabase
    .from('proveedores')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

// Eliminar proveedor
export const deleteProveedor = async (id) => {
  const { error } = await supabase
    .from('proveedores')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}