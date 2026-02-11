import { supabase } from '../lib/supabaseClient'

const ITEMS_TABLE = 'Tabla items (inventario)'
const RESERVAS_TABLE = 'Tabla reservas (inventario_reservas)'

export const getInventarioItems = async () => {
  const { data, error } = await supabase
    .from(ITEMS_TABLE)
    .select('*')
    .order('codigo', { ascending: true })

  if (error) throw error
  return data
}

export const getInventarioReservas = async () => {
  const { data, error } = await supabase
    .from(RESERVAS_TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const createInventarioItem = async (item) => {
  const { data, error } = await supabase
    .from(ITEMS_TABLE)
    .insert([item])
    .select()

  if (error) throw error
  return data[0]
}

export const updateInventarioItem = async (id, updates) => {
  const { data, error } = await supabase
    .from(ITEMS_TABLE)
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

export const deleteInventarioItem = async (id) => {
  const { error } = await supabase
    .from(ITEMS_TABLE)
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export const createInventarioReserva = async (reserva) => {
  const { data, error } = await supabase
    .from(RESERVAS_TABLE)
    .insert([reserva])
    .select()

  if (error) throw error
  return data[0]
}

export const updateInventarioReserva = async (id, updates) => {
  const { data, error } = await supabase
    .from(RESERVAS_TABLE)
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

export const deleteInventarioReserva = async (id) => {
  const { error } = await supabase
    .from(RESERVAS_TABLE)
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export const deleteInventarioReservasByItem = async (itemId, { onlyReturned = false } = {}) => {
  let query = supabase
    .from(RESERVAS_TABLE)
    .delete()
    .eq('item_id', itemId)

  if (onlyReturned) {
    query = query.eq('devuelto', true)
  }

  const { error } = await query
  if (error) throw error
  return true
}
