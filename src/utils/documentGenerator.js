import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const loadImageAsDataUrl = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Función para generar OC desde template
export const generarOCDesdeTemplate = async (ordenCompra, proveedor, protocolo, items) => {
  try {
    // Cargar el template
    const response = await fetch(`/templates/oc-template.docx?ts=${Date.now()}`);
    const arrayBuffer = await response.arrayBuffer();
    const zip = new PizZip(arrayBuffer);
    
    // Crear documento
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Calcular totales
    const subtotal = items.reduce((sum, item) => {
      const total = item.cantidad * item.valor_unitario * (1 - item.descuento / 100);
      return sum + total;
    }, 0);
    const iva = subtotal * 0.19;
    const total = subtotal + iva;

    // Preparar datos para el template
    const data = {
      numero: ordenCompra.numero,
      fecha: ordenCompra.fecha,
      proveedor: proveedor?.razon_social || 'Sin proveedor',
      rut: proveedor?.rut || '',
      direccion: proveedor?.direccion || '',
      contacto: proveedor?.contacto || '',
      codigo_protocolo: protocolo?.folio || ordenCompra.codigo_protocolo || '',
      forma_pago: ordenCompra.forma_pago,
      responsable_compra: ordenCompra.responsable_compra || '',
      items: items.map(item => ({
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        valor_unitario: formatCurrency(item.valor_unitario),
        descuento: `${item.descuento}%`,
        total_item: formatCurrency(item.cantidad * item.valor_unitario * (1 - item.descuento / 100))
      })),
      subtotal: formatCurrency(subtotal),
      iva: formatCurrency(iva),
      total: formatCurrency(total)
    };

    // Rellenar el template
    doc.setData(data);
    doc.render();

    // Generar el archivo
    const blob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    // Descargar
    saveAs(blob, `OC-${ordenCompra.numero}.docx`);
  } catch (error) {
    console.error('Error generando OC:', error);
    throw error;
  }
};

// Función para generar Cotización desde template
export const generarCotizacionDesdeTemplate = async (cotizacion, cliente, items) => {
  try {
    const response = await fetch('/templates/cotiz-template.docx');
    const arrayBuffer = await response.arrayBuffer();
    const zip = new PizZip(arrayBuffer);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '', // Retorna string vacío para campos nulos
    });

    // Calcular subtotal e IVA si hay items
    const subtotalCalc = (items || []).reduce((sum, item) => {
      const cantidad = item.cantidad || 0;
      const valorUnit = item.valorUnitario || item.valor_unitario || 0;
      const descuento = item.descuento || 0;
      return sum + (cantidad * valorUnit * (1 - descuento / 100));
    }, 0);
    const ivaCalc = subtotalCalc * 0.19;
    const totalCalc = subtotalCalc + ivaCalc;

    const data = {
      numero: cotizacion.numero || '',
      fecha: cotizacion.fecha || '',
      cliente: cotizacion.cliente || cliente?.razon_social || 'Sin cliente',
      rut: cotizacion.rut || cliente?.rut || '',
      proyecto: cotizacion.nombreProyecto || cotizacion.nombre_proyecto || '',
      unidad_negocio: cotizacion.unidadNegocio || cotizacion.unidad_negocio || '',
      condiciones_pago: cotizacion.condicionesPago || cotizacion.condiciones_pago || '',
      forma_pago: cotizacion.condicionesPago || cotizacion.condiciones_pago || '',
      cotizado_por: cotizacion.cotizadoPor || cotizacion.cotizado_por || '',
      proveedor: cotizacion.cliente || cliente?.razon_social || '',
      contacto: cliente?.contacto || '',
      direccion: cliente?.direccion || '',
      items: (items || []).map(item => ({
        descripcion: item.descripcion || '',
        cantidad: item.cantidad || 0,
        valor_unitario: formatCurrency(item.valorUnitario || item.valor_unitario || 0),
        descuento: `${item.descuento || 0}%`,
        total_item: formatCurrency((item.cantidad || 0) * (item.valorUnitario || item.valor_unitario || 0) * (1 - (item.descuento || 0) / 100))
      })),
      subtotal: formatCurrency(subtotalCalc || cotizacion.monto || 0),
      iva: formatCurrency(ivaCalc || (cotizacion.monto || 0) * 0.19),
      total: formatCurrency(totalCalc || cotizacion.monto || 0)
    };

    doc.setData(data);
    doc.render();

    const blob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    saveAs(blob, `Cotizacion-${cotizacion.numero}.docx`);
  } catch (error) {
    console.error('Error generando cotización:', error);
    if (error.properties && error.properties.errors) {
      console.error('Errores del template:', error.properties.errors);
      // Mostrar detalles de cada error
      error.properties.errors.forEach((err, index) => {
        console.error(`Error ${index + 1}:`, {
          message: err.message,
          name: err.name,
          properties: err.properties
        });
      });
    }
    throw error;
  }
};

