import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);
};

export const renderCotizacionPDF = (cotizacion, cliente, items) => {
  const doc = new jsPDF();

  const subtotalCalc = (items || []).reduce((sum, item) => {
    const cantidad = item.cantidad || 0;
    const valorUnit = item.valorUnitario || item.valor_unitario || 0;
    const descuento = item.descuento || 0;
    return sum + (cantidad * valorUnit * (1 - descuento / 100));
  }, 0);
  const ivaCalc = subtotalCalc * 0.19;
  const totalCalc = subtotalCalc + ivaCalc;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`COTIZACIÓN N° ${cotizacion.numero || ''}`, 105, 20, { align: 'center' });

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

  doc.setFont('helvetica', 'bold');
  doc.text(`Subtotal: ${formatCurrency(subtotalCalc || cotizacion.monto || 0)}`, 140, y);
  y += 7;
  doc.text(`IVA (19%): ${formatCurrency(ivaCalc || (cotizacion.monto || 0) * 0.19)}`, 140, y);
  y += 7;
  doc.setFontSize(12);
  doc.text(`TOTAL: ${formatCurrency(totalCalc || cotizacion.monto || 0)}`, 140, y);

  return doc;
};
