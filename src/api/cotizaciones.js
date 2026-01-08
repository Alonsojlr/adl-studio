import { supabase } from '../lib/supabaseClient'

// Obtener todas las cotizaciones
export const getCotizaciones = async () => {
  const { data, error } = await supabase
    .from('cotizaciones')
    .select(`
      *,
      clientes (
        razon_social,
        rut,
        direccion,
        persona_encargada
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Crear nueva cotización
export const createCotizacion = async (cotizacion) => {
  const { data, error } = await supabase
    .from('cotizaciones')
    .insert([cotizacion])
    .select()
  
  if (error) throw error
  return data[0]
}

// Actualizar cotización
export const updateCotizacion = async (id, updates) => {
  const { data, error } = await supabase
    .from('cotizaciones')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}
// Eliminar cotización
export const deleteCotizacion = async (id) => {
  const { error } = await supabase
    .from('cotizaciones')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}
