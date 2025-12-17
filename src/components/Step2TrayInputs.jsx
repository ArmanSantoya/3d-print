import { useState } from 'react';

export default function Step2TrayInputs({ trayData, setTrayData, nextStep, prevStep, config }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleChange = (field, value, idx = currentIndex) => {
    const updated = [...trayData];
    updated[idx] = { ...updated[idx], [field]: value };
    setTrayData(updated);
  };

  const handleTimePartChange = (field, value, idx = currentIndex) => {
    const updated = [...trayData];
    updated[idx] = {
      ...updated[idx],
      [field]: parseInt(value, 10) || 0
    };

    const hrs = updated[idx].hours || 0;
    const min = updated[idx].minutes || 0;
    updated[idx].time = parseFloat((hrs + min / 60).toFixed(2));

    setTrayData(updated);
  };

  const handleReset = () => {
    const reset = trayData.map(() => ({
      weight: '',
      time: '',
      material: 'PLA',
      hours: 0,
      minutes: 0
    }));
    setTrayData(reset);
    setCurrentIndex(0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  const renderTrayCard = (tray, i, total) => (
    <div className={`tray-card${total === 1 ? ' single' : ''}`} key={i}>
      <h4>Bandeja {i + 1} de {total}</h4>

      <label>Peso (g): </label>
      <input
        type="number"
        value={tray.weight}
        onChange={e => handleChange('weight', e.target.value, i)}
      />

      <label>Tiempo de impresión:</label>
      <div className={"time-input-group"}>
        <input
          type="number"
          placeholder="Horas"
          value={tray.hours || ''}
          onChange={e => handleTimePartChange('hours', e.target.value, i)}
        />
        <input
          type="number"
          placeholder="Minutos"
          value={tray.minutes || ''}
          onChange={e => handleTimePartChange('minutes', e.target.value, i)}
        />
      </div>

      <label>Material: </label>
      <select
        value={tray.material}
        onChange={e => handleChange('material', e.target.value, i)}
      >
        {Object.keys(config.materials).map(mat => (
          <option key={mat} value={mat}>{mat}</option>
        ))}
      </select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <h2>Paso 2: datos de cada bandeja</h2>

      <div className="tray-card-wrapper">
        {trayData.length === 1 ? (
          renderTrayCard(trayData[0], 0, 1)
        ) : (
          <div
            className="tray-card-slider"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {trayData.map((tray, i) => renderTrayCard(tray, i, trayData.length))}
          </div>
        )}
      </div>

      {trayData.length > 1 && (
        <div className="nav-buttons">
          <button
            type="button"
            className="btn-white tray-nav"
            onClick={() => setCurrentIndex(i => i - 1)}
            disabled={currentIndex === 0}
          >
            ←
          </button>
          <b>Bandejas</b>
          <button
            type="button"
            className="btn-white tray-nav"
            onClick={() => setCurrentIndex(i => i + 1)}
            disabled={currentIndex === trayData.length - 1}
          >
            →
          </button>
        </div>
      )}

      <div className="button-group">
        <button type="button" className="btn-white" onClick={prevStep}>Back</button>
        <button type="submit" className="btn-orange">Next</button>
        <button type="button" className="btn-dark" onClick={handleReset}>Reset</button>
      </div>
    </form>
  );
}