// Función auxiliar para formatear moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(value);
};

// Función para generar PDF de Cotización directamente
export const generarCotizacionPDF = (cotizacion, cliente, items) => {
  const doc = new jsPDF();

  // Calcular totales
  const subtotalCalc = (items || []).reduce((sum, item) => {
    const cantidad = item.cantidad || 0;
    const valorUnit = item.valorUnitario || item.valor_unitario || 0;
    const descuento = item.descuento || 0;
    return sum + (cantidad * valorUnit * (1 - descuento / 100));
  }, 0);
  const ivaCalc = subtotalCalc * 0.19;
  const totalCalc = subtotalCalc + ivaCalc;

  // Título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`COTIZACIÓN N° ${cotizacion.numero || ''}`, 105, 20, { align: 'center' });

  // Información general
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let y = 35;

  doc.text(`Fecha: ${cotizacion.fecha || ''}`, 20, y);
  y += 7;
  doc.text(`Cliente: ${cotizacion.cliente || cliente?.razon_social || 'Sin cliente'}`, 20, y);
  y += 7;
  doc.text(`RUT: ${cotizacion.rut || cliente?.rut || ''}`, 20, y);
  y += 7;
  doc.text(`Proyecto: ${cotizacion.nombreProyecto || cotizacion.nombre_proyecto || ''}`, 20, y);
  y += 7;
  doc.text(`Unidad de Negocio: ${cotizacion.unidadNegocio || cotizacion.unidad_negocio || ''}`, 20, y);
  y += 7;
  doc.text(`Condiciones de Pago: ${cotizacion.condicionesPago || cotizacion.condiciones_pago || ''}`, 20, y);
  y += 7;
  doc.text(`Cotizado por: ${cotizacion.cotizadoPor || cotizacion.cotizado_por || ''}`, 20, y);
  y += 10;

  // Tabla de items
  if (items && items.length > 0) {
    const tableData = items.map(item => [
      item.descripcion || '',
      item.cantidad || 0,
      formatCurrency(item.valorUnitario || item.valor_unitario || 0),
      `${item.descuento || 0}%`,
      formatCurrency((item.cantidad || 0) * (item.valorUnitario || item.valor_unitario || 0) * (1 - (item.descuento || 0) / 100))
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Descripción', 'Cantidad', 'Valor Unitario', 'Descuento', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [35, 82, 80] },
      styles: { fontSize: 9 }
    });

    y = doc.lastAutoTable.finalY + 10;
  }

  // Totales
  doc.setFont('helvetica', 'bold');
  doc.text(`Subtotal: ${formatCurrency(subtotalCalc || cotizacion.monto || 0)}`, 140, y);
  y += 7;
  doc.text(`IVA (19%): ${formatCurrency(ivaCalc || (cotizacion.monto || 0) * 0.19)}`, 140, y);
  y += 7;
  doc.setFontSize(12);
  doc.text(`TOTAL: ${formatCurrency(totalCalc || cotizacion.monto || 0)}`, 140, y);

  // Guardar PDF
  doc.save(`Cotizacion-${cotizacion.numero || 'sin-numero'}.pdf`);
};

