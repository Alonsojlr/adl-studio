import { supabase } from '../lib/supabaseClient'

// Obtener todas las órdenes de compra
export const getOrdenesCompra = async () => {
  const { data, error } = await supabase
    .from('ordenes_compra')
    .select(`
      *,
      proveedores (
        razon_social,
        rut
      ),
      ordenes_compra_items (
        id,
        cantidad,
        descripcion,
        valor_unitario,
        descuento
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Crear nueva orden de compra
export const createOrdenCompra = async (orden, items) => {
  // Primero crear la orden
  const { data: ordenData, error: ordenError } = await supabase
    .from('ordenes_compra')
    .insert([orden])
    .select()
  
  if (ordenError) throw ordenError
  
  // Luego crear los items
  if (items && items.length > 0) {
    const itemsConOrdenId = items.map(item => ({
      ...item,
      orden_id: ordenData[0].id
    }))
    
    const { error: itemsError } = await supabase
      .from('ordenes_compra_items')
      .insert(itemsConOrdenId)
    
    if (itemsError) throw itemsError
  }
  
  return ordenData[0]
}

// Actualizar orden de compra
export const updateOrdenCompra = async (id, updates) => {
  const { data, error } = await supabase
    .from('ordenes_compra')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

// Eliminar orden de compra
export const deleteOrdenCompra = async (id) => {
  const { error } = await supabase
    .from('ordenes_compra')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}