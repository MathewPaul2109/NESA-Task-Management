import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderGit2, Users, Settings } from 'lucide-react';

const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-full flex flex-col shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/admin/dashboard" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          <LayoutDashboard className="h-5 w-5" />
          <span className="font-medium">Dashboard</span>
        </NavLink>
        <NavLink to="/admin/projects" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          <FolderGit2 className="h-5 w-5" />
          <span className="font-medium">Projects</span>
        </NavLink>
        <NavLink to="/admin/users" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
          <Users className="h-5 w-5" />
          <span className="font-medium">Users</span>
        </NavLink>
      </nav>
      <div className="p-4 border-t border-gray-100">
        <a href="#settings" className="flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-gray-800 transition">
          <Settings className="h-5 w-5" />
          <span className="font-medium">Settings</span>
        </a>
      </div>
    </aside>
  );
};

export default AdminSidebar;
