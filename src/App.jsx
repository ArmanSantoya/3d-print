import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Settings from './components/Settings';
import MultiStepForm from './components/MultiStepForm';
import SavedProjects from './components/SavedProjects';
import Login from './components/Login';
import Home from './components/Home';
import DashboardLayout from './components/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
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
    <AuthProvider>
      <Router basename="/3d-print">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute 
                element={
                  <DashboardLayout>
                    <Home />
                  </DashboardLayout>
                } 
              />
            } 
          />
          
          {/* Calculator Route */}
          <Route 
            path="/calculator" 
            element={
              <ProtectedRoute 
                element={
                  <DashboardLayout>
                    <MultiStepForm config={config} />
                  </DashboardLayout>
                } 
              />
            } 
          />
          
          {/* Saved Projects Route */}
          <Route 
            path="/saved-projects" 
            element={
              <ProtectedRoute 
                element={
                  <DashboardLayout>
                    <SavedProjects />
                  </DashboardLayout>
                } 
              />
            } 
          />
          
          {/* Settings Route */}
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute 
                element={
                  <DashboardLayout>
                    <Settings config={config} setConfig={setConfig} />
                  </DashboardLayout>
                } 
              />
            } 
          />
          
          {/* Redirect old paths */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}