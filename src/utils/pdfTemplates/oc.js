import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);
};

export const renderOCPDF = (ordenCompra, proveedor, protocolo, items) => {
  const doc = new jsPDF();

  const razonSocial = proveedor?.razon_social || ordenCompra.proveedor || 'Sin proveedor';
  const rut = proveedor?.rut || ordenCompra.rutProveedor || '';
  const direccion = proveedor?.direccion || ordenCompra.direccionProveedor || '';
  const contacto = proveedor?.contacto || ordenCompra.contactoProveedor || '';
  const codigoProtocolo = protocolo?.folio || ordenCompra.codigo_protocolo || '';
  const formaPago = ordenCompra.forma_pago || ordenCompra.formaPago || '';
  const responsable = ordenCompra.responsable_compra || ordenCompra.responsableCompra || '';
  const fecha = ordenCompra.fecha || '';

  // Encabezado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ORDEN DE COMPRA', 105, 18, { align: 'center' });
  doc.setFontSize(13);
  doc.text(`${ordenCompra.numero || ''}`, 105, 26, { align: 'center' });

  doc.setDrawColor(0, 0, 0);
  doc.line(20, 30, 190, 30);

  // Datos proveedor / OC
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  let y = 38;
  doc.text(`Razón Social: ${razonSocial}`, 20, y);
  y += 6;
  doc.text(`RUT: ${rut}`, 20, y);
  y += 6;
  doc.text(`Dirección: ${direccion}`, 20, y);
  y += 6;
  doc.text(`Contacto: ${contacto}`, 20, y);

  let yRight = 38;
  doc.text(`Código PT: ${codigoProtocolo}`, 120, yRight);
  yRight += 6;
  doc.text(`Forma de Pago: ${formaPago}`, 120, yRight);
  yRight += 6;
  doc.text(`Comprador: ${responsable}`, 120, yRight);
  yRight += 6;
  doc.text(`Fecha OC: ${fecha}`, 120, yRight);

  // Tabla items
  const tableData = (items || []).map((item, index) => {
    const cantidad = parseFloat(item.cantidad) || 0;
    const valorUnitario = parseFloat(item.valor_unitario || item.valorUnitario) || 0;
    const descuento = parseFloat(item.descuento) || 0;
    const totalItem = cantidad * valorUnitario * (1 - descuento / 100);
    return [
      index + 1,
      item.item || '',
      item.descripcion || '',
      cantidad,
      formatCurrency(valorUnitario),
      `${descuento}%`,
      formatCurrency(totalItem)
    ];
  });

  autoTable(doc, {
    startY: 70,
    head: [['#', 'Item', 'Descripción', 'Cant.', 'Valor Unit', 'Descuento', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [35, 82, 80] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 25 },
      2: { cellWidth: 55 },
      3: { cellWidth: 12, halign: 'right' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 25, halign: 'right' }
    }
  });

  const subtotal = (items || []).reduce((sum, item) => {
    const cantidad = parseFloat(item.cantidad) || 0;
    const valorUnitario = parseFloat(item.valor_unitario || item.valorUnitario) || 0;
    const descuento = parseFloat(item.descuento) || 0;
    return sum + (cantidad * valorUnitario * (1 - descuento / 100));
  }, 0);
  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  let totalsY = doc.lastAutoTable.finalY + 8;
  if (totalsY < 230) totalsY = 230;

  doc.setFont('helvetica', 'bold');
  doc.text(`Neto: ${formatCurrency(subtotal)}`, 150, totalsY);
  doc.text(`IVA: ${formatCurrency(iva)}`, 150, totalsY + 6);
  doc.text(`Total: ${formatCurrency(total)}`, 150, totalsY + 12);

  return doc;
};
