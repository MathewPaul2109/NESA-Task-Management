import React from 'react';
import Navbar from './Navbar';
import AdminSidebar from './admin/AdminSidebar';
import UserSidebar from './user/UserSidebar';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {user?.role === 'Admin' || user?.role === 'Project Manager' ? <AdminSidebar /> : <UserSidebar />}
        <main className="flex-1 overflow-hidden flex flex-col p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
