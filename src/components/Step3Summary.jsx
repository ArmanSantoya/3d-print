import { useState } from 'react';
import { MdCheckCircle, MdArrowBack, MdAddCircle, MdSave, MdPictureAsPdf } from 'react-icons/md';
import PdfGenerator from './PdfGenerator';
import { calculateTrayDetails, roundTo50 } from '../utils/costCalculator';
import { projectsApi } from '../utils/database';

export default function Step3Summary({ trayData = [], config = {}, projectName = '', prevStep, resetAndCreateNew }) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      setSaveMessage('Por favor ingresa un nombre para el proyecto');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      const totalWeight = trayData.reduce((sum, tray) => sum + (Number(tray.weight) || 0), 0);
      const totalTime = trayData.reduce((sum, tray) => sum + (Number(tray.time) || 0), 0);
      const totalGeneral = trayData.reduce((sum, tray) => sum + calculateTrayDetails(tray, config).subtotal, 0);

      const marginPercent = Number(config.margin) || 0;
      const subtotalWithMargin = totalGeneral * (1 + marginPercent / 100);
      const retentionRate = Number(config.retentionRate) || 0.1525;
      const brutoAmount = subtotalWithMargin / (1 - retentionRate);

      const projectData = {
        name: projectName,
        status: 'draft',
        weight_total_g: totalWeight,
        time_total_hours: totalTime,
        material_used_g: totalWeight,
        total_cost: Math.round(brutoAmount)
      };

      const details = trayData.map((tray, i) => {
        const { subtotal } = calculateTrayDetails(tray, config);
        return {
          tray_name: tray.name || `Bandeja ${i + 1}`,
          weight_g: Number(tray.weight) || 0,
          time_hours: Number(tray.time) || 0,
          material: tray.material,
          printer: tray.printer,
          cost: Math.round(subtotal)
        };
      });

      await projectsApi.saveWithDetails(projectData, details);
      setSaveMessage('Proyecto guardado exitosamente');
    } catch (error) {
      console.error('Error saving project:', error);
      setSaveMessage('Error al guardar el proyecto');
    } finally {
      setIsSaving(false);
    }
  };

  const formatTotalTime = (hoursDecimal) => {
    let totalMinutes = Math.round((Number(hoursDecimal) || 0) * 60);
    const days = Math.floor(totalMinutes / (24 * 60));
    totalMinutes -= days * 24 * 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes - hours * 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

    return parts.join(' ');
  };

  const totalWeight = trayData.reduce((sum, tray) => sum + (Number(tray.weight) || 0), 0);
  const totalTime = trayData.reduce((sum, tray) => sum + (Number(tray.time) || 0), 0);
  const totalGeneral = trayData.reduce((sum, tray) => sum + calculateTrayDetails(tray, config).subtotal, 0);

  const marginPercent = Number(config.margin) || 0;
  const subtotalWithMargin = totalGeneral * (1 + marginPercent / 100);

  const retentionRate = Number(config.retentionRate) || 0.1525;
  const brutoAmount = subtotalWithMargin / (1 - retentionRate);
  const retentionAmount = brutoAmount - subtotalWithMargin;

  const totalRounded = roundTo50(brutoAmount);

  return (
    <div>
      <h2 className="step-title">
        <MdCheckCircle size={28} />
        Resumen Final
      </h2>

      {projectName && (
        <div style={{ 
          background: 'rgba(245, 124, 0, 0.05)', 
          padding: '1rem', 
          borderRadius: '8px', 
          borderLeft: '4px solid #f57c00',
          marginBottom: '1.5rem'
        }}>
          <p style={{ margin: 0, fontWeight: '600', color: '#333', fontSize: '1.05rem' }}>
            Proyecto: {projectName}
          </p>
        </div>
      )}

      {/* Detalles por Bandeja */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333', marginBottom: '1rem' }}>
          Detalles de Bandejas
        </h3>
        <table className="summary-table">
          <thead>
            <tr>
              <th>Bandeja</th>
              <th>Peso (g)</th>
              <th>Tiempo (h)</th>
              <th>Material</th>
              <th>Impresora</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {trayData.map((tray, i) => {
              const { materialCost, electricityCost, machineCost, subtotal } = calculateTrayDetails(tray, config);
              return (
                <tr key={i}>
                  <td>{tray.name || `Bandeja ${i + 1}`}</td>
                  <td>{tray.weight}g</td>
                  <td>{tray.time}h</td>
                  <td>{tray.material}</td>
                  <td>{tray.printer}</td>
                  <td style={{ fontWeight: '600', color: '#f57c00' }}>${subtotal.toLocaleString('es-CL')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Resumen de Costos */}
      <div className="summary-info">
        <div className="summary-item">
          <div className="summary-item-label">Peso Total</div>
          <div className="summary-item-value">{totalWeight}g</div>
        </div>
        <div className="summary-item">
          <div className="summary-item-label">Tiempo Total</div>
          <div className="summary-item-value">{formatTotalTime(totalTime)}</div>
        </div>
        <div className="summary-item">
          <div className="summary-item-label">Subtotal Base</div>
          <div className="summary-item-value">${totalGeneral.toLocaleString('es-CL')}</div>
        </div>
        <div className="summary-item">
          <div className="summary-item-label">Con Margen ({marginPercent}%)</div>
          <div className="summary-item-value">${Math.round(subtotalWithMargin).toLocaleString('es-CL')}</div>
        </div>
      </div>

      {/* Cálculo Final */}
      <div style={{
        background: 'white',
        border: '2px solid #f57c00',
        borderRadius: '8px',
        padding: '1.5rem',
        marginTop: '1.5rem',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Retención Boleta de Honorarios ({(retentionRate * 100).toFixed(2)}%)
        </p>
        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.95rem', color: '#666' }}>
          ${Math.round(retentionAmount).toLocaleString('es-CL')}
        </p>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Monto Bruto a Facturar
        </p>
        <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: '#f57c00' }}>
          ${totalRounded.toLocaleString('es-CL')}
        </p>
      </div>

      {/* Mensajes */}
      {saveMessage && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          borderRadius: '8px',
          background: saveMessage.includes('error') || saveMessage.includes('Error') ? '#ffebee' : '#e8f5e9',
          color: saveMessage.includes('error') || saveMessage.includes('Error') ? '#c62828' : '#2e7d32',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '0.95rem'
        }}>
          {saveMessage}
        </div>
      )}

      {/* Botones */}
      <div className="button-group">
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={prevStep}
        >
          <MdArrowBack size={20} />
          Atrás
        </button>
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={resetAndCreateNew}
        >
          <MdAddCircle size={20} />
          Nueva Cotización
        </button>
        <button 
          type="button"
          className="btn btn-success" 
          onClick={handleSaveProject}
          disabled={isSaving}
        >
          <MdSave size={20} />
          {isSaving ? 'Guardando...' : 'Guardar Proyecto'}
        </button>
        <PdfGenerator trayData={trayData} config={config} projectName={projectName} />
      </div>
    </div>
  );
}
