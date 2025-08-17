import { useNavigate } from 'react-router-dom';

export default function Settings({ config, setConfig }) {
  const navigate = useNavigate();

  const handleChange = (section, key, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: parseFloat(value)
      }
    }));
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
        {Object.keys(config.materials).map(mat => (
          <div key={mat}>
            <label>{mat}:</label>
            <input
              type="number"
              value={config.materials[mat]}
              onChange={e => handleChange('materials', mat, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="settings-section">
        <h4>Electricidad</h4>
        <label>Consumo (kWh/h):</label>
        <input
          type="number"
          value={config.electricity.kwh}
          onChange={e => handleChange('electricity', 'kwh', e.target.value)}
        />
        <label>Precio por kWh (CLP):</label>
        <input
          type="number"
          value={config.electricity.price}
          onChange={e => handleChange('electricity', 'price', e.target.value)}
        />
      </div>

      <div className="settings-section">
        <h4>Otros</h4>
        <label>Mano de obra (CLP):</label>
        <input
          type="number"
          value={config.labor}
          onChange={e => setConfig(prev => ({ ...prev, labor: parseFloat(e.target.value) }))}
        />
        <label>Margen de ganancia (%):</label>
        <input
          type="number"
          value={config.margin}
          onChange={e => setConfig(prev => ({ ...prev, margin: parseFloat(e.target.value) }))}
        />
      </div>

      <div className="settings-buttons">
        <button className="btn-orange" onClick={handleSave}>Guardar</button>
        <button className="btn-white" onClick={() => navigate('/')}>⬅️ Volver</button>
      </div>
    </div>
  );
}
