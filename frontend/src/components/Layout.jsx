import React, { useState } from 'react';
import Navbar from './Navbar';
import AdminSidebar from './admin/AdminSidebar';
import UserSidebar from './user/UserSidebar';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { io } from 'socket.io-client';
import { updateProjectInState } from '../features/projects/projectSlice';

const Layout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    if (!user) return;
    const socket = io('http://localhost:5000');
    socket.on('project_updated', (project) => {
      dispatch(updateProjectInState(project));
    });
    return () => socket.disconnect();
  }, [dispatch, user]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Container */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block absolute md:relative z-40 h-full bg-white shadow-xl md:shadow-none transition-all`}>
          {user?.role === 'Admin' || user?.role === 'Project Manager' ? <AdminSidebar /> : <UserSidebar />}
        </div>
        
        {/* Overlay for mobile when sidebar is open */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
