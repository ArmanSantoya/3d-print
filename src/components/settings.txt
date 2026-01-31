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

  const handleConsumptionChange = (mat, value) => {
    setConfig(prev => ({
      ...prev,
      electricity: {
        ...prev.electricity,
        consumptionKw: {
          ...(prev.electricity?.consumptionKw || {}),
          [mat]: parseFloat(value) || 0
        }
      }
    }));
  };

  const handleElectricityPriceChange = (value) => {
    setConfig(prev => ({
      ...prev,
      electricity: {
        ...(prev.electricity || {}),
        price: parseFloat(value) || 0
      }
    }));
  };

  const handleSimpleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: parseFloat(value) }));
  };

  const handleSave = () => {
    localStorage.setItem('config', JSON.stringify(config));
    alert('Configuración guardada en localStorage');
  };

  return (
    <div className="settings-container">
      <h2>Configuración</h2>

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

      <div className="settings-section">
        <h4>Electricidad</h4>

        <label>Precio por kWh (CLP):</label>
        <input
          type="number"
          value={config.electricity?.price ?? 0}
          onChange={e => handleElectricityPriceChange(e.target.value)}
        />

        <h5>Consumo por material (kW)</h5>
        {(config.electricity?.consumptionKw ? Object.keys(config.electricity.consumptionKw) : Object.keys(config.materials || {})).map(mat => (
          <div key={mat}>
            <label>{mat}:</label>
            <input
              type="number"
              step="0.001"
              value={(config.electricity?.consumptionKw?.[mat]) ?? ''}
              onChange={e => handleConsumptionChange(mat, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="settings-section">
        <h4>Otros</h4>
        <label>Margen de ganancia (%):</label>
        <input
          type="number"
          value={config.margin}
          onChange={e => handleSimpleChange('margin', e.target.value)}
        />

        <label>Mantenimiento (decimal, ej. 0.1 = 10%):</label>
        <input
          type="number"
          step="0.01"
          value={config.maintenance}
          onChange={e => handleSimpleChange('maintenance', e.target.value)}
        />

        <label>Coste diseño (CLP):</label>
        <input
          type="number"
          value={config.designFee ?? 0}
          onChange={e => handleSimpleChange('designFee', e.target.value)}
        />
      </div>

      <div className="settings-buttons">
        <button className="btn-orange" onClick={handleSave}>Guardar</button>
        <button className="btn-white" onClick={() => navigate('/')}>⬅️ Volver</button>
      </div>
    </div>
  );
}
