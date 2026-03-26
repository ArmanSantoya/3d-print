import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logoPath from '/logo.jpg';
import { calculateTrayDetails } from '../utils/costCalculator';

export default function PdfGenerator({ trayData, config, projectName = '' }) {
  const [showOptions, setShowOptions] = useState(false);
  const [includesDesign, setIncludesDesign] = useState(false);

  const roundTo50 = (value) => Math.round((Number(value) || 0) / 50) * 50;

  const buildQuotationHtmlFragment = (includeDesign) => {
    const rows = trayData.map((tray, i) => {
      const { subtotal } = calculateTrayDetails(tray, config);
      const rounded = roundTo50(subtotal);
      return {
        index: i + 1,
        weight: Number(tray.weight) || 0,
        material: tray.material || '',
        printer: tray.printer || '',
        cost: rounded,
      };
    });

    const subtotalGeneral = rows.reduce((s, r) => s + r.cost, 0);

    // aplicar margen
    const marginPercent = Number(config.margin) || 0;
    const subtotalWithMargin = subtotalGeneral * (1 + marginPercent / 100);

    // aplicar IVA
    const ivaPercent = Number(config.iva) || 0;
    const subtotalWithMarginAndIVA = subtotalWithMargin * (1 + ivaPercent);

    const designFeeValue = Number(config.designFee ?? 5000);
    const designFee = includeDesign ? designFeeValue : 0;

    const totalToCharge = roundTo50(subtotalWithMarginAndIVA + designFee);

    const rowsHtml = rows.map(r => `
      <tr>
        <td style="border:1px solid #ccc;padding:8px;text-align:center;">${r.index}</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:right;">${r.weight} g</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:center;">${r.material}</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:center;">${r.printer}</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:right;">$ ${r.cost.toLocaleString('es-CL')}</td>
      </tr>
    `).join('');

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
                <th style="border:1px solid #ccc;padding:8px;">Costo (CLP)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div style="margin-top:12px;font-size:1rem;">
            <p style="margin:4px 0;"><strong>Subtotal:</strong> $ ${subtotalGeneral.toLocaleString('es-CL')} CLP</p>
            <p style="margin:4px 0;"><strong>Margen (${marginPercent}%):</strong> $ ${Math.round(subtotalWithMargin - subtotalGeneral).toLocaleString('es-CL')} CLP</p>
            <p style="margin:4px 0;"><strong>IVA (${ivaPercent * 100}%):</strong> $ ${Math.round(subtotalWithMarginAndIVA - subtotalWithMargin).toLocaleString('es-CL')} CLP</p>
            <p style="margin:4px 0;"><strong>Recargo por diseño:</strong> $ ${designFee.toLocaleString('es-CL')} CLP</p>
            <h2 style="margin-top:12px;">Total a cobrar: $ ${totalToCharge.toLocaleString('es-CL')} CLP</h2>
          </div>
        </div>
      `,
      totalToCharge
    };
  };

  const generatePdf = async (includeDesign) => {
    const { html } = buildQuotationHtmlFragment(includeDesign);

    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '0';
    wrapper.style.background = '#fff';
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    try {
      const canvas = await html2canvas(wrapper, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const filename = `${new Date().toISOString().slice(0,10)}_proyecto_${projectName}.pdf`;
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
        className="btn-orange"
        onClick={() => setShowOptions((s) => !s)}
        style={{ marginLeft: '0.5rem' }}
      >
        Generar cotización (PDF)
      </button>

      <div className={`pdf-panel ${showOptions ? 'visible' : ''}`}>
        <label className="pdf-panel-option">
          <input
            type="checkbox"
            className="checkbox-block"
            checked={includesDesign}
            onChange={(e) => setIncludesDesign(e.target.checked)}
          />
          <span>Incluye diseño (+ ${config.designFee ?? 5000} CLP)</span>
        </label>

        <div className="pdf-panel-actions">
          <button
            className="btn-white"
            onClick={() => setShowOptions(false)}
          >
            Cancelar
          </button>
          <button
            className="btn-orange"
            onClick={() => {
              setShowOptions(false);
              generatePdf(includesDesign);
            }}
          >
            Descargar PDF
          </button>
        </div>
      </div>
    </>
  );
}