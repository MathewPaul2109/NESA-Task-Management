import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProjects } from '../../features/projects/projectSlice';
import { getTasks, archiveTask } from '../../features/tasks/taskSlice';
import { FolderGit2, Users, CheckCircle2, Plus, MessageSquare, Edit, ListTodo, Search, Archive } from 'lucide-react';
import ProjectModal from './ProjectModal';
import AdminTaskModal from './AdminTaskModal';
import ProjectChatDrawer from '../../components/ProjectChatDrawer';
import TaskModal from '../user/TaskModal';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { projects, isLoading: isProjectsLoading } = useSelector((state) => state.projects);
  const { tasks, isLoading: isTasksLoading } = useSelector((state) => state.tasks);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeChatProject, setActiveChatProject] = useState(null);
  
  const [selectedCompletedTask, setSelectedCompletedTask] = useState(null);
  const [isCompletedTaskModalOpen, setIsCompletedTaskModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    // Add debouncing for search
    const timer = setTimeout(() => {
      dispatch(getProjects({ search: searchQuery, status: statusFilter }));
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch, searchQuery, statusFilter]);

  useEffect(() => {
    dispatch(getTasks());
  }, [dispatch]);

  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;

  const completedTasks = tasks
    .filter(t => t.status === 'Done')
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const handleArchive = async (e, taskId, taskTitle) => {
    e.stopPropagation();
    if (!window.confirm(`Archive "${taskTitle}"? It will be removed from the board.`)) return;
    const result = await dispatch(archiveTask(taskId));
    if (archiveTask.fulfilled.match(result)) {
      toast.success(`"${taskTitle}" archived successfully.`);
    } else {
      toast.error(result.payload || 'Failed to archive task.');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Admin Overview</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Assign Task
          </button>
          <button 
            onClick={() => {
              setProjectToEdit(null);
              setIsProjectModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <FolderGit2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Projects</p>
            <p className="text-2xl font-bold text-gray-800">{projects.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-lg text-amber-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Active Projects</p>
            <p className="text-2xl font-bold text-gray-800">{activeProjects}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Completed</p>
            <p className="text-2xl font-bold text-gray-800">{completedProjects}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="font-semibold text-gray-700">Recent Projects</span>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 outline-none w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Project Name</th>
                <th className="p-4 font-medium">Manager</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Members</th>
                <th className="p-4 font-medium">Progress</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isProjectsLoading ? (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-gray-500">Loading projects...</td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-gray-500">No projects found.</td>
                </tr>
              ) : (
                projects.map(project => {
                  const projectTasks = tasks.filter(t => (t.project?._id || t.project) === project._id);
                  const totalTasks = projectTasks.length;
                  const completedTasks = projectTasks.filter(t => t.status === 'Done').length;
                  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

                  return (
                  <tr key={project._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">{project.title}</td>
                    <td className="p-4 text-gray-600">{project.manager?.name || 'Unassigned'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        project.status === 'On Hold' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{project.members?.length || 0} users</td>
                    <td className="p-4">
                      <div className="w-32">
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-1 font-medium">
                          <span>{completedTasks}/{totalTasks} tasks</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              project.status === 'Completed' ? 'bg-green-500' :
                              project.status === 'On Hold' ? 'bg-amber-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => {
                            setProjectToEdit(project);
                            setIsProjectModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 transition font-medium text-sm"
                        >
                          <Edit className="h-4 w-4" /> Edit
                        </button>
                        <button 
                          onClick={() => setActiveChatProject(project)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition font-medium text-sm"
                        >
                          <MessageSquare className="h-4 w-4" /> Chat
                        </button>
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Completed Tasks Section */}
      {(isTasksLoading || completedTasks.length > 0) && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 font-semibold text-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-green-500" />
              Completed Tasks
            </div>
            <span className="text-sm font-normal text-gray-500">{completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                  <th className="p-4 font-medium">Task Title</th>
                  <th className="p-4 font-medium">Project</th>
                  <th className="p-4 font-medium">Completed At</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isTasksLoading ? (
                  <tr>
                    <td colSpan="4" className="text-center p-4 text-gray-500">Loading tasks...</td>
                  </tr>
                ) : (
                  completedTasks.map(task => (
                    <tr
                      key={task._id}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedCompletedTask(task);
                        setIsCompletedTaskModalOpen(true);
                      }}
                    >
                      <td className="p-4 font-medium text-gray-800">{task.title}</td>
                      <td className="p-4 text-gray-600">{task.project?.title || 'Unknown Project'}</td>
                      <td className="p-4 text-gray-500 text-sm">{new Date(task.updatedAt).toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => handleArchive(e, task._id, task.title)}
                          className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-800 font-medium transition"
                        >
                          <Archive className="h-4 w-4" /> Archive
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <ProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        editProject={projectToEdit}
      />
      <AdminTaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
      
      <ProjectChatDrawer 
        isOpen={!!activeChatProject} 
        onClose={() => setActiveChatProject(null)} 
        project={activeChatProject} 
      />

      <TaskModal 
        isOpen={isCompletedTaskModalOpen} 
        onClose={() => {
          setIsCompletedTaskModalOpen(false);
          setSelectedCompletedTask(null);
        }} 
        task={selectedCompletedTask} 
      />
    </div>
  );
};

export default AdminDashboard;
