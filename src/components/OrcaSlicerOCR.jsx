import { useState } from 'react';
import Tesseract from 'tesseract.js';
import { parseOrcaSlicerData, validateParsedData } from '../utils/orcaSlicerParser';

export default function OrcaSlicerOCR({ onDataExtracted, trayIndex }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const processImage = async (file) => {
    try {
      setIsProcessing(true);
      setError('');
      setStatus('Procesando imagen...');

      // Run OCR with Spanish language support
      const result = await Tesseract.recognize(file, ['spa', 'eng']);
      const extractedText = result.data.text;

      setStatus('Analizando datos...');

      // Parse the extracted text
      const parsedData = parseOrcaSlicerData(extractedText);

      // Validate
      const validationErrors = [...parsedData.errors, ...validateParsedData(parsedData)];

      if (validationErrors.length > 0) {
        // Show the extracted text for manual correction
        setManualText(extractedText);
        setError(`Errores detectados:\n${validationErrors.join('\n')}\n\nEdita el texto a continuación:`);
        setShowManualInput(true);
        setStatus('');
      } else if (parsedData.weight && parsedData.time) {
        setStatus('✅ Datos extraídos correctamente');
        onDataExtracted(parsedData.weight, parsedData.time);
        setTimeout(() => {
          setStatus('');
          setShowManualInput(false);
        }, 2000);
      }
    } catch (err) {
      setError(`Error en OCR: ${err.message}`);
      setShowManualInput(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        processImage(file);
      } else {
        setError('Por favor arrastra una imagen');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e) => {
    if (e.target.files.length > 0) {
      processImage(e.target.files[0]);
    }
  };

  const handleManualSubmit = () => {
    if (!manualText.trim()) {
      setError('Por favor ingresa el texto del resumen');
      return;
    }

    const parsedData = parseOrcaSlicerData(manualText);
    const validationErrors = [...parsedData.errors, ...validateParsedData(parsedData)];

    if (validationErrors.length > 0) {
      setError(`Errores:\n${validationErrors.join('\n')}`);
    } else if (parsedData.weight && parsedData.time) {
      onDataExtracted(parsedData.weight, parsedData.time);
      setManualText('');
      setShowManualInput(false);
      setError('');
    }
  };

  return (
    <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        📸 OrcaSlicer (Bandeja {trayIndex + 1})
      </label>

      {/* Drag & Drop Area */}
      {!showManualInput && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border: isDragging ? '2px solid #ff6b35' : '2px dashed #ccc',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: isDragging ? '#fff0e6' : '#fafafa',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          {isProcessing ? (
            <p>⏳ Procesando...</p>
          ) : (
            <>
              <p>Arrastra la imagen del resumen de OrcaSlicer</p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>o</p>
              <label style={{ cursor: 'pointer', color: '#ff6b35', textDecoration: 'underline' }}>
                haz clic para seleccionar
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                  disabled={isProcessing}
                />
              </label>
            </>
          )}
        </div>
      )}

      {/* Status */}
      {status && (
        <p style={{ marginTop: '0.5rem', color: '#2ecc71', fontWeight: 'bold' }}>
          {status}
        </p>
      )}

      {/* Error */}
      {error && (
        <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#ffe6e6', borderRadius: '4px', color: '#c00' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{error}</p>
        </div>
      )}

      {/* Manual Input Fallback */}
      {showManualInput && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
          <p style={{ marginTop: 0, fontWeight: 'bold' }}>O ingresa manualmente el resumen de OrcaSlicer:</p>
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder={`Ejemplo:\nFilamento total: 119.52 m, 350.72 g\nTiempo total: 1d21h24m`}
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '0.5rem',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              borderRadius: '4px',
              border: '1px solid #ccc',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleManualSubmit}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Aceptar
            </button>
            <button
              onClick={() => {
                setShowManualInput(false);
                setManualText('');
                setError('');
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
