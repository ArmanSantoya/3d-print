import { useState } from 'react';

export default function Step3Summary({ trayData, config, prevStep }) {
  // Redondea hacia arriba al múltiplo de 500 más cercano
  const roundUpTo500 = (value) => Math.ceil(value / 500) * 500;
  

  const calculateTrayCost = (tray) => {
    const pricePerGram = config.materials[tray.material] / 1000;
    const materialCost = tray.weight * pricePerGram;
    const electricityCost = tray.time * config.electricity.kwh * config.electricity.price;
    const maintenance = materialCost * tray.time * 0.1;
    const total = materialCost + electricityCost + maintenance + config.labor;
    return total * (1 + config.margin / 100);
  };

  const totalWeight = trayData.reduce((sum, tray) => sum + parseFloat(tray.weight || 0), 0);
  const totalTime = trayData.reduce((sum, tray) => sum + parseFloat(tray.time || 0), 0);
  const totalCost = trayData.reduce((sum, tray) => sum + calculateTrayCost(tray), 0);
  const totalRounded = roundUpTo500(totalCost);

  // ------------------ NEW: PDF / Cotización ------------------
  const [modalOpen, setModalOpen] = useState(false);
  const [includesDesign, setIncludesDesign] = useState(false);

  const formatTimeHM = (timeHours) => {
    const hrs = Math.floor(Number(timeHours) || 0);
    const mins = Math.round(((Number(timeHours) || 0) - hrs) * 60);
    return `${hrs}h ${mins}m`;
  };

  const buildQuotationHtml = (includeDesign) => {
    // Per-tray rounded costs
    const rows = trayData.map((tray, i) => {
      const raw = calculateTrayCost(tray);
      const rounded = roundUpTo500(raw);
      return {
        index: i + 1,
        weight: tray.weight || 0,
        timeHM: formatTimeHM(tray.time),
        material: tray.material,
        cost: rounded,
      };
    });

    const subtotal = rows.reduce((s, r) => s + r.cost, 0);
    const designFee = includeDesign ? 5000 : 0;
    const totalToCharge = subtotal + designFee;

    const rowsHtml = rows.map(r => `
      <tr>
        <td style="border:1px solid #ccc;padding:8px;text-align:center;">${r.index}</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:right;">${r.weight} g</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:center;">${r.timeHM}</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:center;">${r.material}</td>
        <td style="border:1px solid #ccc;padding:8px;text-align:right;">$ ${r.cost.toLocaleString('es-CL')}</td>
      </tr>
    `).join('');

    return `
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>Cotización Arman3D</title>
        </head>
        <body style="font-family:Arial,Helvetica,sans-serif;color:#111;margin:20px;">
          <h1>Cotización - Arman3D</h1>
          <table style="width:100%;border-collapse:collapse;margin-top:12px;">
            <thead>
              <tr style="background:#f5f5f5">
                <th style="border:1px solid #ccc;padding:8px;">Bandeja</th>
                <th style="border:1px solid #ccc;padding:8px;">Peso</th>
                <th style="border:1px solid #ccc;padding:8px;">Tiempo</th>
                <th style="border:1px solid #ccc;padding:8px;">Material</th>
                <th style="border:1px solid #ccc;padding:8px;">Costo (CLP)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div style="margin-top:16px;font-size:1rem;">
            <p><strong>Subtotal:</strong> $ ${subtotal.toLocaleString('es-CL')} CLP</p>
            <p><strong>Incluye diseño:</strong> ${includeDesign ? 'Sí' : 'No'}</p>
            <p><strong>Recargo por diseño:</strong> $ ${designFee.toLocaleString('es-CL')} CLP</p>
            <h2 style="margin-top:12px;">Total a cobrar: $ ${totalToCharge.toLocaleString('es-CL')} CLP</h2>
          </div>

          <div style="margin-top:28px;font-size:0.9rem;color:#666;">
            <p>Generado: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
  };

  const generatePdf = (includeDesign) => {
    const html = buildQuotationHtml(includeDesign);
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) return alert('No se pudo abrir la ventana para imprimir. Revisa el bloqueador de ventanas emergentes.');
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    // Esperamos a que cargue para llamar a print
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      // no cerramos automáticamente; el usuario puede guardar como PDF
    }, 500);
  };
  // ------------------ END NEW ------------------

  return (
    <div>
      <h2>Paso 3: Resumen</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f1f1f1' }}>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Bandeja</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Peso (g)</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>tiempo (h)</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Material</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Costo (CLP)</th>
          </tr>
        </thead>
        <tbody>
          {trayData.map((tray, i) => (
            <tr key={i}>
              <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{i + 1}</td>
              <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{tray.weight}</td>
              <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{tray.time}</td>
              <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{tray.material}</td>
              <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
                ${calculateTrayCost(tray).toLocaleString('es-CL')}
              </td>
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
          className="btn-primary"
          onClick={() => setModalOpen(true)}
          style={{ marginLeft: '0.5rem' }}
        >
          Generar cotización (PDF)
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: 340 }}>
            <h3 style={{ marginTop: 0 }}>Opciones de cotización</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={includesDesign}
                onChange={(e) => setIncludesDesign(e.target.checked)}
              />
              Incluye diseño (+ $5.000 CLP)
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button
                className="btn-white"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setModalOpen(false);
                  generatePdf(includesDesign);
                }}
              >
                Generar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}