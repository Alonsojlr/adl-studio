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


// Función auxiliar para formatear moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(value);
};

// Función para generar PDF de Cotización directamente
export const generarCotizacionPDF = async (cotizacion, cliente, items) => {
  const doc = await renderCotizacionPDF(cotizacion, cliente, items);
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
