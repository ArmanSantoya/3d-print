import { useState } from 'react';
import Step1TrayCount from './Step1TrayCount';
import Step2TrayInputs from './Step2TrayInputs';
import Step3Summary from './Step3Summary';


export default function MultiStepForm({ config }) {
  const [step, setStep] = useState(1);
  const [trayCount, setTrayCount] = useState(0);
  const [trayData, setTrayData] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [exiting, setExiting] = useState(false);

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
      <img src="/3d-print/logo.jpg" alt="Logo" style={{ height: '100px', marginBottom: '1rem' }} />

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
