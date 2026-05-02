import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import '../styles/dashboard.css'

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="dashboard">
      <Navbar 
        onOpenSidebar={() => setIsSidebarOpen(true)} 
        isSidebarOpen={isSidebarOpen}
      />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  )
}
