import { useNavigate, useLocation } from 'react-router-dom'
import { MdHome, MdDescription, MdFolderOpen, MdAssessment, MdClose, MdMenu } from 'react-icons/md'
import '../styles/sidebar.css'

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const menuItems = [
    { path: '/dashboard', label: 'Home', icon: MdHome },
    { path: '/calculator', label: 'Cotizaciones', icon: MdDescription },
    { path: '/saved-projects', label: 'Proyectos', icon: MdFolderOpen },
    { path: '/reports', label: 'Reportes', icon: MdAssessment },
  ]

  const handleNavigate = (path) => {
    navigate(path)
    onClose()
  }

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="sidebar-close" onClick={onClose}>
            <MdClose size={24} />
          </button>
          <h2>
            <MdMenu size={24} style={{ display: 'inline-block', marginRight: '0.5rem', verticalAlign: 'middle' }} />
          </h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            return (
              <button
                key={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => handleNavigate(item.path)}
                title={item.label}
              >
                <IconComponent size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="version">v1.0.0</div>
        </div>
      </aside>
    </>
  )
}
