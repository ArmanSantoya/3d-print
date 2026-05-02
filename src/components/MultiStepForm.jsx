import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1TrayCount from './Step1TrayCount';
import Step2TrayInputs from './Step2TrayInputs';
import Step3Summary from './Step3Summary';
import { useAuth } from '../context/AuthContext';


export default function MultiStepForm({ config }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [step, setStep] = useState(1);
  const [trayCount, setTrayCount] = useState(0);
  const [trayData, setTrayData] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [exiting, setExiting] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const goToStep = (targetStep) => {
    setExiting(true);
    setTimeout(() => {
      setStep(targetStep);
      setExiting(false);
    }, 300);
  };

  const resetAndCreateNew = () => {
    setTrayCount(0);
    setTrayData([]);
    setProjectName('');
    goToStep(1);
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <img src="/3d-print/logo.jpg" alt="Logo" style={{ height: '100px' }} />
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: '#666', paddingRight: '0.5rem' }}>
            {user?.email}
          </div>
          <button 
            className="btn-white" 
            onClick={() => navigate('/saved-projects')}
            style={{ fontSize: '0.9rem' }}
          >
            📁 Mis Proyectos
          </button>
          <button 
            className="btn-white" 
            onClick={() => navigate('/settings')}
            style={{ fontSize: '0.9rem' }}
          >
            ⚙️ Configuración
          </button>
          <button 
            className="btn-white" 
            onClick={handleLogout}
            style={{ fontSize: '0.9rem' }}
          >
            🚪 Salir
          </button>
        </div>
      </div>

      <div className="step-wrapper">
        <div className={`step-container ${step === 1 ? (exiting ? 'exiting' : 'active') : ''}`}>
          <Step1TrayCount
            trayCount={trayCount}
            setTrayCount={setTrayCount}
            setTrayData={setTrayData}
            projectName={projectName}
            setProjectName={setProjectName}
            nextStep={() => goToStep(2)}
          />
        </div>

        <div className={`step-container ${step === 2 ? (exiting ? 'exiting' : 'active') : ''}`}>
          <Step2TrayInputs
            trayData={trayData}
            setTrayData={setTrayData}
            nextStep={() => goToStep(3)}
            prevStep={() => goToStep(1)}
            config={config}
          />
        </div>

        <div className={`step-container final-step ${step === 3 ? (exiting ? 'exiting' : 'active') : ''}`}>
          <Step3Summary
            trayData={trayData}
            config={config}
            projectName={projectName}
            prevStep={() => goToStep(2)}
            resetAndCreateNew={resetAndCreateNew}
          />
        </div>
      </div>
    </div>
  );
}
