import React, { useState } from 'react';
import Navbar from './Navbar';
import AdminSidebar from './admin/AdminSidebar';
import UserSidebar from './user/UserSidebar';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  const { user } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Container */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block absolute md:relative z-20 h-full bg-white shadow-xl md:shadow-none transition-all`}>
          {user?.role === 'Admin' || user?.role === 'Project Manager' ? <AdminSidebar /> : <UserSidebar />}
        </div>
        
        {/* Overlay for mobile when sidebar is open */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
