import PdfGenerator from './PdfGenerator';

export default function Step3Summary({ trayData = [], config = {}, projectName = '', prevStep, resetAndCreateNew }) {
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
  const totalGeneral = trayData.reduce((sum, tray) => sum + calculateTrayDetails(tray).subtotal, 0);

  const totalRounded = roundTo50(totalGeneral);

  return (
    <div>
      <h2>Paso 3: Resumen</h2>
      {projectName && <p style={{ marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>Proyecto: {projectName}</p>}

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
        <p className="total">💰 Precio total: ${totalRounded.toLocaleString('es-CL')} CLP</p>
      </div>

      <div className="button-group" style={{ marginTop: '1rem' }}>
        <button className="btn-white" onClick={prevStep}>Volver</button>
        <PdfGenerator trayData={trayData} config={config} projectName={projectName} />
        <button className="btn-dark" onClick={resetAndCreateNew}>Crear nueva cotización</button>
      </div>
    </div>
  );
}