import { MdCreateNewFolder } from 'react-icons/md';

export default function Step1TrayCount({ trayCount, setTrayCount, setTrayData, projectName, setProjectName, nextStep }) {

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
      <h2 className="step-title">
        <MdCreateNewFolder size={28} />
        Información del Proyecto
      </h2>

      <div className="form-row full">
        <div className="form-group">
          <label className="form-label">Nombre del Proyecto</label>
          <input
            type="text"
            className="form-input"
            value={projectName}
            onChange={handleProjectNameChange}
            placeholder="Ej: Pieza cliente ABC"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Cantidad de Bandejas</label>
          <input
            type="number"
            className="form-input"
            min="1"
            value={trayCount}
            onChange={handleChange}
            placeholder="2"
          />
        </div>
      </div>

      <div className="button-group">
        <button 
          type="button" 
          className="btn btn-primary" 
          onClick={nextStep} 
          disabled={trayCount < 1}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
