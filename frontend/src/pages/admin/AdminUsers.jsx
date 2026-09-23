import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTasks } from '../../features/tasks/taskSlice';
import api from '../../services/api';
import { User, Mail, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { tasks } = useSelector((state) => state.tasks || { tasks: [] });
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    dispatch(getTasks());

    const fetchUsers = async () => {
      try {
        const response = await api.get('/auth/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [dispatch]);

  // Helper to get tasks for a specific user
  const getUserTasks = (userId) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    return tasks.filter(t => t.assignedTo?.some(assignee => assignee._id === userId));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <p className="text-gray-500 mt-1">Overview of all registered users and their assigned tasks</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Assigned Tasks</th>
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
                users.map(user => {
                  const userTasks = getUserTasks(user._id);
                  const completedTasks = userTasks.filter(t => t.status === 'Completed').length;
                  const activeTasks = userTasks.length - completedTasks;
                  
                  return (
                    <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50 align-top transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-500">ID: {user._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'Project Manager' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role}
                        </span>
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
                                <li key={task._id} className="text-sm flex items-start gap-2">
                                  <span className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${task.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                                  <span className={task.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-700'}>
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
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
