import PdfGenerator from './PdfGenerator';

export default function Step3Summary({ trayData = [], config = {}, prevStep }) {
  // Redondeo al múltiplo de 50 más cercano
  const roundTo50 = (value) => Math.round((Number(value) || 0) / 50) * 50;

  // formatea tiempo total (horas decimales) a "Xd Yh Zm"
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

  const calculateTrayDetails = (tray) => {
    const weight = Number(tray.weight) || 0;
    const time = Number(tray.time) || 0; // horas decimales
    const materialKey = tray.material;

    // Material
    const materialPricePerKg = (config.materials && config.materials[materialKey]) || 0;
    const pricePerGram = materialPricePerKg / 1000;
    const materialCost = weight * pricePerGram;

    // Energía real
    const consumptionKw = Number(config.electricity?.consumptionKw) || 0;
    const pricePerKwh = Number(config.electricity?.pricePerKwh) || 0;
    const electricityCostPerHour = consumptionKw * pricePerKwh;
    const electricityCost = time * electricityCostPerHour;

    // Costo fijo de máquina por hora
    const machineCost = time * (config.machineCostPerHour || 0);

    // Subtotal directo (sin margen ni IVA)
    const subtotal = materialCost + electricityCost + machineCost;

    return {
      materialCost: Math.round(materialCost),
      electricityCost: Math.round(electricityCost),
      machineCost: Math.round(machineCost),
      subtotal: Math.round(subtotal)
    };
  };

  // Totales generales
  const totalWeight = trayData.reduce((sum, tray) => sum + (Number(tray.weight) || 0), 0);
  const totalTime = trayData.reduce((sum, tray) => sum + (Number(tray.time) || 0), 0);
  const subtotalGeneral = trayData.reduce((sum, tray) => sum + calculateTrayDetails(tray).subtotal, 0);

  // Margen e IVA aplicados solo al total
  const marginPercent = Number(config.margin) || 0;
  const subtotalWithMargin = subtotalGeneral * (1 + marginPercent / 100);
  const marginAmount = subtotalWithMargin - subtotalGeneral;

  const ivaPercent = Number(config.iva) || 0;
  const ivaAmount = subtotalWithMargin * ivaPercent;
  const totalWithIva = subtotalWithMargin + ivaAmount;

  const totalRounded = roundTo50(totalWithIva);

  return (
    <div>
      <h2>Paso 3: Resumen</h2>

      <table className="summary-table">
        <thead>
          <tr>
            <th>Bandeja</th>
            <th>Peso (g)</th>
            <th>Tiempo (h)</th>
            <th>Material</th>
            <th>Costo </th>
            <th>Energía </th>
            <th>Máquina </th>
            <th>Subtotal </th>
          </tr>
        </thead>
        <tbody>
          {trayData.map((tray, i) => {
            const { materialCost, electricityCost, machineCost, subtotal } = calculateTrayDetails(tray);

            return (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{tray.weight}</td>
                <td>{tray.time}</td>
                <td>{tray.material}</td>
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
        <p><strong>Subtotal general:</strong> ${Math.round(subtotalGeneral).toLocaleString('es-CL')} CLP</p>
        <p><strong>Margen ({marginPercent}%):</strong> ${Math.round(marginAmount).toLocaleString('es-CL')} CLP</p>
        <p><strong>Subtotal + margen:</strong> ${Math.round(subtotalWithMargin).toLocaleString('es-CL')} CLP</p>
        <p><strong>IVA ({ivaPercent * 100}%):</strong> ${Math.round(ivaAmount).toLocaleString('es-CL')} CLP</p>
        <p className="total">💰 Precio total: ${totalRounded.toLocaleString('es-CL')} CLP</p>
      </div>

      <div className="button-group" style={{ marginTop: '1rem' }}>
        <button className="btn-white" onClick={prevStep}>Volver</button>
        <PdfGenerator trayData={trayData} config={config} />
      </div>
    </div>
  );
}