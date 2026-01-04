import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Función para generar OC desde template
export const generarOCDesdeTemplate = async (ordenCompra, proveedor, protocolo, items) => {
  try {
    // Cargar el template
    const response = await fetch('/templates/oc-template.docx');
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
export const generarOCPDF = (ordenCompra, proveedor, protocolo, items) => {
  const doc = new jsPDF();

  // Calcular totales con validaciones
  const subtotal = (items || []).reduce((sum, item) => {
    const cantidad = parseFloat(item.cantidad) || 0;
    const valorUnitario = parseFloat(item.valor_unitario || item.valorUnitario) || 0;
    const descuento = parseFloat(item.descuento) || 0;
    const total = cantidad * valorUnitario * (1 - descuento / 100);
    return sum + total;
  }, 0);
  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  // Título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`ORDEN DE COMPRA N° ${ordenCompra.numero}`, 105, 20, { align: 'center' });

  // Información general
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let y = 35;

  doc.text(`Fecha: ${ordenCompra.fecha}`, 20, y);
  y += 7;
  doc.text(`Proveedor: ${proveedor?.razon_social || 'Sin proveedor'}`, 20, y);
  y += 7;
  doc.text(`RUT: ${proveedor?.rut || ''}`, 20, y);
  y += 7;
  doc.text(`Dirección: ${proveedor?.direccion || ''}`, 20, y);
  y += 7;
  doc.text(`Contacto: ${proveedor?.contacto || ''}`, 20, y);
  y += 7;
  doc.text(`Código Protocolo: ${protocolo?.folio || ordenCompra.codigo_protocolo || ''}`, 20, y);
  y += 7;
  doc.text(`Forma de Pago: ${ordenCompra.forma_pago}`, 20, y);
  y += 10;

  // Tabla de items
  const tableData = (items || []).map(item => {
    const cantidad = parseFloat(item.cantidad) || 0;
    const valorUnitario = parseFloat(item.valor_unitario || item.valorUnitario) || 0;
    const descuento = parseFloat(item.descuento) || 0;
    return [
      item.descripcion || '',
      cantidad,
      formatCurrency(valorUnitario),
      `${descuento}%`,
      formatCurrency(cantidad * valorUnitario * (1 - descuento / 100))
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Descripción', 'Cantidad', 'Valor Unitario', 'Descuento', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [35, 82, 80] },
    styles: { fontSize: 9 }
  });

  y = doc.lastAutoTable.finalY + 10;

  // Totales
  doc.setFont('helvetica', 'bold');
  doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 140, y);
  y += 7;
  doc.text(`IVA (19%): ${formatCurrency(iva)}`, 140, y);
  y += 7;
  doc.setFontSize(12);
  doc.text(`TOTAL: ${formatCurrency(total)}`, 140, y);

  // Guardar PDF
  doc.save(`OC-${ordenCompra.numero}.pdf`);
};