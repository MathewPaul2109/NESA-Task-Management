import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../features/auth/authSlice';
import { Lock, Mail, User } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { name, email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      alert(message);
    }

    if (isSuccess || user) {
      navigate('/user/dashboard'); // default to user dashboard after reg
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const userData = { name, email, password, role: 'User' }; // Default role
    dispatch(register(userData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2a0845] via-[#1a1a4b] to-[#0a0a3a] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background blur blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600/30 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      
      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-md border border-white/20 p-10 rounded-2xl shadow-2xl relative z-10">
        
        {/* Avatar Icon */}
        <div className="flex justify-center -mt-2 mb-6">
          <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center relative overflow-hidden">
             {/* Diagonal reflection shine effect on avatar */}
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent transform -skew-x-12 opacity-50"></div>
             <User className="w-12 h-12 text-white/70" />
          </div>
        </div>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <div className="space-y-4">
            
            {/* Full Name Input */}
            <div className="flex bg-white/20 rounded-md overflow-hidden relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform -skew-x-12 opacity-50 pointer-events-none"></div>
               <div className="bg-white flex items-center justify-center px-4">
                  <User className="h-5 w-5 text-gray-700" />
               </div>
               <input
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 bg-transparent text-white placeholder-white/70 focus:outline-none focus:ring-0 focus:bg-white/30 transition-colors"
                placeholder="Full Name"
                value={name}
                onChange={onChange}
              />
            </div>

            {/* Email Input */}
            <div className="flex bg-white/20 rounded-md overflow-hidden relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform -skew-x-12 opacity-50 pointer-events-none"></div>
               <div className="bg-white flex items-center justify-center px-4">
                  <Mail className="h-5 w-5 text-gray-700" />
               </div>
               <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-transparent text-white placeholder-white/70 focus:outline-none focus:ring-0 focus:bg-white/30 transition-colors"
                placeholder="Email address"
                value={email}
                onChange={onChange}
              />
            </div>

            {/* Password Input */}
            <div className="flex bg-white/20 rounded-md overflow-hidden relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform -skew-x-12 opacity-50 pointer-events-none"></div>
               <div className="bg-white flex items-center justify-center px-4">
                  <Lock className="h-5 w-5 text-gray-700" />
               </div>
               <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-transparent text-white placeholder-white/70 focus:outline-none focus:ring-0 focus:bg-white/30 transition-colors tracking-widest font-mono"
                placeholder="********"
                value={password}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold tracking-widest uppercase rounded-sm text-white bg-[#06062b] hover:bg-[#0a0a3a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a0a3a] transition-all shadow-lg"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </div>
          <div className="text-sm text-center pt-2">
            <Link to="/login" className="font-medium text-white/70 hover:text-white transition-colors">
              Already have an account? Sign In.
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
