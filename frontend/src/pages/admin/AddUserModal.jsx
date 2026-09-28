import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'User' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Create user
      const res = await api.post('/auth/register', formData);
      toast.success('User added successfully');
      onUserAdded(res.data);
      onClose();
      setFormData({ name: '', email: '', password: '', role: 'User' }); // Reset form
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Add New User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              required 
              type="text" 
              className="w-full border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              required 
              type="email" 
              className="w-full border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              required 
              type="password" 
              className="w-full border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select 
              className="w-full border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})} 
            >
              <option value="User">User</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition flex items-center gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
