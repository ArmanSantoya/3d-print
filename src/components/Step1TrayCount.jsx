import { useNavigate } from 'react-router-dom';

export default function Step1TrayCount({ trayCount, setTrayCount, setTrayData, nextStep }) {
  const navigate = useNavigate();

  const handleChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setTrayCount(count);
    setTrayData(Array.from({ length: count }, () => ({ weight: '', time: '', material: 'PLA' })));
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

      <h2>Paso 1: Selecciona la cantidad de bandejas</h2>
      <input
        type="number"
        min="1"
        value={trayCount}
        onChange={handleChange}
        placeholder="Cantidad de bandejas"
      />
      <div className="button-group">
        <button type="button" className="btn-orange" onClick={nextStep} disabled={trayCount < 1}>
          Siguiente
        </button>
      </div>
    </div>
  );
}
