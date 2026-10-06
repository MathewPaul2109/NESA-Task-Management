import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTasks } from '../../features/tasks/taskSlice';
import api from '../../services/api';
import { Mail, CheckCircle2, Clock, Loader2, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import EditUserModal from './EditUserModal';
import AddUserModal from './AddUserModal';
import Pagination from '../../components/Pagination';
import TaskModal from '../user/TaskModal';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { items: tasks } = useSelector((state) => state.tasks || { items: [] });
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modals state
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.length >= 3 || searchInput.length === 0) {
        setDebouncedSearch(searchInput);
        setCurrentPage(1);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    dispatch(getTasks());

    const fetchUsers = async () => {
      try {
        const response = await api.get('/auth/users', {
          params: { archived: false, page: currentPage, limit: itemsPerPage, search: debouncedSearch }
        });
        setUsers(response.data.users || []);
        setTotalUsers(response.data.total || 0);
        setTotalPages(response.data.totalPages || 0);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [dispatch, currentPage, debouncedSearch, itemsPerPage]);

  const filteredUsers = users;

  // Helper to get tasks for a specific user
  const getUserTasks = (userId) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    return tasks.filter(t => t.assignedTo?.some(assignee => assignee._id === userId));
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingUserId(userId);
      const response = await api.put(`/auth/users/${userId}/role`, { role: newRole });
      if (response.data) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        toast.success('User role updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update role');
      console.error(error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleUpdateUserDetails = async (userId, data) => {
    try {
      const response = await api.put(`/auth/users/${userId}`, data);
      if (response.data) {
        setUsers(users.map(u => u._id === userId ? { ...u, name: data.name, email: data.email } : u));
        toast.success('User details updated');
      }
    } catch (error) {
      toast.error('Failed to update user details');
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to completely remove ${userName}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await api.delete(`/auth/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      toast.success('User removed successfully');
    } catch (error) {
      toast.error('Failed to remove user');
      console.error(error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-gray-500 mt-1">Overview of all registered users and their assigned tasks</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-64"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button 
            onClick={() => setIsAddUserModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition flex items-center gap-2"
          >
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-auto max-h-[400px] md:max-h-none md:flex-1">
          <table className="w-full text-left border-collapse text-sm table-fixed min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-medium w-[22%]">User</th>
                <th className="p-4 font-medium w-[23%]">Contact</th>
                <th className="p-4 font-medium w-[20%]">Role</th>
                <th className="p-4 font-medium w-[35%]">Assigned Tasks</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingUsers ? (
                <tr>
                  <td colSpan="4" className="text-center p-8 text-gray-500">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-8 text-gray-500">No users found.</td>
                </tr>
              ) : (
                (() => {
                  return users.map(user => {
                  const userTasks = getUserTasks(user._id);
                  const completedTasks = userTasks.filter(t => t.status === 'Done').length;
                  const activeTasks = userTasks.length - completedTasks;
                  
                  return (
                    <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50 align-top transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 min-w-0">
                              <p className="font-semibold text-gray-800 truncate cursor-help" title={user.name}>{user.name}</p>
                              <button 
                                onClick={() => { setUserToEdit(user); setIsEditUserModalOpen(true); }}
                                className="text-gray-400 hover:text-blue-600 transition"
                                title="Edit User"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user._id, user.name)}
                                className="text-gray-400 hover:text-red-600 transition"
                                title="Delete User"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm min-w-0">
                          <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate cursor-help" title={user.email}>{user.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="relative inline-block">
                          <select
                            disabled={updatingUserId === user._id}
                            className={`appearance-none outline-none cursor-pointer pr-8 pl-3 py-1.5 rounded-full text-xs font-semibold border ${
                              user.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' :
                              user.role === 'Project Manager' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                              'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                            }`}
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          >
                            <option value="User">User</option>
                            <option value="Project Manager">Project Manager</option>
                            <option value="Admin">Admin</option>
                          </select>
                          {updatingUserId === user._id && (
                            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                              <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {userTasks.length === 0 ? (
                          <span className="text-sm text-gray-400 italic">No tasks assigned</span>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 mb-2 text-xs font-medium">
                              <span className="flex items-center gap-1 text-blue-600"><Clock className="h-3 w-3"/> {activeTasks} Active</span>
                              <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="h-3 w-3"/> {completedTasks} Done</span>
                            </div>
                            <ul className="space-y-1">
                              {userTasks.map(task => (
                                <li 
                                  key={task._id} 
                                  className="text-sm flex items-start gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded transition"
                                  onClick={() => { setSelectedTask(task); setIsTaskModalOpen(true); }}
                                >
                                  <span className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${task.status === 'Done' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                                  <span 
                                    className={`truncate cursor-help block min-w-0 flex-1 ${task.status === 'Done' ? 'line-through text-gray-400' : 'text-gray-700'}`}
                                    title={task.title}
                                  >
                                    {task.title}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
                })()
              )}
            </tbody>
          </table>
        </div>
        {!isLoadingUsers && filteredUsers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            limit={itemsPerPage}
            onLimitChange={setItemsPerPage}
            allowCustomLimit={true}
          />
        )}
      </div>
      
      <EditUserModal 
        isOpen={isEditUserModalOpen} 
        onClose={() => { setIsEditUserModalOpen(false); setUserToEdit(null); }} 
        user={userToEdit} 
        onSave={handleUpdateUserDetails} 
      />

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserAdded={(newUser) => setUsers([...users, newUser])}
      />

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => { setIsTaskModalOpen(false); setSelectedTask(null); }} 
        task={selectedTask} 
      />
    </div>
  );
};

export default AdminUsers;
