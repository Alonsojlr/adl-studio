import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);
};

const safe = (v) => (v === null || v === undefined ? '' : String(v));
const clean = (v) => safe(v).replace(/[{}]/g, '').trim();

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

export const renderCotizacionPDF = async (cotizacion, cliente, items) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const M = 18;

  const BLUE = [30, 58, 138];
  const GRAY_TEXT = [155, 155, 155];
  const DARK = [90, 90, 90];

  const subtotalCalc = (items || []).reduce((sum, item) => {
    const cantidad = item.cantidad || 0;
    const valorUnit = item.valorUnitario || item.valor_unitario || 0;
    const descuento = item.descuento || 0;
    return sum + (cantidad * valorUnit * (1 - descuento / 100));
  }, 0);
  const ivaCalc = subtotalCalc * 0.19;
  const totalCalc = subtotalCalc + ivaCalc;

  const clienteNombre = clean(cotizacion.cliente || cliente?.razon_social || 'Sin cliente');
  const rut = clean(cotizacion.rut || cliente?.rut || '');
  const direccion = clean(cotizacion.direccionCliente || cliente?.direccion || '');
  const contacto = clean(
    cotizacion.contactoCliente ||
      cotizacion.contacto ||
      cotizacion.contactoProveedor ||
      cliente?.contacto ||
      cliente?.contacto_principal ||
      ''
  );
  const condicionesPago = clean(cotizacion.condicionesPago || cotizacion.condiciones_pago || '');
  const cotizadoPor = clean(cotizacion.cotizadoPor || cotizacion.cotizado_por || '');
  const fecha = clean(cotizacion.fecha || '');

  try {
    const logoDataUrl = await loadImageAsDataUrl('/logoazul.png');
    doc.addImage(logoDataUrl, 'PNG', M, 10, 32, 20);
  } catch {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(...BLUE);
    doc.text('ADL Studio', M, 24);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY_TEXT);
  const leftInfoY = 35;
  doc.text('77.111.974-3', M, leftInfoY);
  doc.text('Grafica Lopez y Ramirez spa', M, leftInfoY + 4);
  doc.text('Av Pdte Eduardo Frei Montalva 1475, Independencia', M, leftInfoY + 8);
  doc.text('Santiago, Chile', M, leftInfoY + 12);
  doc.text('info@adlstudio.cl', M, leftInfoY + 16);

  const boxW = 86;
  const boxH = 28;
  const boxX = W - M - boxW;
  const boxY = 12;
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(1.4);
  doc.rect(boxX, boxY, boxW, boxH);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLUE);
  doc.setFontSize(18);
  doc.text('COTIZACIÓN', boxX + boxW / 2, boxY + 12, { align: 'center' });
  doc.setFontSize(18);
  doc.text(`N° ${clean(cotizacion.numero || '')}`, boxX + boxW / 2, boxY + 22, {
    align: 'center'
  });
  doc.setTextColor(0, 0, 0);

  const colL = M;
  const colR = W / 2 + 10;
  let y = 75;

  const drawKV = (x, yPos, label, value) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...DARK);
    doc.text(label, x, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(130, 130, 130);
    doc.text(value || '', x + 28, yPos);
  };

  drawKV(colL, y, 'Cliente:', clienteNombre); y += 6;
  drawKV(colL, y, 'Rut:', rut); y += 6;
  drawKV(colL, y, 'Dirección:', direccion); y += 6;
  drawKV(colL, y, 'Contacto:', contacto);

  let yR = 75;
  drawKV(colR, yR, 'Condición Pago:', condicionesPago); yR += 6;
  drawKV(colR, yR, 'Responsable:', cotizadoPor); yR += 6;
  drawKV(colR, yR, 'Fecha:', fecha);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.setTextColor(...BLUE);
  doc.text('POR MEDIO DEL PRESENTE, NOS ES MUY GRATO COTIZAR A UDS., LO SIGUIENTE:', M, 108);
  doc.setTextColor(0, 0, 0);

  if (items && items.length > 0) {
    const tableData = items.map((item) => {
      const cantidad = item.cantidad || 0;
      const valorUnitario = item.valorUnitario || item.valor_unitario || 0;
      const descuento = item.descuento || 0;
      const totalItem = cantidad * valorUnitario * (1 - descuento / 100);
      return [
        cantidad,
        item.descripcion || '',
        formatCurrency(valorUnitario),
        `${descuento}%`,
        formatCurrency(totalItem)
      ];
    });

    const tableWidth = W - 2 * M;
    const tableX = M;

    const tableStartY = 112;
    autoTable(doc, {
      startY: tableStartY,
      head: [['Cant.', 'Descripción', 'Valor Unit', 'Descto', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: BLUE, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 2.2 },
      columnStyles: {
        0: { cellWidth: 16 },
        1: { cellWidth: 88 },
        2: { cellWidth: 26, halign: 'right' },
        3: { cellWidth: 20, halign: 'right' },
        4: { cellWidth: 24, halign: 'right' }
      },
      margin: { left: tableX, right: tableX },
      tableWidth
    });

    y = doc.lastAutoTable.finalY + 10;
  }

  const tableWidth = W - 2 * M;
  const tableX = M;
  const totalsX = tableX + (tableWidth - 70);
  const totalsY = y - 4;

  autoTable(doc, {
    startY: totalsY,
    margin: { left: totalsX },
    tableWidth: 70,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    body: [
      ['Neto', formatCurrency(subtotalCalc || cotizacion.monto || 0)],
      ['IVA', formatCurrency(ivaCalc || (cotizacion.monto || 0) * 0.19)],
      ['Total', formatCurrency(totalCalc || cotizacion.monto || 0)]
    ],
    columnStyles: {
      0: { cellWidth: 25, fontStyle: 'bold', textColor: BLUE },
      1: { cellWidth: 45, halign: 'right' }
    }
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BLUE);
  doc.text('Terminos y Condiciones', M, 258);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(...GRAY_TEXT);
  const terms = [
    '1) Valores unitarios en pesos más iva (venta para Chile), en dólares (venta para el extranjero)',
    '2) Si esta cotización genera una orden de compra, agradecemos mencionar en su documentación de compra.'
  ];
  doc.text(doc.splitTextToSize(terms.join('\n'), W - 2 * M), M, 266);

  return doc;
};
