// Utilidad para generar PDFs de cotizaciones
// Usar esta función desde el componente de cotizaciones

export const generarPDFCotizacion = async (cotizacion) => {
  // Importar jsPDF dinámicamente
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colores Building Me
  const colorVerde = [30, 58, 138]; // #1E3A8A
  const colorVerdeOscuro = [11, 31, 59]; // #0B1F3B
  const colorRojo = [220, 53, 69]; // Para el borde de COTIZACIÓN
  
  // Logo (necesitaremos convertirlo a base64)
  const logoBase64 = await getLogoBase64();
  
  // Agregar logo (esquina superior izquierda)
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 15, 10, 50, 15);
  }
  
  // Información de Building Me (debajo del logo)
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('ADL Studio', 15, 30);
  doc.text('Grafica Lopez y Ramirez spa', 15, 34);
  doc.text('77.111.974-3', 15, 38);
  doc.text('Av Pdte Eduardo Frei Montalva 1475, Independencia', 15, 42);
  doc.text('Santiago - Chile', 15, 46);
  
  // Recuadro COTIZACIÓN (esquina superior derecha)
  doc.setDrawColor(...colorRojo);
  doc.setLineWidth(1);
  doc.rect(pageWidth - 70, 10, 55, 25);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colorRojo);
  doc.text('COTIZACIÓN', pageWidth - 67, 20);
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`N° ${cotizacion.numero}`, pageWidth - 67, 28);
  
  // Sección CLIENTE
  let yPos = 60;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE', 15, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  yPos += 6;
  doc.text(`Razón Social: ${cotizacion.razonSocial || ''}`, 15, yPos);
  doc.text(`Fecha: ${cotizacion.fecha || ''}`, pageWidth - 80, yPos);
  
  yPos += 5;
  doc.text(`Rut: ${cotizacion.rut || ''}`, 15, yPos);
  doc.text(`Condiciones: ${cotizacion.condicionesPago || ''}`, pageWidth - 80, yPos);
  
  yPos += 5;
  doc.text(`Dirección: ${cotizacion.direccion || ''}`, 15, yPos);
  doc.text(`Cotizado por: ${cotizacion.cotizadoPor || ''}`, pageWidth - 80, yPos);
  
  yPos += 5;
  doc.text(`Contacto: ${cotizacion.contacto || ''}`, 15, yPos);
  
  yPos += 5;
  doc.text(`N°Contacto: ${cotizacion.telefono || ''}`, 15, yPos);
  
  // Tabla de Items
  yPos += 10;
  
  // Encabezado de tabla con color verde
  doc.setFillColor(...colorVerde);
  doc.rect(15, yPos, pageWidth - 30, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  
  doc.text('N°', 18, yPos + 5);
  doc.text('Cant', 28, yPos + 5);
  doc.text('Descripción', 45, yPos + 5);
  doc.text('V. Unitario', 120, yPos + 5);
  doc.text('% Dscto', 150, yPos + 5);
  doc.text('Sub total', 175, yPos + 5);
  
  yPos += 10;
  
  // Items
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  let subtotalGeneral = 0;
  
  (cotizacion.items || []).forEach((item, index) => {
    const subtotalItem = item.cantidad * item.valorUnitario;
    const descuento = subtotalItem * (item.descuento / 100);
    const subtotal = subtotalItem - descuento;
    subtotalGeneral += subtotal;
    
    doc.text(String(index + 1), 18, yPos);
    doc.text(String(item.cantidad), 28, yPos);
    
    // Descripción (puede ser larga, limitar a 60 caracteres)
    const desc = `${item.item || ''} - ${item.descripcion || ''}`.substring(0, 60);
    doc.text(desc, 45, yPos);
    
    doc.text(formatCurrency(item.valorUnitario), 120, yPos);
    doc.text(`${item.descuento}%`, 150, yPos);
    doc.text(formatCurrency(subtotal), 175, yPos);
    
    yPos += 6;
    
    // Si llegamos al final de la página, agregar nueva página
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }
  });
  
  // Observaciones
  if (cotizacion.observaciones) {
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones:', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    
    // Split observaciones en líneas si es muy largo
    const lines = doc.splitTextToSize(cotizacion.observaciones, pageWidth - 30);
    lines.forEach(line => {
      doc.text(line, 15, yPos);
      yPos += 5;
    });
  }
  
  // Totales (esquina inferior derecha)
  yPos = Math.max(yPos + 10, pageHeight - 50);
  
  const iva = subtotalGeneral * 0.19;
  const total = subtotalGeneral + iva;
  
  const xTotales = pageWidth - 80;
  
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal', xTotales, yPos);
  doc.text(formatCurrency(subtotalGeneral), xTotales + 40, yPos, { align: 'right' });
  
  yPos += 6;
  doc.text('IVA 19%', xTotales, yPos);
  doc.text(formatCurrency(iva), xTotales + 40, yPos, { align: 'right' });
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Total', xTotales, yPos);
  doc.text(formatCurrency(total), xTotales + 40, yPos, { align: 'right' });
  
  // Información importante (pie de página)
  yPos = pageHeight - 30;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Información importante', 15, yPos);
  
  yPos += 4;
  doc.setFont('helvetica', 'normal');
  doc.text('1)    Valores Unitarios en pesos más IVA ( Venta Nacional), en Dólares ( Venta Internacional)', 15, yPos);
  
  yPos += 4;
  doc.text('2)    Las entregas estipuladas rigen a contar de la fecha de recepción de la O.C de parte vuestra y corresponden a días hábiles', 15, yPos);
  
  yPos += 4;
  doc.text('3)    si esta cotización genera una orden de compra, agradecemos mencionarla en su documentación de compra.', 15, yPos);
  
  // Guardar PDF
  doc.save(`Cotizacion_${cotizacion.numero}_${cotizacion.cliente.replace(/\s+/g, '_')}.pdf`);
};

// Función helper para formatear moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(value);
};

// Función para convertir el logo a base64
const getLogoBase64 = () => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = function() {
      resolve(null);
    };
    // Usar la ruta relativa del logo
    img.src = '/logo-adl-studio.png';
  });
};
