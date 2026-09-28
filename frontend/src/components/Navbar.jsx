import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../features/auth/authSlice';
import { LogOut, User, Menu } from 'lucide-react';

const Navbar = ({ onMenuToggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
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
            <div className="flex items-center text-gray-700 bg-gray-100 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
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
