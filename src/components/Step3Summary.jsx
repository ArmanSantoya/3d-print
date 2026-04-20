import PdfGenerator from './PdfGenerator';
import { calculateTrayDetails, roundTo50 } from '../utils/costCalculator';

export default function Step3Summary({ trayData = [], config = {}, projectName = '', prevStep, resetAndCreateNew }) {
  const formatTotalTime = (hoursDecimal) => {
    let totalMinutes = Math.round((Number(hoursDecimal) || 0) * 60);
    const days = Math.floor(totalMinutes / (24 * 60));
    totalMinutes -= days * 24 * 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes - hours * 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

    return parts.join(' ');
  };

  const totalWeight = trayData.reduce((sum, tray) => sum + (Number(tray.weight) || 0), 0);
  const totalTime = trayData.reduce((sum, tray) => sum + (Number(tray.time) || 0), 0);
  const totalGeneral = trayData.reduce((sum, tray) => sum + calculateTrayDetails(tray, config).subtotal, 0);

  const marginPercent = Number(config.margin) || 0;
  const subtotalWithMargin = totalGeneral * (1 + marginPercent / 100);

  const ivaPercent = Number(config.iva) || 0;
  const totalWithIVA = subtotalWithMargin * (1 + ivaPercent);

  const totalRounded = roundTo50(totalWithIVA);

  return (
    <div>
      <h2>Paso 3: Resumen</h2>
      {projectName && (
        <p style={{ marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
          Proyecto: {projectName}
        </p>
      )}

      <table className="summary-table">
        <thead>
          <tr>
            <th>Bandeja</th>
            <th>Peso (g)</th>
            <th>Tiempo (h)</th>
            <th>Material</th>
            <th>Impresora</th>
            <th>Costo</th>
            <th>Energía</th>
            <th>Máquina</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {trayData.map((tray, i) => {
            const { materialCost, electricityCost, machineCost, subtotal } = calculateTrayDetails(tray, config);
            return (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{tray.weight}</td>
                <td>{tray.time}</td>
                <td>{tray.material}</td>
                <td>{tray.printer}</td>
                <td>${materialCost.toLocaleString('es-CL')}</td>
                <td>${electricityCost.toLocaleString('es-CL')}</td>
                <td>${machineCost.toLocaleString('es-CL')}</td>
                <td>${subtotal.toLocaleString('es-CL')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="summary-box">
        <p><strong>Peso total:</strong> {totalWeight} g</p>
        <p><strong>Tiempo total:</strong> {formatTotalTime(totalTime)}</p>
        <p><strong>Subtotal:</strong> ${totalGeneral.toLocaleString('es-CL')} CLP</p>
        <p><strong>Con margen ({marginPercent}%):</strong> ${Math.round(subtotalWithMargin).toLocaleString('es-CL')} CLP</p>
        <p><strong>Con IVA ({ivaPercent * 100}%):</strong> ${Math.round(totalWithIVA).toLocaleString('es-CL')} CLP</p>
        <p className="total">💰 Precio total: ${totalRounded.toLocaleString('es-CL')} CLP</p>
      </div>

      <div className="button-group" style={{ marginTop: '1rem' }}>
        <button className="btn-white" onClick={prevStep}>Volver</button>
        <button className="btn-dark" onClick={resetAndCreateNew}>Crear nueva cotización</button>
        <PdfGenerator trayData={trayData} config={config} projectName={projectName} />
      </div>
    </div>
  );
}
