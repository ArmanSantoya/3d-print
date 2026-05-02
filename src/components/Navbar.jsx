import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { MdAdd, MdPerson, MdSettings, MdLogout, MdMenu } from 'react-icons/md'
import '../styles/navbar.css'

export default function Navbar({ onOpenSidebar }) {
  const {  logout, getUserName } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleNewQuote = () => {
    navigate('/calculator')
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button
          className="sidebar-toggle"
          onClick={onOpenSidebar}
          title="Toggle sidebar"
        >
          <MdMenu size={24} />
        </button>
        <img src="/3d-print/logo.jpg" alt="Logo" className="navbar-logo" />
      </div>


      <div className="navbar-right">
        <button 
          className="navbar-btn new-quote-btn"
          onClick={handleNewQuote}
          title="Create new quote"
        >
          <MdAdd size={20} />
          <span className="btn-text">Nueva Cotización</span>
        </button>

        <div className="navbar-divider"></div>

        <button 
          className="navbar-icon-btn"
          title={`User: ${getUserName()}`}
        >
          <MdPerson size={20} />
        </button>

        <button 
          className="navbar-icon-btn"
          onClick={() => navigate('/settings')}
          title="Settings"
        >
          <MdSettings size={20} />
        </button>

        <button 
          className="navbar-icon-btn logout-btn"
          onClick={handleLogout}
          title="Logout"
        >
          <MdLogout size={20} />
        </button>
      </div>
    </nav>
  )
}
