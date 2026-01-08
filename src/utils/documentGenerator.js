import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import { renderOCPDF } from './pdfTemplates/oc';
import { renderCotizacionPDF } from './pdfTemplates/cotizacion';
import { renderProtocoloPDF } from './pdfTemplates/protocolo';

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
  const doc = renderCotizacionPDF(cotizacion, cliente, items);
  doc.save(`Cotizacion-${cotizacion.numero || 'sin-numero'}.pdf`);
};

// Función para generar PDF de Orden de Compra directamente
export const generarOCPDF = async (ordenCompra, proveedor, protocolo, items) => {
  const doc = await renderOCPDF(ordenCompra, proveedor, protocolo, items);
  if (!doc || typeof doc.save !== 'function') {
    throw new Error('No se pudo generar el PDF de la OC');
  }
  doc.save(`OC-${ordenCompra.numero || 'sin-numero'}.pdf`);
};

export const generarProtocoloPDF = async (protocolo, items = [], ordenesCompra = []) => {
  const doc = await renderProtocoloPDF(protocolo, items, ordenesCompra, loadImageAsDataUrl);
  doc.save(`Protocolo-${protocolo.folio || 'sin-folio'}.pdf`);
};
