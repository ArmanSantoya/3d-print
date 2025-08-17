import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Settings from './components/Settings';
import MultiStepForm from './components/MultiStepForm';
import { defaultConfig } from './config';

export default function App() {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('config');
    return saved ? JSON.parse(saved) : defaultConfig;
  });

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MultiStepForm config={config} />} />
        <Route path="/settings" element={<Settings config={config} setConfig={setConfig} />} />
      </Routes>
    </Router>
  );
}
