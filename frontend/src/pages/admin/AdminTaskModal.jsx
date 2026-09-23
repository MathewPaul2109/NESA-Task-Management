import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask } from '../../features/tasks/taskSlice';
import api from '../../services/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminTaskModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.projects);
  const [users, setUsers] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: [], // Array of User IDs
    priority: 'Medium',
    dueDate: '',
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
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.assignedTo.length === 0) {
      toast.error('Please select at least one user');
      return;
    }
    dispatch(createTask({ ...formData }));
    toast.success('Task assigned successfully!');
    setFormData({ title: '', description: '', project: '', assignedTo: [], priority: 'Medium', dueDate: '' });
    onClose();
  };

  const handleUserSelect = (e) => {
    const options = e.target.options;
    const selectedUsers = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedUsers.push(options[i].value);
      }
    }
    setFormData({ ...formData, assignedTo: selectedUsers });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Assign New Task</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input required type="text" className="w-full border rounded-md p-2" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea required rows="2" className="w-full border rounded-md p-2 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select required className="w-full border rounded-md p-2" value={formData.project} onChange={(e) => setFormData({...formData, project: e.target.value})}>
              <option value="">Select Project</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignees (Hold Ctrl/Cmd to select multiple)</label>
            <select 
              multiple 
              className="w-full border rounded-md p-2 h-24" 
              value={formData.assignedTo} 
              onChange={handleUserSelect}
            >
              {users.filter(u => u.role !== 'Admin').map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select className="w-full border rounded-md p-2" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" className="w-full border rounded-md p-2" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md">Create Task</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTaskModal;
