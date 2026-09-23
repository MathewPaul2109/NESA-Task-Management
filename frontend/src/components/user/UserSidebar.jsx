import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, FolderGit2 } from 'lucide-react';

const UserSidebar = () => {
  return (
    <aside className="w-64 bg-slate-800 text-slate-300 min-h-full flex flex-col shadow-inner border-r border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">User Portal</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/user/dashboard" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md transition ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 hover:text-white'}`}>
          <LayoutDashboard className="h-5 w-5" />
          <span className="font-medium">Dashboard</span>
        </NavLink>
        <NavLink to="/user/tasks" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md transition ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 hover:text-white'}`}>
          <CheckSquare className="h-5 w-5" />
          <span className="font-medium">My Tasks</span>
        </NavLink>
        <NavLink to="/user/projects" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md transition ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 hover:text-white'}`}>
          <FolderGit2 className="h-5 w-5" />
          <span className="font-medium">My Projects</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default UserSidebar;
