import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);
};

export const renderProtocoloPDF = async (protocolo, items = [], ordenesCompra = [], loadImageAsDataUrl) => {
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

  if (loadImageAsDataUrl) {
    try {
      const logoDataUrl = await loadImageAsDataUrl('/logo-building-me.png');
      doc.addImage(logoDataUrl, 'PNG', 15, 12, 40, 16);
    } catch (error) {
      console.warn('No se pudo cargar el logo para el PDF:', error);
    }
  }

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`PROTOCOLO N° ${protocolo.folio || ''}`, 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let y = 35;

  doc.text(`Fecha: ${protocolo.fechaCreacion || protocolo.fecha || ''}`, 20, y);
  y += 7;
  doc.text(`Cliente: ${protocolo.cliente || ''}`, 20, y);
  y += 7;
  doc.text(`RUT: ${protocolo.rutCliente || ''}`, 20, y);
  y += 7;
  doc.text(`N° Cotización: ${protocolo.numeroCotizacion || ''}`, 20, y);
  y += 7;
  doc.text(`Unidad de Negocio: ${protocolo.unidadNegocio || ''}`, 20, y);
  y += 7;
  doc.text(`Tipo: ${protocolo.tipo || ''}`, 20, y);
  y += 7;
  doc.text(`OC Cliente: ${protocolo.ocCliente || 'Sin OC'}`, 20, y);
  y += 7;
  doc.text(`Estado: ${protocolo.estado || ''}`, 20, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text(`Monto Neto: ${formatCurrency(netoCalc)}`, 140, y);
  y += 7;
  doc.text(`IVA (19%): ${formatCurrency(ivaCalc)}`, 140, y);
  y += 7;
  doc.text(`Total: ${formatCurrency(totalCalc)}`, 140, y);
  y += 10;

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

  return doc;
};
