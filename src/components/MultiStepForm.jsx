import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1TrayCount from './Step1TrayCount';
import Step2TrayInputs from './Step2TrayInputs';
import Step3Summary from './Step3Summary';
import { useAuth } from '../context/AuthContext';


export default function MultiStepForm({ config }) {
  const navigate = useNavigate();
  const { user, logout, getUserName } = useAuth();
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
      <header className="app-header">
        <div className="header-logo">
          <img src="/3d-print/logo.jpg" alt="Logo" className="logo-img" />
        </div>
        
        <nav className="header-nav">
          <button 
            className="nav-button projects-btn"
            onClick={() => navigate('/saved-projects')}
            title="Ver proyectos guardados"
          >
            <span className="nav-icon">📁</span>
            <span className="nav-label">Mis Proyectos</span>
          </button>
          
          <button 
            className="nav-button settings-btn"
            onClick={() => navigate('/settings')}
            title="Configuración"
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Configuración</span>
          </button>
        </nav>

        <div className="header-user">
          <div className="user-info">
            <div className="user-email">{getUserName()}</div>
          </div>
          <button 
            className="nav-button logout-btn"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Salir</span>
          </button>
        </div>
      </header>

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
