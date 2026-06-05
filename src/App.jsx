import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Settings from './components/Settings';
import MultiStepForm from './components/MultiStepForm';
import SavedProjects from './components/SavedProjects';
import ProjectDetail from './components/ProjectDetail';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminUsers from './components/AdminUsers';
import Home from './components/Home';
import DashboardLayout from './components/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { useConfig } from './hooks/useConfig';

export default function App() {
  const [config, setConfig, saveConfig] = useConfig();

  return (
    <AuthProvider>
      <Router basename="/3d-print">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Dashboard Routes - Require dashboard access */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute 
                requiresDashboardAccess={true}
                element={
                  <DashboardLayout>
                    <Home />
                  </DashboardLayout>
                } 
              />
            } 
          />
          
          {/* Calculator Route - Open to all authenticated users */}
          <Route 
            path="/calculator" 
            element={
              <ProtectedRoute 
                element={
                  <DashboardLayout>
                    <MultiStepForm config={config} />
                  </DashboardLayout>
                } 
              />
            } 
          />
          
          {/* Admin Routes - Only for super admins */}
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute 
                requiresDashboardAccess={true}
                element={
                  <DashboardLayout>
                    <AdminUsers />
                  </DashboardLayout>
                } 
              />
            } 
          />
          
          {/* Saved Projects Route - Require dashboard access */}
          <Route 
            path="/saved-projects" 
            element={
              <ProtectedRoute 
                requiresDashboardAccess={true}
                element={
                  <DashboardLayout>
                    <SavedProjects />
                  </DashboardLayout>
                } 
              />
            } 
          />
          
          {/* Settings Route - Require dashboard access */}
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute 
                requiresDashboardAccess={true}
                element={
                  <DashboardLayout>
                    <Settings config={config} setConfig={setConfig} saveConfig={saveConfig} />
                  </DashboardLayout>
                } 
              />
            } 
          />
          
          {/* Project Detail Route - Require dashboard access */}
          <Route
            path="/project/:id"
            element={
              <ProtectedRoute
                requiresDashboardAccess={true}
                element={
                  <DashboardLayout>
                    <ProjectDetail />
                  </DashboardLayout>
                }
              />
            }
          />

          {/* Redirect old paths */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}