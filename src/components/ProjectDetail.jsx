import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MdArrowBack, MdCheckCircle, MdDelete } from 'react-icons/md'
import { projectsApi } from '../utils/database'
import { useAsync } from '../hooks/useAsync'
import { useConfig } from '../hooks/useConfig'
import '../styles/savedProjects.css'
import '../styles/projectDetail.css'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [config] = useConfig()
  const [project, setProject] = useState(null)
  const { loading, error, execute } = useAsync({ initialLoading: true })

  useEffect(() => {
    execute(async () => {
      const data = await projectsApi.getWithDetails(id)
      setProject(data)
    })
  }, [id])

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-CL')

  const formatTime = (hours) => {
    const totalMinutes = Math.round((hours || 0) * 60)
    const days = Math.floor(totalMinutes / (24 * 60))
    const rem = totalMinutes % (24 * 60)
    const h = Math.floor(rem / 60)
    const m = rem % 60
    const parts = []
    if (days > 0) parts.push(`${days}d`)
    if (h > 0) parts.push(`${h}h`)
    if (m > 0 || parts.length === 0) parts.push(`${m}m`)
    return parts.join(' ')
  }

  const getStatusLabel = (status) => {
    const map = { draft: '📝 Borrador', printing: '🖨️ Imprimiendo', completed: '✅ Completado', paid: '💰 Pagado' }
    return map[status] || status
  }

  const getTotalElectricity = (details) => {
    if (!details?.length) return 0
    return details.reduce((sum, d) => {
      if (d.electricity_cost != null) return sum + d.electricity_cost
      const kw = config.printers?.[d.printer]?.consumptionKw || 0
      const rate = config.electricity?.pricePerKwh || 0
      return sum + Math.round((d.time_hours || 0) * kw * rate)
    }, 0)
  }

  const getLiquidCost = (p) => {
    if (p.liquid_cost != null) return p.liquid_cost
    const retentionRate = config.retentionRate || 0.1525
    return Math.round(p.total_cost * (1 - retentionRate))
  }

  const handleMarkAsPaid = async () => {
    if (!window.confirm('¿Marcar este proyecto como pagado?')) return
    try {
      await projectsApi.markAsPaid(id)
      navigate('/saved-projects')
    } catch {
      alert('❌ Error al marcar como pagado')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')) return
    try {
      await projectsApi.delete(id)
      navigate('/saved-projects')
    } catch {
      alert('❌ Error al eliminar el proyecto')
    }
  }

  if (loading) {
    return (
      <div className="project-detail-page">
        <p className="project-detail-loading">Cargando proyecto...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="project-detail-page">
        <button className="project-detail-back" onClick={() => navigate('/saved-projects')}>
          <MdArrowBack size={16} /> Volver a proyectos
        </button>
        <p className="project-detail-error">❌ {error || 'Proyecto no encontrado'}</p>
      </div>
    )
  }

  const details = project.details || []
  const retentionRate = config.retentionRate || 0.1525
  const liquidCost = getLiquidCost(project)
  const retentionAmount = project.total_cost - liquidCost
  const totalElectricity = getTotalElectricity(details)

  return (
    <div className="project-detail-page">
      <button className="project-detail-back" onClick={() => navigate('/saved-projects')}>
        <MdArrowBack size={16} /> Volver a proyectos
      </button>

      <div className="project-detail-title-banner">
        <h2>Proyecto: {project.name}</h2>
        <span className="project-detail-status-badge">{getStatusLabel(project.status)}</span>
      </div>

      {/* Fechas */}
      <div className="project-detail-meta">
        <div className="project-detail-meta-item">
          <strong>Creado:</strong>
          <span>{formatDate(project.created_at)}</span>
        </div>
        {project.paid_at && (
          <div className="project-detail-meta-item">
            <strong>Pagado:</strong>
            <span>{formatDate(project.paid_at)}</span>
          </div>
        )}
      </div>

      {/* Tabla por bandeja */}
      <h3 className="project-detail-section-title">Detalle por Bandeja</h3>
      <div style={{ overflowX: 'auto' }}>
        <table className="project-detail-table">
          <thead>
            <tr>
              <th>Bandeja</th>
              <th className="right">Peso</th>
              <th className="right">Tiempo</th>
              <th>Material</th>
              <th>Impresora</th>
              <th className="right">Electricidad</th>
              <th className="right">Precio Bandeja</th>
            </tr>
          </thead>
          <tbody>
            {details.map((d, i) => (
              <tr key={i}>
                <td>{d.tray_name}</td>
                <td className="right">{d.weight_g} g</td>
                <td className="right">{formatTime(d.time_hours)}</td>
                <td>{d.material}</td>
                <td>{d.printer || '—'}</td>
                <td className="right">
                  {d.electricity_cost != null
                    ? `$${Math.round(d.electricity_cost).toLocaleString('es-CL')}`
                    : '—'}
                </td>
                <td className="right highlight">${d.cost.toLocaleString('es-CL')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <h3 className="project-detail-section-title">Resumen de Costos</h3>
      <div className="project-detail-totals">
        <div className="project-detail-total-card">
          <div className="project-detail-total-label">Peso Total</div>
          <div className="project-detail-total-value">{project.weight_total_g} g</div>
        </div>
        <div className="project-detail-total-card">
          <div className="project-detail-total-label">Tiempo Total</div>
          <div className="project-detail-total-value">{formatTime(project.time_total_hours)}</div>
        </div>
        <div className="project-detail-total-card">
          <div className="project-detail-total-label">Electricidad</div>
          <div className="project-detail-total-value">${totalElectricity.toLocaleString('es-CL')}</div>
        </div>
        <div className="project-detail-total-card">
          <div className="project-detail-total-label">Costo Líquido</div>
          <div className="project-detail-total-value">${liquidCost.toLocaleString('es-CL')}</div>
        </div>
      </div>

      {/* Bloque final prominente */}
      <div className="project-detail-final-block">
        <p className="project-detail-final-label">
          Retención Boleta de Honorarios ({(retentionRate * 100).toFixed(2)}%)
        </p>
        <p className="project-detail-final-amount">
          ${Math.round(retentionAmount).toLocaleString('es-CL')}
        </p>
        <p className="project-detail-bruto-label">Monto Bruto a Facturar</p>
        <p className="project-detail-bruto-value">
          ${project.total_cost.toLocaleString('es-CL')}
        </p>
      </div>

      {/* Acciones */}
      <div className="project-detail-actions">
        <button className="btn btn-secondary" onClick={() => navigate('/saved-projects')}>
          <MdArrowBack size={16} /> Volver
        </button>
        {project.status !== 'paid' && (
          <button className="btn btn-primary" onClick={handleMarkAsPaid}>
            <MdCheckCircle size={16} /> Marcar como Pagado
          </button>
        )}
        <button className="btn btn-danger" onClick={handleDelete}>
          <MdDelete size={16} /> Eliminar Proyecto
        </button>
      </div>
    </div>
  )
}
