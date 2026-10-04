import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../features/auth/authSlice';
import { LogOut, User, Menu } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = ({ onMenuToggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    toast((t) => (
      <div>
        <p className="mb-3 font-medium text-gray-800">Are you sure you want to log out?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              dispatch(logout());
              dispatch(reset());
              navigate('/login');
            }}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center' });
  };

  return (
    <nav className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 shadow-sm z-30 relative">
      <div className="flex items-center gap-3">
        {user && (
          <button 
            onClick={onMenuToggle}
            className="md:hidden p-1 text-gray-600 hover:text-blue-600 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
        <h1 className="text-lg md:text-xl font-bold text-blue-600">NESA Task System</h1>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        {user && (
          <>
            <div 
              className="flex items-center text-gray-700 bg-gray-100 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm cursor-pointer hover:bg-gray-200 transition-colors"
              title={`${user.name} (${user.role})`}
              onClick={() => toast(`Logged in as ${user.name} (${user.role})`, { icon: '👤', position: 'top-center' })}
            >
              <User className="h-4 w-4 md:mr-2" />
              <span className="font-medium mr-1 hidden sm:inline">{user.name}</span>
              <span className="text-gray-500 hidden sm:inline">({user.role})</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors ml-1 p-1"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
