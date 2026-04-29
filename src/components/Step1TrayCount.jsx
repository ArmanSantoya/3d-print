import { useNavigate } from 'react-router-dom';

export default function Step1TrayCount({ trayCount, setTrayCount, setTrayData, projectName, setProjectName, nextStep }) {
  const navigate = useNavigate();

  const handleChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setTrayCount(count);
    setTrayData(Array.from({ length: count }, (_, i) => ({ name: `Bandeja ${i + 1}`, weight: '', time: '', material: 'PLA', printer: 'P1S', hours: 0, minutes: 0 })));
  };

  const handleProjectNameChange = (e) => {
    setProjectName(e.target.value);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="btn-white"
          onClick={() => navigate('/settings')}
          title="Configuración"
        >
          ⚙️
        </button>
      </div>

      <h2>Paso 1: Informacion del proyecto</h2>
      <div className='project-info'>
        <label>Nombre del proyecto:</label>
        <input
          type="text"
          value={projectName}
          onChange={handleProjectNameChange}
        />
      
      <label>cantidad de bandejas:</label>
      <input
        type="number"
        min="1"
        value={trayCount}
        onChange={handleChange}
        placeholder="Cantidad de bandejas"
      />
      </div>
      <div className="button-group">
        <button type="button" className="btn-orange" onClick={nextStep} disabled={trayCount < 1}>
          Siguiente
        </button>
      </div>
    </div>
  );
}
