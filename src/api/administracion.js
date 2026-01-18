import { supabase } from '../lib/supabaseClient'

export const getGastosAdministracion = async () => {
  const { data, error } = await supabase
    .from('administracion_gastos')
    .select('*')
    .order('fecha', { ascending: false })

  if (error) throw error
  return data
}

export const createGastoAdministracion = async (gasto) => {
  const { data, error } = await supabase
    .from('administracion_gastos')
    .insert([gasto])
    .select()

  if (error) throw error
  return data[0]
}

export const updateGastoAdministracion = async (id, updates) => {
  const { data, error } = await supabase
    .from('administracion_gastos')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

export const deleteGastoAdministracion = async (id) => {
  const { error } = await supabase
    .from('administracion_gastos')
    .delete()
    .eq('id', id)

  if (error) throw error
}
