import { useState } from 'react';
import { MdNavigateBefore, MdNavigateNext, MdRefresh, MdArrowBack } from 'react-icons/md';

export default function Step2TrayInputs({ trayData, updateTray, updateTrayTime, resetTrays, nextStep, prevStep, config }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  const currentTray = trayData[currentIndex];
  const total = trayData.length;

  if (!currentTray || !config || !config.materials || !config.printers) {
    return (
      <div>
        <h2 className="step-title">Datos de Bandejas</h2>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          <p>Por favor completa el primer paso para continuar.</p>
          <button className="btn btn-secondary" onClick={prevStep} type="button">
            <MdArrowBack size={20} />
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="step-title">
        Datos de Bandeja {currentIndex + 1} / {total}
      </h2>

      <div style={{ textAlign: 'left' }}>
        <div className="form-row full">
          <div className="form-group">
            <label className="form-label">Nombre de Bandeja</label>
            <input
              type="text"
              className="form-input"
              value={currentTray.name || ''}
              onChange={(e) => updateTray(currentIndex, 'name', e.target.value)}
              placeholder="Ej: Bandeja Superior"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Peso (g)</label>
            <input
              type="number"
              className="form-input"
              step="0.1"
              value={currentTray.weight}
              onChange={(e) => updateTray(currentIndex, 'weight', e.target.value)}
              placeholder="150"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Material</label>
            <select
              className="form-select"
              value={currentTray.material}
              onChange={(e) => updateTray(currentIndex, 'material', e.target.value)}
            >
              {Object.keys(config.materials || {}).map((mat) => (
                <option key={mat} value={mat}>{mat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tiempo de Impresión - Horas</label>
            <input
              type="number"
              className="form-input"
              min="0"
              step="1"
              value={currentTray.hours || ''}
              onChange={(e) => updateTrayTime(currentIndex, e.target.value, currentTray.minutes)}
              placeholder="2"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Minutos</label>
            <input
              type="number"
              className="form-input"
              min="0"
              max="59"
              step="1"
              value={currentTray.minutes || ''}
              onChange={(e) => updateTrayTime(currentIndex, currentTray.hours, e.target.value)}
              placeholder="30"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Impresora</label>
            <select
              className="form-select"
              value={currentTray.printer}
              onChange={(e) => updateTray(currentIndex, 'printer', e.target.value)}
            >
              {Object.keys(config.printers || {}).map((printer) => (
                <option key={printer} value={printer}>{printer}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {total > 1 && (
        <div className="form-row full">
          <div className="step-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={currentIndex === 0}
            >
              <MdNavigateBefore size={20} />
              Anterior
            </button>
            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#666' }}>
              Bandeja {currentIndex + 1} de {total}
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentIndex((i) => i + 1)}
              disabled={currentIndex === total - 1}
            >
              Siguiente
              <MdNavigateNext size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="button-group">
        <button type="button" className="btn btn-secondary" onClick={prevStep}>
          <MdArrowBack size={20} />
          Atrás
        </button>
        <button type="button" className="btn btn-secondary" onClick={resetTrays}>
          <MdRefresh size={20} />
          Reiniciar
        </button>
        <button type="submit" className="btn btn-primary">
          Siguiente
        </button>
      </div>
    </form>
  );
}
