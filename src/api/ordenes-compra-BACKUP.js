import { supabase } from '../lib/supabaseClient'

// Obtener todas las órdenes de compra
export const getOrdenesCompra = async () => {
  const { data, error } = await supabase
    .from('ordenes_compra')
    .select(`
      *,
      proveedores (
        razon_social,
        rut,
        direccion,
        contacto
      ),
      ordenes_compra_items (
        id,
        item,
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
      orden_id: ordenData[0].id,
      item: item.item || '',
      cantidad: item.cantidad,
      descripcion: item.descripcion,
      valor_unitario: item.valorUnitario || item.valor_unitario,
      descuento: item.descuento || 0
    }))
    
    const { error: itemsError } = await supabase
      .from('ordenes_compra_items')
      .insert(itemsConOrdenId)
    
    if (itemsError) throw itemsError
  }
  
  return ordenData[0]
}

// Reemplazar items de una orden de compra
export const replaceOrdenCompraItems = async (ordenId, items) => {
  const normalizeText = (value) => String(value || '').trim().replace(/\s+/g, ' ');
  const normalizeNumber = (value) => {
    const num = Number(value ?? 0);
    return Number.isFinite(num) ? num : 0;
  };
  const buildKey = (item) => {
    const nombre = normalizeText(item.item);
    const descripcion = normalizeText(item.descripcion);
    const cantidad = normalizeNumber(item.cantidad);
    const valorUnitario = normalizeNumber(item.valorUnitario ?? item.valor_unitario);
    return `${nombre.toLowerCase()}|${descripcion.toLowerCase()}|${cantidad}|${valorUnitario.toFixed(2)}`;
  };

  const itemsLimpios = (() => {
    const mapa = new Map();
    (items || []).forEach((item) => {
      const nombre = normalizeText(item.item);
      const descripcion = normalizeText(item.descripcion);
      const valorUnitario = normalizeNumber(item.valorUnitario ?? item.valor_unitario);
      const cantidad = normalizeNumber(item.cantidad);
      const hasContenido = nombre.length > 0 || descripcion.length > 0 || valorUnitario > 0 || cantidad > 0;
      if (!hasContenido) return;
      const key = `${nombre.toLowerCase()}|${descripcion.toLowerCase()}|${cantidad}|${valorUnitario.toFixed(2)}`;
      mapa.set(key, { ...item, item: nombre, descripcion, cantidad, valorUnitario });
    });
    return Array.from(mapa.values());
  })();

  const { data: existentes, error: existentesError } = await supabase
    .from('ordenes_compra_items')
    .select('id, item, descripcion, cantidad, valor_unitario')
    .eq('orden_id', ordenId)

  if (existentesError) throw existentesError

  const nuevosKeys = new Set(itemsLimpios.map(buildKey))
  const existentesNormalizados = (existentes || []).map((item) => ({
    id: item.id,
    key: buildKey({
      item: item.item,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      valor_unitario: item.valor_unitario
    })
  }))
  const existentesKeys = new Set(existentesNormalizados.map(item => item.key))
  const idsAEliminar = existentesNormalizados
    .filter((item) => !nuevosKeys.has(item.key))
    .map((item) => item.id)

  if (idsAEliminar.length > 0) {
    const { error: deleteError } = await supabase
      .from('ordenes_compra_items')
      .delete()
      .in('id', idsAEliminar)

    if (deleteError) throw deleteError
  }

  if (itemsLimpios.length > 0) {
    const itemsConOrdenId = itemsLimpios
      .filter(item => !existentesKeys.has(buildKey(item)))
      .map(item => ({
      orden_id: ordenId,
      item: item.item || '',
      cantidad: Number(item.cantidad ?? 0),
      descripcion: item.descripcion,
      valor_unitario: Number(item.valorUnitario ?? item.valor_unitario ?? 0),
      descuento: item.descuento || 0
    }))

    if (itemsConOrdenId.length > 0) {
      const { error: insertError } = await supabase
        .from('ordenes_compra_items')
        .insert(itemsConOrdenId)

      if (insertError) throw insertError
    }
  }
};

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
  const { error: itemsError } = await supabase
    .from('ordenes_compra_items')
    .delete()
    .eq('orden_id', id)

  if (itemsError) throw itemsError

  const { data, error } = await supabase
    .from('ordenes_compra')
    .delete()
    .eq('id', id)
    .select()

  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('No se pudo eliminar la OC')
  }
}
