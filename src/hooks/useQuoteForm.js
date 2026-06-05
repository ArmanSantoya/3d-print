import { useState, useCallback } from 'react';

const DEFAULT_TRAY = (index) => ({
  name: `Bandeja ${index + 1}`,
  weight: '',
  time: '',
  material: 'PLA',
  printer: 'P1S',
  hours: 0,
  minutes: 0,
});

export const useQuoteForm = () => {
  const [step, setStep] = useState(1);
  const [exiting, setExiting] = useState(false);
  const [trayCount, setTrayCountState] = useState(0);
  const [trayData, setTrayData] = useState([]);
  const [projectName, setProjectName] = useState('');

  const goToStep = useCallback((targetStep) => {
    setExiting(true);
    setTimeout(() => {
      setStep(targetStep);
      setExiting(false);
    }, 300);
  }, []);

  // Actualiza la cantidad de bandejas e inicializa el array automáticamente.
  const setTrayCount = useCallback((count) => {
    const n = parseInt(count, 10) || 0;
    setTrayCountState(n);
    setTrayData(Array.from({ length: n }, (_, i) => DEFAULT_TRAY(i)));
  }, []);

  // Actualiza un campo de texto/select de una bandeja específica.
  const updateTray = useCallback((index, field, value) => {
    setTrayData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  // Actualiza el tiempo de impresión a partir de horas y minutos separados.
  // Convierte a decimal (ej. 2h 30m → 2.5) y guarda los campos raw para
  // que el formulario pueda mostrarlos sin perder la edición parcial.
  const updateTrayTime = useCallback((index, hours, minutes) => {
    const h = parseInt(hours, 10) || 0;
    const m = parseInt(minutes, 10) || 0;
    setTrayData((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        hours: h,
        minutes: m,
        time: parseFloat((h + m / 60).toFixed(2)),
      };
      return updated;
    });
  }, []);

  // Reinicia todas las bandejas a valores vacíos manteniendo el conteo actual.
  const resetTrays = useCallback(() => {
    setTrayData((prev) => prev.map((_, i) => DEFAULT_TRAY(i)));
  }, []);

  const resetAndCreateNew = useCallback(() => {
    setTrayCountState(0);
    setTrayData([]);
    setProjectName('');
    goToStep(1);
  }, [goToStep]);

  return {
    step,
    exiting,
    trayCount,
    trayData,
    projectName,
    goToStep,
    setTrayCount,
    setProjectName,
    updateTray,
    updateTrayTime,
    resetTrays,
    resetAndCreateNew,
  };
};
