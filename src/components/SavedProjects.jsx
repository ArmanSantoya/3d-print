import { useState, useEffect } from 'react';
import { projectsApi } from '../utils/database';

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
    return <div className="container"><p>Cargando proyectos...</p></div>;
  }

  return (
    <div className="container">
      <h2>Proyectos Guardados</h2>

      {error && <p style={{ color: '#d32f2f', marginBottom: '1rem' }}>❌ {error}</p>}

      {projects.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>No hay proyectos guardados aún.</p>
      ) : (
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ flex: 1 }}>
            <h3>Lista de Proyectos ({projects.length})</h3>
            <div style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              maxHeight: '600px', 
              overflowY: 'auto' 
            }}>
              {projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #ddd',
                    cursor: 'pointer',
                    backgroundColor: selectedProject?.id === project.id ? '#f0f0f0' : 'white',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = selectedProject?.id === project.id ? '#f0f0f0' : 'white'}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {project.name}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>Estado:</strong> {getStatusBadge(project.status)}
                    </p>
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>Costo:</strong> ${project.total_cost.toLocaleString('es-CL')} CLP
                    </p>
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>Creado:</strong> {formatDate(project.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedProject && (
            <div style={{ flex: 1 }}>
              <h3>Detalles del Proyecto</h3>
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong>Nombre:</strong> {selectedProject.name}
                  </p>
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong>Estado:</strong> {getStatusBadge(selectedProject.status)}
                  </p>
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong>Peso Total:</strong> {selectedProject.weight_total_g} g
                  </p>
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong>Tiempo Total:</strong> {selectedProject.time_total_hours.toFixed(2)} h
                  </p>
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong>Costo Total:</strong> ${selectedProject.total_cost.toLocaleString('es-CL')} CLP
                  </p>
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong>Creado:</strong> {formatDate(selectedProject.created_at)}
                  </p>
                  {selectedProject.paid_at && (
                    <p style={{ margin: '0.5rem 0' }}>
                      <strong>Pagado:</strong> {formatDate(selectedProject.paid_at)}
                    </p>
                  )}
                </div>

                <h4>Detalles de Bandejas</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th style={{ border: '1px solid #ddd', padding: '0.5rem', textAlign: 'left' }}>Bandeja</th>
                      <th style={{ border: '1px solid #ddd', padding: '0.5rem', textAlign: 'right' }}>Peso</th>
                      <th style={{ border: '1px solid #ddd', padding: '0.5rem', textAlign: 'right' }}>Tiempo</th>
                      <th style={{ border: '1px solid #ddd', padding: '0.5rem', textAlign: 'left' }}>Material</th>
                      <th style={{ border: '1px solid #ddd', padding: '0.5rem', textAlign: 'right' }}>Costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProject.details?.map((detail, i) => (
                      <tr key={i}>
                        <td style={{ border: '1px solid #ddd', padding: '0.5rem' }}>
                          {detail.tray_name}
                        </td>
                        <td style={{ border: '1px solid #ddd', padding: '0.5rem', textAlign: 'right' }}>
                          {detail.weight_g} g
                        </td>
                        <td style={{ border: '1px solid #ddd', padding: '0.5rem', textAlign: 'right' }}>
                          {detail.time_hours.toFixed(2)} h
                        </td>
                        <td style={{ border: '1px solid #ddd', padding: '0.5rem' }}>
                          {detail.material}
                        </td>
                        <td style={{ border: '1px solid #ddd', padding: '0.5rem', textAlign: 'right' }}>
                          ${detail.cost.toLocaleString('es-CL')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedProject.status !== 'paid' && (
                    <button
                      className="btn-dark"
                      onClick={() => handleMarkAsPaid(selectedProject.id)}
                      style={{ backgroundColor: '#4CAF50' }}
                    >
                      ✅ Marcar como Pagado
                    </button>
                  )}
                  <button
                    className="btn-dark"
                    onClick={() => handleDeleteProject(selectedProject.id)}
                    style={{ backgroundColor: '#f44336' }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <button className="btn-white" onClick={() => window.history.back()}>
          Volver
        </button>
      </div>
    </div>
  );
}
