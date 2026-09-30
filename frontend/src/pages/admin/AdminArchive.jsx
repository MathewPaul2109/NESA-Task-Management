import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getArchivedTasks, restoreTask } from '../../features/tasks/taskSlice';
import { Archive, User, FolderOpen, RotateCcw, Mail, FolderGit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Pagination from '../../components/Pagination';

const priorityStyles = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low:    'bg-green-100 text-green-700',
};

const AdminArchive = () => {
  const dispatch = useDispatch();
  const { archivedTasks, isArchivedLoading } = useSelector((state) => state.tasks);
  
  const [activeTab, setActiveTab] = useState('projects'); // Default to projects tab
  
  const [archivedProjects, setArchivedProjects] = useState([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    setCurrentPage(1);
    setSearchInput('');
    setDebouncedSearch('');
  }, [activeTab]);

  useEffect(() => {
    dispatch(getArchivedTasks());
    
    const fetchArchivedProjects = async () => {
      try {
        setIsProjectsLoading(true);
        const res = await api.get('/projects?archived=true');
        setArchivedProjects(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsProjectsLoading(false);
      }
    };
    
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
    
    fetchArchivedProjects();
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

  const handleRestoreProject = async (e, projectId, projectTitle) => {
    e.stopPropagation();
    if (!window.confirm(`Restore project "${projectTitle}"? It will move back to the active dashboard.`)) return;
    try {
      await api.put(`/projects/${projectId}/restore`);
      setArchivedProjects(archivedProjects.filter(p => p._id !== projectId));
      toast.success(`Project "${projectTitle}" restored.`);
    } catch (error) {
      toast.error('Failed to restore project.');
      console.error(error);
    }
  };

  const handlePermanentDeleteTask = async (e, taskId, taskTitle) => {
    e.stopPropagation();
    if (!window.confirm(`PERMANENTLY delete task "${taskTitle}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      dispatch(getArchivedTasks());
      toast.success(`Task "${taskTitle}" permanently deleted.`);
    } catch (error) {
      toast.error('Failed to permanently delete task.');
      console.error(error);
    }
  };

  const handlePermanentDeleteUser = async (e, userId, userName) => {
    e.stopPropagation();
    if (!window.confirm(`PERMANENTLY delete user "${userName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/auth/users/${userId}/hard`);
      setArchivedUsers(archivedUsers.filter(u => u._id !== userId));
      toast.success(`User "${userName}" permanently deleted.`);
    } catch (error) {
      toast.error('Failed to permanently delete user.');
      console.error(error);
    }
  };

  const handlePermanentDeleteProject = async (e, projectId, projectTitle) => {
    e.stopPropagation();
    if (!window.confirm(`PERMANENTLY delete project "${projectTitle}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/projects/${projectId}/hard`);
      setArchivedProjects(archivedProjects.filter(p => p._id !== projectId));
      toast.success(`Project "${projectTitle}" permanently deleted.`);
    } catch (error) {
      toast.error('Failed to permanently delete project.');
      console.error(error);
    }
  };

  const handleDeleteAllProjects = async () => {
    if (!filteredProjects.length) return;
    if (!window.confirm(`PERMANENTLY delete ALL ${filteredProjects.length} displayed projects? This cannot be undone.`)) return;
    toast.loading('Deleting projects...', { id: 'deleteAll' });
    try {
      await Promise.all(filteredProjects.map(p => api.delete(`/projects/${p._id}/hard`)));
      setArchivedProjects(archivedProjects.filter(p => !filteredProjects.find(fp => fp._id === p._id)));
      toast.success(`Successfully deleted projects.`, { id: 'deleteAll' });
    } catch (error) {
      toast.error('Failed to delete some projects.', { id: 'deleteAll' });
      console.error(error);
    }
  };

  const handleDeleteAllTasks = async () => {
    if (!filteredTasks.length) return;
    if (!window.confirm(`PERMANENTLY delete ALL ${filteredTasks.length} displayed tasks? This cannot be undone.`)) return;
    toast.loading('Deleting tasks...', { id: 'deleteAll' });
    try {
      await Promise.all(filteredTasks.map(t => api.delete(`/tasks/${t._id}`)));
      dispatch(getArchivedTasks());
      toast.success(`Successfully deleted tasks.`, { id: 'deleteAll' });
    } catch (error) {
      toast.error('Failed to delete some tasks.', { id: 'deleteAll' });
      console.error(error);
    }
  };

  const handleDeleteAllUsers = async () => {
    if (!filteredUsers.length) return;
    if (!window.confirm(`PERMANENTLY delete ALL ${filteredUsers.length} displayed users? This cannot be undone.`)) return;
    toast.loading('Deleting users...', { id: 'deleteAll' });
    try {
      await Promise.all(filteredUsers.map(u => api.delete(`/auth/users/${u._id}/hard`)));
      setArchivedUsers(archivedUsers.filter(u => !filteredUsers.find(fu => fu._id === u._id)));
      toast.success(`Successfully deleted users.`, { id: 'deleteAll' });
    } catch (error) {
      toast.error('Failed to delete some users.', { id: 'deleteAll' });
      console.error(error);
    }
  };

  const filteredProjects = archivedProjects.filter(p => p.title.toLowerCase().includes(debouncedSearch.toLowerCase()));
  const filteredTasks = archivedTasks.filter(t => t.title.toLowerCase().includes(debouncedSearch.toLowerCase()));
  const filteredUsers = archivedUsers.filter(u => u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || u.email.toLowerCase().includes(debouncedSearch.toLowerCase()));

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
        <div className="ml-auto relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 outline-none w-full"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('projects')}
          className={`pb-2 font-medium transition ${activeTab === 'projects' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Archived Projects
        </button>
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
        {activeTab === 'projects' && (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-gray-700">Archived Projects</span>
                <span className="text-sm text-gray-400 ml-2">
                  {isProjectsLoading ? '...' : `${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''}`}
                </span>
              </div>
              {filteredProjects.length > 0 && (
                <button
                  onClick={handleDeleteAllProjects}
                  className="inline-flex items-center gap-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md font-medium transition"
                >
                  <Trash2 className="h-4 w-4" /> Delete All
                </button>
              )}
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                    <th className="p-4 font-medium">Project Name</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isProjectsLoading ? (
                    <tr><td colSpan="3" className="text-center p-8 text-gray-400">Loading...</td></tr>
                  ) : archivedProjects.length === 0 ? (
                    <tr><td colSpan="3" className="text-center p-12 text-gray-400">No archived projects found.</td></tr>
                  ) : (
                    (() => {
                      const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                      return paginatedProjects.map(project => (
                      <tr key={project._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                              <FolderGit2 className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-gray-800">{project.title}</span>
                          </div>
                        </td>
                        <td className="p-4"><span className="text-sm text-gray-600">{project.status}</span></td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={(e) => handleRestoreProject(e, project._id, project.title)} className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-800 font-medium transition"><RotateCcw className="h-4 w-4" /> Restore</button>
                            <button onClick={(e) => handlePermanentDeleteProject(e, project._id, project.title)} className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition"><Trash2 className="h-4 w-4" /> Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  })()
                  )}
                </tbody>
              </table>
            </div>
            {!isProjectsLoading && filteredProjects.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredProjects.length / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}

        {activeTab === 'tasks' && (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-gray-700">Archived Tasks</span>
                <span className="text-sm text-gray-400 ml-2">
                  {isArchivedLoading ? '...' : `${filteredTasks.length} task${filteredTasks.length !== 1 ? 's' : ''}`}
                </span>
              </div>
              {filteredTasks.length > 0 && (
                <button
                  onClick={handleDeleteAllTasks}
                  className="inline-flex items-center gap-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md font-medium transition"
                >
                  <Trash2 className="h-4 w-4" /> Delete All
                </button>
              )}
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
                    (() => {
                      const paginatedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                      return paginatedTasks.map(task => (
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
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={(e) => handleRestore(e, task._id, task.title)} className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-800 font-medium transition"><RotateCcw className="h-4 w-4" /> Restore</button>
                            <button onClick={(e) => handlePermanentDeleteTask(e, task._id, task.title)} className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition"><Trash2 className="h-4 w-4" /> Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  })()
                  )}
                </tbody>
              </table>
            </div>
            {!isArchivedLoading && filteredTasks.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredTasks.length / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}

        {activeTab === 'users' && (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-gray-700">Archived Users</span>
                <span className="text-sm text-gray-400 ml-2">
                  {isUsersLoading ? '...' : `${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''}`}
                </span>
              </div>
              {filteredUsers.length > 0 && (
                <button
                  onClick={handleDeleteAllUsers}
                  className="inline-flex items-center gap-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md font-medium transition"
                >
                  <Trash2 className="h-4 w-4" /> Delete All
                </button>
              )}
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
                    (() => {
                      const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                      return paginatedUsers.map(user => (
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
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={(e) => handleRestoreUser(e, user._id, user.name)} className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-800 font-medium transition"><RotateCcw className="h-4 w-4" /> Restore</button>
                            <button onClick={(e) => handlePermanentDeleteUser(e, user._id, user.name)} className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition"><Trash2 className="h-4 w-4" /> Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  })()
                  )}
                </tbody>
              </table>
            </div>
            {!isUsersLoading && filteredUsers.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredUsers.length / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminArchive;
