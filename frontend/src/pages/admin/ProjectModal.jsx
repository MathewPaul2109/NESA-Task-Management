import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createProject, updateProject } from '../../features/projects/projectSlice';
import api from '../../services/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectModal = ({ isOpen, onClose, editProject }) => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    members: [],
    status: 'Active',
  });

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/auth/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    if (isOpen) {
      fetchUsers();
      if (editProject) {
        setFormData({
          title: editProject.title,
          description: editProject.description,
          members: editProject.members || [],
          status: editProject.status,
        });
      } else {
        setFormData({ title: '', description: '', members: [], status: 'Active' });
      }
    }
  }, [isOpen, editProject]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editProject) {
      dispatch(updateProject({ id: editProject._id, projectData: formData }));
      toast.success('Project updated successfully!');
    } else {
      dispatch(createProject(formData));
      toast.success('Project created successfully!');
    }
    setFormData({ title: '', description: '', members: [], status: 'Active' });
    onClose();
  };

  const handleMemberSelect = (e) => {
    const options = e.target.options;
    const selectedMembers = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedMembers.push(options[i].value);
      }
    }
    setFormData({ ...formData, members: selectedMembers });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{editProject ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
            <input 
              required
              type="text" 
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              required
              rows="2"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Members (Hold Ctrl/Cmd to select multiple)</label>
            <select 
              multiple 
              className="w-full border border-gray-300 rounded-md p-2 h-24 focus:ring-blue-500 focus:border-blue-500 outline-none" 
              value={formData.members} 
              onChange={handleMemberSelect}
            >
              {users.filter(u => u.role !== 'Admin').map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition">
              {editProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
