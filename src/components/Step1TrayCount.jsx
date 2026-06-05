import { MdCreateNewFolder } from 'react-icons/md';

export default function Step1TrayCount({ trayCount, setTrayCount, projectName, setProjectName, nextStep }) {
  return (
    <div>
      <h2 className="step-title">
        <MdCreateNewFolder size={28} />
        Crear nuevo Proyecto
      </h2>

      <div className="form-row full">
        <div className="form-group">
          <label className="form-label">Nombre del Proyecto</label>
          <input
            type="text"
            className="form-input"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
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
            onChange={(e) => setTrayCount(e.target.value)}
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
