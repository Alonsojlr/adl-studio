const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const fs = require('fs/promises');
const path = require('path');

const escapeHtml = (value) => {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const formatCurrency = (value) => {
  const amount = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(amount);
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  try {
    const { ordenCompra = {}, proveedor = {}, protocolo = {}, items = [] } = req.body || {};

    const subtotal = (items || []).reduce((sum, item) => {
      const cantidad = parseFloat(item.cantidad) || 0;
      const valorUnitario = parseFloat(item.valor_unitario || item.valorUnitario) || 0;
      const descuento = parseFloat(item.descuento) || 0;
      return sum + (cantidad * valorUnitario * (1 - descuento / 100));
    }, 0);
    const iva = subtotal * 0.19;
    const total = subtotal + iva;

    const templatePath = path.join(process.cwd(), 'templates', 'oc-template.html');
    const fondoPath = path.join(process.cwd(), 'public', 'oc-fondo.png');

    const [templateHtml, fondoBuffer] = await Promise.all([
      fs.readFile(templatePath, 'utf8'),
      fs.readFile(fondoPath)
    ]);

    const backgroundImage = `data:image/png;base64,${fondoBuffer.toString('base64')}`;

    const itemsRows = (items || []).map(item => {
      const cantidad = parseFloat(item.cantidad) || 0;
      const valorUnitario = parseFloat(item.valor_unitario || item.valorUnitario) || 0;
      const descuento = parseFloat(item.descuento) || 0;
      const totalItem = cantidad * valorUnitario * (1 - descuento / 100);

      return `
        <tr>
          <td class="col-cant">${escapeHtml(cantidad)}</td>
          <td class="col-desc">${escapeHtml(item.descripcion || item.item || '')}</td>
          <td class="col-unit">${escapeHtml(formatCurrency(valorUnitario))}</td>
          <td class="col-descuento">${escapeHtml(`${descuento}%`)}</td>
          <td class="col-subtotal">${escapeHtml(formatCurrency(totalItem))}</td>
        </tr>
      `;
    }).join('');

    const data = {
      background_image: backgroundImage,
      numero: ordenCompra.numero || '',
      fecha: ordenCompra.fecha || '',
      proveedor: proveedor.razon_social || ordenCompra.proveedor || 'Sin proveedor',
      rut: proveedor.rut || ordenCompra.rutProveedor || '',
      direccion: proveedor.direccion || ordenCompra.direccionProveedor || '',
      contacto: proveedor.contacto || ordenCompra.contactoProveedor || '',
      codigo_protocolo: protocolo.folio || ordenCompra.codigo_protocolo || '',
      forma_pago: ordenCompra.forma_pago || ordenCompra.formaPago || '',
      responsable_compra: ordenCompra.responsable_compra || ordenCompra.responsableCompra || '',
      subtotal: formatCurrency(subtotal),
      iva: formatCurrency(iva),
      total: formatCurrency(total),
      facturar_a: proveedor.razon_social || ordenCompra.proveedor || '',
      facturar_rut: proveedor.rut || ordenCompra.rutProveedor || ''
    };

    let html = templateHtml.replace('{{items_rows}}', itemsRows);
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      html = html.replace(regex, escapeHtml(value));
    });

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="OC-${ordenCompra.numero || 'sin-numero'}.pdf"`
    );
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error generando PDF OC:', error);
    res.status(500).json({ error: 'Error generando PDF OC' });
  }
};
