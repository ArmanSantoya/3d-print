import { useNavigate } from 'react-router-dom';
import Step1TrayCount from './Step1TrayCount';
import Step2TrayInputs from './Step2TrayInputs';
import Step3Summary from './Step3Summary';
import { useAuth } from '../context/AuthContext';
import { useQuoteForm } from '../hooks/useQuoteForm';
import '../styles/multistepform.css';

export default function MultiStepForm({ config }) {
  const { user, logout, getUserName } = useAuth();
  const navigate = useNavigate();
  const {
    step, exiting,
    trayCount, trayData, projectName,
    goToStep,
    setTrayCount, setProjectName,
    updateTray, updateTrayTime, resetTrays,
    resetAndCreateNew,
  } = useQuoteForm();

  return (
    <div className="multistep-form">
      <div className="form-container">
        <div className="step-wrapper">
          <div className={`step-container ${step === 1 ? (exiting ? 'exiting' : 'active') : ''}`}>
            <Step1TrayCount
              trayCount={trayCount}
              setTrayCount={setTrayCount}
              projectName={projectName}
              setProjectName={setProjectName}
              nextStep={() => goToStep(2)}
            />
          </div>

          <div className={`step-container ${step === 2 ? (exiting ? 'exiting' : 'active') : ''}`}>
            <Step2TrayInputs
              trayData={trayData}
              updateTray={updateTray}
              updateTrayTime={updateTrayTime}
              resetTrays={resetTrays}
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
    </div>
  );
}
