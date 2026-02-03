import { supabase } from '../lib/supabaseClient'

// ============================================================
// AUTENTICACIÓN con Supabase Auth
// ============================================================

// Login: usa Supabase Auth en vez de consulta directa a tabla
export const autenticarUsuario = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error

  // Obtener perfil desde tabla usuarios (vinculado por auth_id)
  const { data: profile, error: profileError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_id', data.user.id)
    .eq('activo', true)
    .single()

  if (profileError) throw new Error('Perfil de usuario no encontrado')

  return profile
}

// Cerrar sesión
export const cerrarSesion = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Obtener sesión actual (para restaurar sesión al recargar)
export const obtenerSesionActual = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) return null

  const { data: profile, error: profileError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_id', session.user.id)
    .eq('activo', true)
    .single()

  if (profileError) return null
  return profile
}

// ============================================================
// GESTIÓN DE USUARIOS (tabla perfiles)
// ============================================================

// Obtener todos los usuarios
export const getUsuarios = async () => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Crear nuevo usuario via Edge Function (solo admin)
export const createUsuario = async (usuario) => {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) throw new Error('No hay sesión activa')

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
      },
      body: JSON.stringify(usuario)
    }
  )

  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Error creando usuario')
  return result.user
}

// Actualizar usuario (perfil en tabla usuarios)
export const updateUsuario = async (id, updates) => {
  const { data, error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

// Desactivar usuario (soft delete)
export const deleteUsuario = async (id) => {
  const { data, error } = await supabase
    .from('usuarios')
    .update({ activo: false })
    .eq('id', id)

  if (error) throw error
  return data
}
