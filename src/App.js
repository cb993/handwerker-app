import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import ProjectList from './pages/Projects/ProjectList';
import ProjectDetail from './pages/Projects/ProjectDetail';
import ProjectCreate from './pages/Projects/ProjectCreate';
import ConstructionDiary from './pages/ConstructionDiary/ConstructionDiary';
import TimeTracking from './pages/TimeTracking/TimeTracking';
import EmployeeManagement from './pages/Employees/EmployeeManagement';
import Forms from './pages/Forms/Forms';
import Profile from './pages/Profile/Profile';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public route component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/new" element={<ProjectCreate />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="projects/:id/diary" element={<ConstructionDiary />} />
            <Route path="projects/:id/forms" element={<Forms />} />
            <Route path="time-tracking" element={<TimeTracking />} />
            <Route path="employees" element={<EmployeeManagement />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
