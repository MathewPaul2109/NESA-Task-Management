import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getArchivedTasks, restoreTask } from '../../features/tasks/taskSlice';
import { Archive, User, FolderOpen, RotateCcw, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const priorityStyles = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low:    'bg-green-100 text-green-700',
};

const AdminArchive = () => {
  const dispatch = useDispatch();
  const { archivedTasks, isArchivedLoading } = useSelector((state) => state.tasks);
  
  const [activeTab, setActiveTab] = useState('tasks');
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  useEffect(() => {
    dispatch(getArchivedTasks());
    
    const fetchArchivedUsers = async () => {
      try {
        setIsUsersLoading(true);
        const res = await api.get('/auth/users?archived=true');
        setArchivedUsers(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsUsersLoading(false);
      }
    };
    
    fetchArchivedUsers();
  }, [dispatch]);

  const handleRestore = async (e, taskId, taskTitle) => {
    e.stopPropagation();
    if (!window.confirm(`Restore "${taskTitle}"? It will move back to the active task board.`)) return;
    const result = await dispatch(restoreTask(taskId));
    if (restoreTask.fulfilled.match(result)) {
      toast.success(`"${taskTitle}" restored to active tasks.`);
    } else {
      toast.error(result.payload || 'Failed to restore task.');
    }
  };

  const handleRestoreUser = async (e, userId, userName) => {
    e.stopPropagation();
    if (!window.confirm(`Restore user "${userName}"? They will regain access to the platform.`)) return;
    try {
      await api.put(`/auth/users/${userId}/restore`);
      setArchivedUsers(archivedUsers.filter(u => u._id !== userId));
      toast.success(`User "${userName}" restored.`);
    } catch (error) {
      toast.error('Failed to restore user.');
      console.error(error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
          <Archive className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Archive</h2>
          <p className="text-sm text-gray-500 mt-0.5">Archived tasks and deactivated users.</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`pb-2 font-medium transition ${activeTab === 'tasks' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Archived Tasks
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-2 font-medium transition ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Archived Users
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        {activeTab === 'tasks' && (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-gray-700">Archived Tasks</span>
              <span className="text-sm text-gray-400">
                {isArchivedLoading ? '...' : `${archivedTasks.length} task${archivedTasks.length !== 1 ? 's' : ''}`}
              </span>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                    <th className="p-4 font-medium">Task Title</th>
                    <th className="p-4 font-medium">Project</th>
                    <th className="p-4 font-medium">Assigned To</th>
                    <th className="p-4 font-medium">Priority</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isArchivedLoading ? (
                    <tr><td colSpan="5" className="text-center p-8 text-gray-400">Loading...</td></tr>
                  ) : archivedTasks.length === 0 ? (
                    <tr><td colSpan="5" className="text-center p-12 text-gray-400">No archived tasks found.</td></tr>
                  ) : (
                    archivedTasks.map(task => (
                      <tr key={task._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4"><p className="font-medium text-gray-800">{task.title}</p></td>
                        <td className="p-4"><div className="flex items-center gap-1.5 text-gray-600 text-sm"><FolderOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />{task.project?.title || 'Unknown'}</div></td>
                        <td className="p-4">
                          {task.assignedTo?.length > 0 ? (
                            <div className="flex flex-col gap-1">{task.assignedTo.map(u => <div key={u._id} className="flex items-center gap-1.5 text-sm text-gray-600"><User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />{u.name}</div>)}</div>
                          ) : <span className="text-gray-400 text-sm">Unassigned</span>}
                        </td>
                        <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityStyles[task.priority] || 'bg-gray-100 text-gray-600'}`}>{task.priority}</span></td>
                        <td className="p-4 text-right">
                          <button onClick={(e) => handleRestore(e, task._id, task.title)} className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-800 font-medium transition"><RotateCcw className="h-4 w-4" /> Restore</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-gray-700">Archived Users</span>
              <span className="text-sm text-gray-400">
                {isUsersLoading ? '...' : `${archivedUsers.length} user${archivedUsers.length !== 1 ? 's' : ''}`}
              </span>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isUsersLoading ? (
                    <tr><td colSpan="4" className="text-center p-8 text-gray-400">Loading...</td></tr>
                  ) : archivedUsers.length === 0 ? (
                    <tr><td colSpan="4" className="text-center p-12 text-gray-400">No archived users found.</td></tr>
                  ) : (
                    archivedUsers.map(user => (
                      <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold uppercase">{user.name.charAt(0)}</div>
                            <span className="font-medium text-gray-800">{user.name}</span>
                          </div>
                        </td>
                        <td className="p-4"><div className="flex items-center gap-1.5 text-gray-600 text-sm"><Mail className="h-4 w-4 text-gray-400" />{user.email}</div></td>
                        <td className="p-4"><span className="text-sm text-gray-600">{user.role}</span></td>
                        <td className="p-4 text-right">
                          <button onClick={(e) => handleRestoreUser(e, user._id, user.name)} className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-800 font-medium transition"><RotateCcw className="h-4 w-4" /> Restore</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminArchive;
