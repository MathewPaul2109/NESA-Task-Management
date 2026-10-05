import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../features/auth/authSlice';
import { LogOut, User, Menu } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = ({ onMenuToggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const onLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
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

      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100 opacity-100">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="bg-red-100 text-red-600 p-3 rounded-full mb-4">
                <LogOut className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Leave?</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to log out of your account? You will need to log back in to access your tasks.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
