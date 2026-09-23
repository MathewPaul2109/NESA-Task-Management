import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import UserDashboard from './pages/user/UserDashboard';
import UserProjects from './pages/user/UserProjects';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Routes */}
        <Route element={<PrivateRoute allowedRoles={['Admin', 'Project Manager']} />}>
          <Route element={<Layout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>
        
        <Route element={<PrivateRoute allowedRoles={['Admin']} />}>
          <Route element={<Layout />}>
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>

        {/* User / PM Routes */}
        <Route element={<PrivateRoute allowedRoles={['User', 'Project Manager']} />}>
          <Route element={<Layout />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/tasks" element={<UserDashboard />} />
            <Route path="/user/projects" element={<UserProjects />} />
          </Route>
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
