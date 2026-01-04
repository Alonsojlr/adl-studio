import { supabase } from '../lib/supabaseClient'

// Obtener todos los usuarios
export const getUsuarios = async () => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Autenticar usuario (login)
export const autenticarUsuario = async (email, password) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .eq('activo', true)
    .single()
  
  if (error) throw error
  return data
}

// Crear nuevo usuario
export const createUsuario = async (usuario) => {
  const { data, error } = await supabase
    .from('usuarios')
    .insert([usuario])
    .select()
  
  if (error) throw error
  return data[0]
}

// Actualizar usuario
export const updateUsuario = async (id, updates) => {
  const { data, error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

// Eliminar usuario (desactivar)
export const deleteUsuario = async (id) => {
  const { data, error } = await supabase
    .from('usuarios')
    .update({ activo: false })
    .eq('id', id)
  
  if (error) throw error
  return data
}