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
        'P1S': { consumptionKw: config.electricity.consumptionKw },
        'Snapmaker U1': { consumptionKw: 0.6 },
        'Ender3 Standard': { consumptionKw: 0.3 }
      };
      delete config.electricity.consumptionKw;
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