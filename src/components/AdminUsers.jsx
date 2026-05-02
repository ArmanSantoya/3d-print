import { useState, useEffect } from 'react'
import { MdShield, MdPerson, MdCheckCircle, MdCancel } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import { usersApi } from '../utils/database'
import '../styles/admin.css'

export default function AdminUsers() {
  const { user, isSuperAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isSuperAdmin) {
      loadUsers()
    }
  }, [isSuperAdmin])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await usersApi.getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
      setMessage('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = async (userEmail, hasDashboardAccess, isSuperAdmin) => {
    setSaving(prev => ({ ...prev, [userEmail]: true }))
    setMessage('')

    try {
      await usersApi.updateUserPermissions(userEmail, hasDashboardAccess, isSuperAdmin)
      
      // Update local state
      setUsers(users.map(u => 
        u.email === userEmail 
          ? { ...u, has_dashboard_access: hasDashboardAccess, is_super_admin: isSuperAdmin }
          : u
      ))
      
      setMessage('✅ Permisos actualizados exitosamente')
    } catch (error) {
      console.error('Error updating permissions:', error)
      setMessage('❌ Error al actualizar permisos')
    } finally {
      setSaving(prev => ({ ...prev, [userEmail]: false }))
    }
  }

  if (!isSuperAdmin) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
        <p>No tienes permiso para acceder a esta página</p>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>
          <MdShield size={32} />
          Administración de Usuarios
        </h1>
        <p>Gestiona permisos y acceso de usuarios</p>
      </div>

      {message && (
        <div className="admin-message" style={{
          background: message.includes('❌') ? '#ffebee' : '#e8f5e9',
          color: message.includes('❌') ? '#c62828' : '#2e7d32'
        }}>
          {message}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          Cargando usuarios...
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          No hay usuarios registrados
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nombre</th>
                <th>Dashboard Access</th>
                <th>Super Admin</th>
                <th>Acciones</th>
                <th>Fecha de Registro</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userItem) => (
                <tr key={userItem.id} className={userItem.is_super_admin ? 'super-admin-row' : ''}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MdPerson size={18} style={{ color: '#f57c00' }} />
                      <span>{userItem.email}</span>
                    </div>
                  </td>
                  <td>{userItem.full_name || '-'}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      background: userItem.has_dashboard_access ? '#c8e6c9' : '#ffccbc',
                      color: userItem.has_dashboard_access ? '#2e7d32' : '#d84315',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      {userItem.has_dashboard_access ? (
                        <>
                          <MdCheckCircle size={14} />
                          Sí
                        </>
                      ) : (
                        <>
                          <MdCancel size={14} />
                          No
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      background: userItem.is_super_admin ? '#bbdefb' : '#f5f5f5',
                      color: userItem.is_super_admin ? '#1565c0' : '#666',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      {userItem.is_super_admin ? (
                        <>
                          <MdShield size={14} />
                          Sí
                        </>
                      ) : (
                        <>
                          <MdCancel size={14} />
                          No
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <div className="user-actions">
                      <button
                        onClick={() => handlePermissionChange(
                          userItem.email,
                          !userItem.has_dashboard_access,
                          userItem.is_super_admin
                        )}
                        disabled={saving[userItem.email]}
                        className="btn btn-small"
                        title={userItem.has_dashboard_access ? 'Remover acceso' : 'Otorgar acceso'}
                      >
                        {userItem.has_dashboard_access ? 'Remover' : 'Otorgar'} Dashboard
                      </button>

                      {userItem.email !== user.email && (
                        <button
                          onClick={() => handlePermissionChange(
                            userItem.email,
                            userItem.has_dashboard_access,
                            !userItem.is_super_admin
                          )}
                          disabled={saving[userItem.email]}
                          className="btn btn-small"
                          title={userItem.is_super_admin ? 'Remover super admin' : 'Hacer super admin'}
                        >
                          {userItem.is_super_admin ? 'Remover' : 'Hacer'} Super Admin
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <small style={{ color: '#999' }}>
                      {new Date(userItem.created_at).toLocaleDateString('es-AR')}
                    </small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