// Función para generar PDF de Orden de Compra directamente
export const generarOCPDF = async (ordenCompra, proveedor, protocolo, items) => {
  const response = await fetch('/api/oc-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ordenCompra, proveedor, protocolo, items })
  });

  if (!response.ok) {
    let details = '';
    try {
      const errorData = await response.json();
      details = errorData?.message || errorData?.error || '';
    } catch (error) {
      details = '';
    }
    throw new Error(details || 'No se pudo generar el PDF de la OC');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `OC-${ordenCompra.numero || 'sin-numero'}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const generarProtocoloPDF = async (protocolo, items = [], ordenesCompra = []) => {
  const doc = new jsPDF();

  const subtotalItems = (items || []).reduce((sum, item) => {
    const cantidad = parseFloat(item.cantidad) || 0;
    const valorUnitario = parseFloat(item.valorUnitario || item.valor_unitario) || 0;
    const descuento = parseFloat(item.descuento) || 0;
    return sum + (cantidad * valorUnitario * (1 - descuento / 100));
  }, 0);
  const totalCalc = protocolo.montoTotal || (subtotalItems * 1.19);
  const netoCalc = totalCalc ? totalCalc / 1.19 : subtotalItems;
  const ivaCalc = totalCalc ? totalCalc - netoCalc : netoCalc * 0.19;

  try {
    const logoDataUrl = await loadImageAsDataUrl('/logo-building-me.png');
    doc.addImage(logoDataUrl, 'PNG', 15, 12, 40, 16);
  } catch (error) {
    console.warn('No se pudo cargar el logo para el PDF:', error);
  }

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`PROTOCOLO N° ${protocolo.folio || ''}`, 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let y = 35;

  doc.text(`Fecha: ${protocolo.fechaCreacion || protocolo.fecha || ''}`, 20, y);
  y += 6;
  doc.text(`Cliente: ${protocolo.cliente || ''}`, 20, y);
  y += 6;
  doc.text(`RUT: ${protocolo.rutCliente || ''}`, 20, y);
  y += 6;
  doc.text(`N° Cotización: ${protocolo.numeroCotizacion || ''}`, 20, y);
  y += 6;
  doc.text(`Unidad de Negocio: ${protocolo.unidadNegocio || ''}`, 20, y);
  y += 6;
  doc.text(`Tipo: ${protocolo.tipo || ''}`, 20, y);
  y += 6;
  doc.text(`OC Cliente: ${protocolo.ocCliente || 'Sin OC'}`, 20, y);
  y += 6;
  doc.text(`Estado: ${protocolo.estado || ''}`, 20, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.text(`Monto Neto: ${formatCurrency(netoCalc)}`, 140, y);
  y += 6;
  doc.text(`IVA (19%): ${formatCurrency(ivaCalc)}`, 140, y);
  y += 6;
  doc.text(`Total: ${formatCurrency(totalCalc)}`, 140, y);
  y += 8;

  if (items && items.length > 0) {
    const tableData = items.map(item => {
      const cantidad = parseFloat(item.cantidad) || 0;
      const valorUnitario = parseFloat(item.valorUnitario || item.valor_unitario) || 0;
      const descuento = parseFloat(item.descuento) || 0;
      return [
        item.item || '',
        item.descripcion || '',
        cantidad,
        formatCurrency(valorUnitario),
        `${descuento}%`,
        formatCurrency(cantidad * valorUnitario * (1 - descuento / 100))
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [['Item', 'Descripción', 'Cantidad', 'Valor Unitario', 'Descuento', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [35, 82, 80] },
      styles: { fontSize: 9 }
    });

    y = doc.lastAutoTable.finalY + 8;
  }

  if (ordenesCompra && ordenesCompra.length > 0) {
    const tableData = ordenesCompra.map(oc => {
      const neto = oc.subtotal ?? (oc.total ? oc.total / 1.19 : 0);
      const total = oc.total ?? 0;
      const iva = oc.iva ?? (total ? total - neto : neto * 0.19);
      return [
        oc.numero || '',
        oc.proveedor || '',
        oc.tipoCosto || '',
        formatCurrency(neto),
        formatCurrency(iva),
        formatCurrency(total || neto + iva)
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [['N° OC', 'Proveedor', 'Tipo Costo', 'Neto', 'IVA', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [35, 82, 80] },
      styles: { fontSize: 9 }
    });
  }

  doc.save(`Protocolo-${protocolo.folio || 'sin-folio'}.pdf`);
};
