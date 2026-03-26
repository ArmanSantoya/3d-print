import { useNavigate } from 'react-router-dom';

export default function Settings({ config, setConfig }) {
  const navigate = useNavigate();

  const handleMaterialChange = (mat, value) => {
    setConfig(prev => ({
      ...prev,
      materials: {
        ...prev.materials,
        [mat]: parseFloat(value) || 0
      }
    }));
  };

  const handleElectricityChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      electricity: {
        ...prev.electricity,
        [key]: parseFloat(value) || 0
      }
    }));
  };

  const handlePrinterChange = (printer, value) => {
    setConfig(prev => ({
      ...prev,
      printers: {
        ...prev.printers,
        [printer]: {
          ...prev.printers[printer],
          consumptionKw: parseFloat(value) || 0
        }
      }
    }));
  };

  const handleSimpleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const handleSave = () => {
    localStorage.setItem('config', JSON.stringify(config));
    alert('Configuración guardada en localStorage');
  };

  return (
    <div className="settings-container">
      <h2>Configuración</h2>

      {/* Materiales */}
      <div className="settings-section">
        <h4>Materiales (CLP/kg)</h4>
        {Object.keys(config.materials || {}).map(mat => (
          <div key={mat}>
            <label>{mat}:</label>
            <input
              type="number"
              value={config.materials[mat]}
              onChange={e => handleMaterialChange(mat, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Electricidad */}
      <div className="settings-section">
        <h4>Electricidad</h4>

        <label>Precio por kWh (CLP):</label>
        <input
          type="number"
          value={config.electricity?.pricePerKwh ?? 0}
          onChange={e => handleElectricityChange('pricePerKwh', e.target.value)}
        />

        <h5>Consumo por impresora (kW)</h5>
        {Object.keys(config.printers || {}).map(printer => (
          <div key={printer}>
            <label>{printer}:</label>
            <input
              type="number"
              step="0.01"
              value={config.printers[printer]?.consumptionKw ?? 0}
              onChange={e => handlePrinterChange(printer, e.target.value)}
            />
          </div>
        ))}

        <label>Coste fijo máquina por hora (CLP/h):</label>
        <input
          type="number"
          value={config.machineCostPerHour ?? 0}
          onChange={e => handleSimpleChange('machineCostPerHour', e.target.value)}
        />
      </div>

      {/* Margen de ganancia */}
      <div className="settings-section">
        <h4>Margen de ganancia</h4>
        <label>Porcentaje (%):</label>
        <input
          type="number"
          value={config.margin ?? 0}
          onChange={e => handleSimpleChange('margin', e.target.value)}
        />
      </div>

      {/* Otros */}
      <div className="settings-section">
        <h4>Otros</h4>
        <label>Coste diseño (CLP):</label>
        <input
          type="number"
          value={config.designFee ?? 0}
          onChange={e => handleSimpleChange('designFee', e.target.value)}
        />

        <label>IVA (decimal, ej. 0.19 = 19%):</label>
        <input
          type="number"
          step="0.01"
          value={config.iva ?? 0}
          onChange={e => handleSimpleChange('iva', e.target.value)}
        />
      </div>

      <div className="settings-buttons">
        <button className="btn-orange" onClick={handleSave}>Guardar</button>
        <button className="btn-white" onClick={() => navigate('/')}>⬅️ Volver</button>
      </div>
    </div>
  );
}