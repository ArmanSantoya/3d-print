import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Settings from './components/Settings';
import MultiStepForm from './components/MultiStepForm';
import { defaultConfig } from './config';

export default function App() {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('config');
    let config = saved ? JSON.parse(saved) : defaultConfig;

    // Migrate old config structure
    if (config.electricity?.consumptionKw && !config.printers) {
      config.printers = {
        'P1S': { consumptionKw: config.electricity.consumptionKw, machineCostPerHour: 1200 },
        'Snapmaker U1': { consumptionKw: 0.6, machineCostPerHour: 800 },
        'Ender3 Standard': { consumptionKw: 0.3, machineCostPerHour: 500 }
      };
      delete config.electricity.consumptionKw;
    }

    // Migrate old machineCostPerHour to individual printers if not already set
    if (config.machineCostPerHour && config.printers) {
      Object.keys(config.printers).forEach(printer => {
        if (!config.printers[printer].machineCostPerHour) {
          config.printers[printer].machineCostPerHour = config.machineCostPerHour;
        }
      });
    }

    // Migrate old IVA to retentionRate for Boletas de Honorarios
    if (config.iva && !config.retentionRate) {
      config.retentionRate = 0.1525; // New rate for Boletas de Honorarios
      delete config.iva;
    }

    return config;
  });

  return (
    <Router basename="/3d-print">
      <Routes>
        <Route path="/" element={<MultiStepForm config={config} />} />
        <Route path="/settings" element={<Settings config={config} setConfig={setConfig} />} />
      </Routes>
    </Router>
  );
}