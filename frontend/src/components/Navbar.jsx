import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../features/auth/authSlice';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-blue-600">NESA Task System</h1>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="flex items-center text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-sm">
              <User className="h-4 w-4 mr-2" />
              <span className="font-medium mr-1">{user.name}</span>
              <span className="text-gray-500 text-xs">({user.role})</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
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
