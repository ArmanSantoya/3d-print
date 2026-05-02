import { useState } from 'react';
import { MdPictureAsPdf, MdClose } from 'react-icons/md';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logoPath from '/logo.jpg';
import { calculateTrayDetails, roundTo50 } from '../utils/costCalculator';

export default function PdfGenerator({ trayData, config, projectName = '' }) {
  const [showOptions, setShowOptions] = useState(false);
  const [includesDesign, setIncludesDesign] = useState(false);
  const [includeRetention, setIncludeRetention] = useState(true);

  const buildQuotationHtmlFragment = (includeDesign, applyRetention) => {
    const marginPercent = Number(config.margin) || 0;
    const retentionRate = Number(config.retentionRate) || 0.1525;
    const designFeeValue = includeDesign ? Number(config.designFee ?? 5000) : 0;

    // Precio por bandeja = subtotal de costos con margen aplicado
    // El cliente no ve el desglose de costos ni el % de margen
    const rows = trayData.map((tray, i) => {
      const { subtotal } = calculateTrayDetails(tray, config);
      const precioConMargen = Math.round(subtotal * (1 + marginPercent / 100));
      return {
        name: tray.name || `Bandeja ${i + 1}`,
        weight: Number(tray.weight) || 0,
        material: tray.material || '',
        printer: tray.printer || '',
        price: precioConMargen,
      };
    });

    const subtotalImpresion = rows.reduce((s, r) => s + r.price, 0);
    const baseConDiseño = subtotalImpresion + designFeeValue;
    
    let totalToCharge, retentionAmount;
    
    if (applyRetention) {
      // Cálculo para Boleta de Honorarios: Bruto = Líquido / (1 - retentionRate)
      const brutoAmount = baseConDiseño / (1 - retentionRate);
      retentionAmount = Math.round(brutoAmount - baseConDiseño);
      totalToCharge = roundTo50(brutoAmount);
    } else {
      // Sin retención: mostrar el monto líquido
      totalToCharge = roundTo50(baseConDiseño);
      retentionAmount = 0;
    }

    const rowsHtml = rows
      .map(
        (r) => `
      <tr>
        <td style="border:1px solid #ccc;padding:8px;text-align:center;">${r.name}</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:right;">${r.weight} g</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:center;">${r.material}</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:center;">${r.printer}</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:right;">$ ${r.price.toLocaleString('es-CL')}</td>
      </tr>
    `
      )
      .join('');

    const designRow = includeDesign
      ? `<p style="margin:4px 0;"><strong>Recargo por diseño:</strong> $ ${designFeeValue.toLocaleString('es-CL')} CLP</p>`
      : '';

    const retentionRow = applyRetention
      ? `<p style="margin:4px 0;"><strong>Retención (15,25%):</strong> $ ${retentionAmount.toLocaleString('es-CL')} CLP</p>`
      : '';

    const totalLabel = applyRetention ? 'Monto Bruto (Boleta de Honorarios)' : 'Monto Total';

    return {
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;color:#111;padding:16px;width:800px;background:#fff;">
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="${logoPath}" alt="Arman3D" crossorigin="anonymous" style="height:72px;object-fit:contain;" />
            <div>
              <h1 style="margin:0 0 4px 0;font-size:20px;">Cotización</h1>
              ${projectName ? `<div style="font-size:14px;font-weight:bold;margin:4px 0;">Proyecto: ${projectName}</div>` : ''}
              <div style="font-size:12px;color:#666;">Generado: ${new Date().toLocaleString()}</div>
            </div>
          </div>

          <table style="width:100%;border-collapse:collapse;margin-top:12px;">
            <thead>
              <tr style="background:#f5f5f5">
                <th style="border:1px solid #ccc;padding:8px;">Bandeja</th>
                <th style="border:1px solid #ccc;padding:8px;">Peso</th>
                <th style="border:1px solid #ccc;padding:8px;">Material</th>
                <th style="border:1px solid #ccc;padding:8px;">Impresora</th>
                <th style="border:1px solid #ccc;padding:8px;">Precio (CLP)</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>

          <div style="margin-top:12px;font-size:1rem;">
            <p style="margin:4px 0;"><strong>Subtotal (Líquido):</strong> $ ${baseConDiseño.toLocaleString('es-CL')} CLP</p>
            ${designRow}
            ${retentionRow}
            <h2 style="margin-top:12px;">${totalLabel}: $ ${totalToCharge.toLocaleString('es-CL')} CLP</h2>
          </div>
        </div>
      `,
      totalToCharge,
    };
  };

  const generatePdf = async (includeDesign, applyRetention) => {
    const { html } = buildQuotationHtmlFragment(includeDesign, applyRetention);
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '0';
    wrapper.style.background = '#fff';
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    try {
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const filename = `${new Date().toISOString().slice(0, 10)}_cotizacion_${projectName}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error generando el PDF.');
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={() => setShowOptions((s) => !s)}
      >
        <MdPictureAsPdf size={20} />
        Generar PDF
      </button>

      <div className={`pdf-panel ${showOptions ? 'visible' : ''}`}>
        <div className="pdf-panel-option">
          <label className="pdf-panel-option">
            <input
              type="checkbox"
              className="checkbox-block"
              checked={includesDesign}
              onChange={(e) => setIncludesDesign(e.target.checked)}
            />
            <span>Incluye diseño (+ ${config.designFee ?? 5000} CLP)</span>
          </label>
        </div>
        <div className="pdf-panel-option">
          <label className="pdf-panel-option">
            <input
              type="checkbox"
              className="checkbox-block"
              checked={includeRetention}
              onChange={(e) => setIncludeRetention(e.target.checked)}
            />
            <span>Aplicar retención 15,25% (Boleta de Honorarios)</span>
          </label>
        </div>
        <div className="pdf-panel-actions">
          <button className="btn btn-secondary" onClick={() => setShowOptions(false)}>
            <MdClose size={20} />
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowOptions(false);
              generatePdf(includesDesign, includeRetention);
            }}
          >
            <MdPictureAsPdf size={20} />
            Descargar PDF
          </button>
        </div>
      </div>
    </>
  );
}
