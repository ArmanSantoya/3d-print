import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdAdd, MdEdit, MdPrint, MdCheckCircle, MdPayments } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import { projectsApi } from '../utils/database'
import '../styles/home.css'

export default function Home() {
  const { user, isSuperAdmin } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.id) {
      loadProjects()
    }
  }, [user, isSuperAdmin])

  const loadProjects = async () => {
    try {
      setLoading(true)
      let data
      
      if (isSuperAdmin) {
        // Super admin sees all projects
        data = await projectsApi.getAll()
      } else {
        // Regular users see only their projects
        data = await projectsApi.getUserProjects(user.id)
      }
      
      // Get last 5 projects
      setProjects(data.slice(0, 5))
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: { icon: MdEdit, label: 'Borrador', color: '#FF9800' },
      printing: { icon: MdPrint, label: 'Imprimiendo', color: '#2196F3' },
      completed: { icon: MdCheckCircle, label: 'Completado', color: '#4CAF50' },
      paid: { icon: MdPayments, label: 'Pagado', color: '#8BC34A' },
    }
    return badges[status] || { icon: MdEdit, label: 'Desconocido', color: '#999' }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-AR')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount)
  }

  return (
    <div className="home">
      <header className="home-header">
        <div>
          <h1>Bienvenido</h1>
          <p>Aquí está un resumen de tus últimos proyectos</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => navigate('/calculator')}
        >
          <MdAdd size={20} />
          Nueva Cotización
        </button>
      </header>

      <section className="recent-projects">
        <h2>Proyectos Recientes</h2>
        
        {loading ? (
          <div className="loading">Cargando proyectos...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>No hay proyectos todavía</p>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/calculator')}
            >
              Crear tu primer proyecto
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => {
              const status = getStatusBadge(project.status)
              const StatusIcon = status.icon
              return (
                <div 
                  key={project.id} 
                  className="project-card"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <div className="card-header">
                    <h3>{project.name}</h3>
                    <span className="status-badge" style={{ color: status.color }}>
                      <StatusIcon size={16} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'text-bottom' }} />
                      {status.label}
                    </span>
                  </div>
                  
                  <div className="card-body">
                    <div className="project-info">
                      <span className="info-label">Costo Total:</span>
                      <span className="info-value">{formatCurrency(project.total_cost)}</span>
                    </div>
                    <div className="project-info">
                      <span className="info-label">Peso:</span>
                      <span className="info-value">{project.weight_total_g}g</span>
                    </div>
                    <div className="project-info">
                      <span className="info-label">Tiempo:</span>
                      <span className="info-value">{project.time_total_hours}h</span>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <small>{formatDate(project.created_at)}</small>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="quick-stats">
        <h2>Estadísticas Rápidas</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{projects.length}</div>
            <div className="stat-label">Proyectos</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {formatCurrency(projects.reduce((sum, p) => sum + p.total_cost, 0))}
            </div>
            <div className="stat-label">Costo Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {projects.reduce((sum, p) => sum + p.weight_total_g, 0)}g
            </div>
            <div className="stat-label">Peso Total</div>
          </div>
        </div>
      </section>
    </div>
  )
}
