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

      <div className="button-group">
        <button className="btn-white" onClick={prevStep}>Volver</button>
      </div>
    </div>
  );
}
