import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logoPath from '/logo.jpg';

export default function Step3Summary({ trayData = [], config = {}, prevStep }) {
  // Redondea hacia arriba al múltiplo de 500 más cercano
  const roundUpTo500 = (value) => Math.ceil(value / 500) * 500;

  const calculateTrayCost = (tray) => {
    const weight = Number(tray.weight) || 0;
    const time = Number(tray.time) || 0;
    const materialKey = tray.material;
    const materialPricePerKg = (config.materials && config.materials[materialKey]) || 0;
    const pricePerGram = materialPricePerKg / 1000;
    const materialCost = weight * pricePerGram;
    const electricityCost = time * ((config.electricity && config.electricity.kwh) || 0) * ((config.electricity && config.electricity.price) || 0);
    const maintenance = materialCost * time * 0.1;
    const total = materialCost + electricityCost + maintenance + (config.labor || 0);
    return total * (1 + ((config.margin || 0) / 100));
  };

  const totalWeight = trayData.reduce((sum, tray) => sum + (Number(tray.weight) || 0), 0);
  const totalTime = trayData.reduce((sum, tray) => sum + (Number(tray.time) || 0), 0);
  const totalCost = trayData.reduce((sum, tray) => sum + calculateTrayCost(tray), 0);
  const totalRounded = roundUpTo500(totalCost);

   // ------------------ PDF / Cotización ------------------
  // nota: reemplazado modal por panel inline (showOptions)
  const [showOptions, setShowOptions] = useState(false);
  const [includesDesign, setIncludesDesign] = useState(false);

  const formatTimeHM = (timeHours) => {
    const hrs = Math.floor(Number(timeHours) || 0);
    const mins = Math.round(((Number(timeHours) || 0) - hrs) * 60);
    return `${hrs}h ${mins}m`;
  };

  const buildQuotationHtmlFragment = (includeDesign) => {
    const rows = trayData.map((tray, i) => {
      const raw = calculateTrayCost(tray);
      const rounded = roundUpTo500(raw);
      return {
        index: i + 1,
        weight: Number(tray.weight) || 0,
        timeHM: formatTimeHM(tray.time),
        material: tray.material || '',
        cost: rounded,
      };
    });

    const subtotal = rows.reduce((s, r) => s + r.cost, 0);
    const designFeeValue = Number(config.designFee ?? 5000);
    const designFee = includeDesign ? designFeeValue : 0;
    const totalToCharge = subtotal + designFee;

    const rowsHtml = rows.map(r => `
      <tr>
        <td style="border:1px solid #ccc;padding:8px;text-align:center;">${r.index}</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:right;">${r.weight} g</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:center;">${r.material}</td>
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
              <div style="font-size:12px;color:#666;">Generado: ${new Date().toLocaleString()}</div>
            </div>
          </div>

          <table style="width:100%;border-collapse:collapse;margin-top:12px;">
            <thead>
              <tr style="background:#f5f5f5">
                <th style="border:1px solid #ccc;padding:8px;">Bandeja</th>
                <th style="border:1px solid #ccc;padding:8px;">Peso</th>
      
                <th style="border:1px solid #ccc;padding:8px;">Material</th>
                <th style="border:1px solid #ccc;padding:8px;">Costo (CLP)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div style="margin-top:12px;font-size:1rem;">
            <p style="margin:4px 0;"><strong>Subtotal:</strong> $ ${subtotal.toLocaleString('es-CL')} CLP</p>
            <p style="margin:4px 0;"><strong>Incluye diseño:</strong> ${includeDesign ? 'Sí' : 'No'}</p>
            <p style="margin:4px 0;"><strong>Recargo por diseño:</strong> $ ${designFee.toLocaleString('es-CL')} CLP</p>
            <h2 style="margin-top:12px;">Total a cobrar: $ ${totalToCharge.toLocaleString('es-CL')} CLP</h2>
          </div>
        </div>
      `,
      subtotal,
      designFee,
      totalToCharge
    };
  };

  const generatePdf = async (includeDesign) => {
    const { html } = buildQuotationHtmlFragment(includeDesign);

    // crear contenedor temporal en DOM (visible para html2canvas)
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
      const filename = `Cotizacion_Arman3D_${new Date().toISOString().slice(0,10)}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error generando el PDF.');
    } finally {
      document.body.removeChild(wrapper);
    }
  };
  // ------------------ END PDF ------------------

  return (
    <div>
      <h2>Paso 3: Resumen</h2>

      <table className="summary-table">
        <thead>
          <tr>
            <th>Bandeja</th>
            <th>Peso (g)</th>
            <th>tiempo (h)</th>
            <th>Material</th>
            <th>Costo (CLP)</th>
          </tr>
        </thead>
        <tbody>
          {trayData.map((tray, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{tray.weight}</td>
              <td>{tray.time}</td>
              <td>{tray.material}</td>
              <td>${calculateTrayCost(tray).toLocaleString('es-CL')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="summary-box">
        <p><strong>Peso total:</strong> {totalWeight} g</p>
        <p><strong>Tiempo total:</strong> {totalTime} h</p>
        <p><strong>Total sin redondear:</strong> ${totalCost.toLocaleString('es-CL')} CLP</p>
        <p className="total">💰 Precio total: ${totalRounded.toLocaleString('es-CL')} CLP</p>
      </div>

      <div className="button-group" style={{ marginTop: '1rem' }}>
        <button className="btn-white" onClick={prevStep}>Volver</button>
        <button
          className="btn-orange"
          onClick={() => setShowOptions((s) => !s)}
          style={{ marginLeft: '0.5rem' }}
        >
          Generar cotización (PDF)
        </button>
      </div>

      {/* Panel inline (antes modal) */}
      <div className={`pdf-panel ${showOptions ? 'visible' : ''}`}>

        <label className="pdf-panel-option">
          <input
            type="checkbox"
            className="checkbox-block"
            checked={includesDesign}
            onChange={(e) => setIncludesDesign(e.target.checked)}
          />
          <span>Incluye diseño (+ $5.000 CLP)</span>
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
    </div>
  );
}