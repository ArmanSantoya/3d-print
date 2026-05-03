import { useState, useEffect } from 'react';
import { projectsApi } from '../utils/database';
import '../styles/savedProjects.css';

export default function SavedProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Error al cargar los proyectos');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = async (projectId) => {
    try {
      const project = await projectsApi.getWithDetails(projectId);
      setSelectedProject(project);
    } catch (err) {
      console.error('Error loading project details:', err);
      setError('Error al cargar los detalles del proyecto');
    }
  };

  const handleMarkAsPaid = async (projectId) => {
    if (!window.confirm('¿Marcar este proyecto como pagado?')) return;

    try {
      await projectsApi.markAsPaid(projectId);
      loadProjects();
      setSelectedProject(null);
      alert('✅ Proyecto marcado como pagado');
    } catch (err) {
      console.error('Error marking as paid:', err);
      alert('❌ Error al marcar como pagado');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')) return;

    try {
      await projectsApi.delete(projectId);
      loadProjects();
      setSelectedProject(null);
      alert('✅ Proyecto eliminado');
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('❌ Error al eliminar el proyecto');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: '📝 Borrador',
      printing: '🖨️ Imprimiendo',
      completed: '✅ Completado',
      paid: '💰 Pagado'
    };
    return badges[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  if (loading) {
    return <div className="saved-projects-container"><p className="loading-text">Cargando proyectos...</p></div>;
  }

  return (
    <div className="saved-projects-container">
      <div className="saved-projects-header">
        <h2>Proyectos Guardados</h2>
      </div>

      {error && <p className="projects-error">❌ {error}</p>}

      {projects.length === 0 ? (
        <p className="projects-empty">No hay proyectos guardados aún.</p>
      ) : (
        <div className="projects-layout">
          <div className="projects-list-section">
            <h3>Lista de Proyectos ({projects.length})</h3>
            <div className="projects-list">
              {projects.map(project => (
                <div
                  key={project.id}
                  className={`project-item ${selectedProject?.id === project.id ? 'selected' : ''}`}
                  onClick={() => handleProjectClick(project.id)}
                >
                  <div className="project-item-name">{project.name}</div>
                  <div className="project-item-info">
                    <div className="project-item-row">
                      <strong>Estado:</strong>
                      <span>{getStatusBadge(project.status)}</span>
                    </div>
                    <div className="project-item-row">
                      <strong>Costo:</strong>
                      <span>${project.total_cost.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="project-item-row">
                      <strong>Creado:</strong>
                      <span>{formatDate(project.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedProject && (
            <div className="project-details-section">
              <h3>Detalles del Proyecto</h3>
              <div className="project-details-card">
                <div className="project-details-header">
                  <div className="project-detail-item">
                    <span className="project-detail-label">Nombre:</span>
                    <span className="project-detail-value">{selectedProject.name}</span>
                  </div>
                  <div className="project-detail-item">
                    <span className="project-detail-label">Estado:</span>
                    <span className="project-detail-value">{getStatusBadge(selectedProject.status)}</span>
                  </div>
                </div>

                <div className="project-detail-item">
                  <span className="project-detail-label">Peso Total:</span>
                  <span className="project-detail-value">{selectedProject.weight_total_g} g</span>
                </div>
                <div className="project-detail-item">
                  <span className="project-detail-label">Tiempo Total:</span>
                  <span className="project-detail-value">{selectedProject.time_total_hours.toFixed(2)} h</span>
                </div>
                <div className="project-detail-item">
                  <span className="project-detail-label">Costo Total:</span>
                  <span className="project-detail-value">${selectedProject.total_cost.toLocaleString('es-CL')} CLP</span>
                </div>
                <div className="project-detail-item">
                  <span className="project-detail-label">Creado:</span>
                  <span className="project-detail-value">{formatDate(selectedProject.created_at)}</span>
                </div>
                {selectedProject.paid_at && (
                  <div className="project-detail-item">
                    <span className="project-detail-label">Pagado:</span>
                    <span className="project-detail-value">{formatDate(selectedProject.paid_at)}</span>
                  </div>
                )}

                <h4>Detalles de Bandejas</h4>
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>Bandeja</th>
                      <th className="table-header-right">Peso</th>
                      <th className="table-header-right">Tiempo</th>
                      <th>Material</th>
                      <th className="table-header-right">Costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProject.details?.map((detail, i) => (
                      <tr key={i}>
                        <td>{detail.tray_name}</td>
                        <td className="table-data-right">{detail.weight_g} g</td>
                        <td className="table-data-right">{detail.time_hours.toFixed(2)} h</td>
                        <td>{detail.material}</td>
                        <td className="table-data-right">${detail.cost.toLocaleString('es-CL')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="project-actions">
                  {selectedProject.status !== 'paid' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleMarkAsPaid(selectedProject.id)}
                    >
                      ✅ Marcar como Pagado
                    </button>
                  )}
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteProject(selectedProject.id)}
                  >
                    🗑️ Eliminar Proyecto
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
