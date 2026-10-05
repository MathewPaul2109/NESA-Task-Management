import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProjects, deleteProject } from '../../features/projects/projectSlice';
import { getTasks, archiveTask } from '../../features/tasks/taskSlice';
import { FolderGit2, Users, CheckCircle2, Plus, MessageSquare, Edit, ListTodo, Search, Archive, BarChart2, Clock, Eye, CircleDot } from 'lucide-react';
import ProjectModal from './ProjectModal';
import AdminTaskModal from './AdminTaskModal';
import ProjectChatDrawer from '../../components/ProjectChatDrawer';
import TaskModal from '../user/TaskModal';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';

const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { items: projects, totalPages: projectTotalPages, isLoading: isProjectsLoading } = useSelector((state) => state.projects);
  const { items: tasks, totalPages: taskTotalPages, isLoading: isTasksLoading } = useSelector((state) => state.tasks);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeChatProject, setActiveChatProject] = useState(null);
  
  const [selectedCompletedTask, setSelectedCompletedTask] = useState(null);
  const [isCompletedTaskModalOpen, setIsCompletedTaskModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [currentProjectPage, setCurrentProjectPage] = useState(1);
  const projectItemsPerPage = 5;

  const [currentTaskPage, setCurrentTaskPage] = useState(1);
  const taskItemsPerPage = 5;

  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [debouncedProjectSearch, setDebouncedProjectSearch] = useState('');
  const [debouncedTaskSearch, setDebouncedTaskSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3 || searchQuery.length === 0) {
        setDebouncedProjectSearch(searchQuery);
        setCurrentProjectPage(1);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    dispatch(getProjects({ search: debouncedProjectSearch, status: statusFilter, page: currentProjectPage, limit: projectItemsPerPage }));
  }, [dispatch, debouncedProjectSearch, statusFilter, currentProjectPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (taskSearchQuery.length >= 3 || taskSearchQuery.length === 0) {
        setDebouncedTaskSearch(taskSearchQuery);
        setCurrentTaskPage(1);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [taskSearchQuery]);

  useEffect(() => {
    dispatch(getTasks({ page: currentTaskPage, limit: taskItemsPerPage }));
  }, [dispatch, currentTaskPage]);

  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;


  // ── Task progress computations ──────────────────────────────────────────────
  const STATUS_CONFIG = [
    { key: 'To Do',      label: 'To Do',       color: 'bg-gray-400',   text: 'text-gray-600',   light: 'bg-gray-100' },
    { key: 'In Progress',label: 'In Progress',  color: 'bg-blue-500',   text: 'text-blue-600',   light: 'bg-blue-50'  },
    { key: 'Review',     label: 'Review',       color: 'bg-amber-400',  text: 'text-amber-600',  light: 'bg-amber-50' },
    { key: 'Done',       label: 'Done',         color: 'bg-green-500',  text: 'text-green-600',  light: 'bg-green-50' },
  ];

  const totalTasks = tasks.length;
  const statusCounts = STATUS_CONFIG.map(s => ({
    ...s,
    count: tasks.filter(t => t.status === s.key).length,
  }));
  const overallDonePercent = totalTasks === 0 ? 0 : Math.round(
    (
      statusCounts.find(s => s.key === 'To Do').count * 0 +
      statusCounts.find(s => s.key === 'In Progress').count * 33 +
      statusCounts.find(s => s.key === 'Review').count * 66 +
      statusCounts.find(s => s.key === 'Done').count * 100
    ) / totalTasks
  );

  const completedTasks = tasks
    .filter(t => t.status === 'Done')
    .filter(t => t.title.toLowerCase().includes(debouncedTaskSearch.toLowerCase()))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const reviewTasks = tasks
    .filter(t => t.status === 'Review')
    .filter(t => t.title.toLowerCase().includes(debouncedTaskSearch.toLowerCase()))
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

  const handleArchiveProject = async (e, projectId, projectTitle) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to archive "${projectTitle}"?`)) return;
    const result = await dispatch(deleteProject(projectId));
    if (deleteProject.fulfilled.match(result)) {
      toast.success(`"${projectTitle}" archived successfully.`);
    } else {
      toast.error(result.payload || 'Failed to archive project.');
    }
  };

  const handleArchiveAllTasks = async () => {
    if (!completedTasks.length) return;
    if (!window.confirm(`Are you sure you want to archive ALL ${completedTasks.length} completed tasks?`)) return;
    
    let successCount = 0;
    toast.loading('Archiving tasks...', { id: 'archiveAll' });
    
    await Promise.all(
      completedTasks.map(async (task) => {
        const result = await dispatch(archiveTask(task._id));
        if (archiveTask.fulfilled.match(result)) successCount++;
      })
    );
    
    toast.success(`Successfully archived ${successCount} tasks.`, { id: 'archiveAll' });
  };

  return (
    <div className="min-h-full flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Admin Overview</h2>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="bg-white border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition flex items-center gap-2 text-sm sm:text-base"
          >
            <Plus className="h-4 w-4" /> Assign Task
          </button>
          <button 
            onClick={() => {
              setProjectToEdit(null);
              setIsProjectModalOpen(true);
            }}
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded shadow hover:bg-blue-700 transition flex items-center gap-2 text-sm sm:text-base"
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

      <div className="grid grid-cols-1 gap-8">

        {/* ── Recent Projects ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="font-semibold text-gray-700 mb-2 sm:mb-0">Recent Projects</span>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-auto"
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
          <div className="overflow-auto max-h-[400px] md:max-h-[500px] min-h-[300px] w-full">
            <table className="w-full min-w-[1000px] text-left border-collapse text-sm table-fixed">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                  <th className="p-4 font-medium w-[25%]">Project Name</th>
                  <th className="p-4 font-medium w-[15%]">Manager</th>
                  <th className="p-4 font-medium w-[10%]">Status</th>
                  <th className="p-4 font-medium w-[10%]">Members</th>
                  <th className="p-4 font-medium w-[15%]">Progress</th>
                  <th className="p-4 font-medium text-right w-[25%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isProjectsLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center p-4 text-gray-500">Loading projects...</td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-4 text-gray-500">No projects found.</td>
                  </tr>
                ) : (
                  (() => {
                    return projects.map(project => {
                      const projectTasks = tasks.filter(t => (t.project?._id || t.project) === project._id);
                      const projTotal = projectTasks.length;
                      const projDone = projectTasks.filter(t => t.status === 'Done').length;
                      const projReview = projectTasks.filter(t => t.status === 'Review').length;
                      const projInProg = projectTasks.filter(t => t.status === 'In Progress').length;
                      const progressPercentage = projTotal === 0 ? 0 : Math.round(
                        (projInProg * 33 + projReview * 66 + projDone * 100) / projTotal
                      );
                      return (
                        <tr key={project._id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="p-4">
                            <div className="font-medium text-gray-800 truncate cursor-help" title={project.title}>
                              {project.title}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-gray-600 break-words line-clamp-2 cursor-help" title={project.manager?.name || 'Unassigned'}>
                              {project.manager?.name || 'Unassigned'}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                              project.status === 'In Progress' ? 'bg-purple-100 text-purple-700' :
                              project.status === 'On Hold'  ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {project.status}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600">{project.members?.length || 0} users</td>
                          <td className="p-4">
                            <div className="w-32">
                              <div className="flex justify-between items-center text-xs text-gray-500 mb-1 font-medium">
                                <span>{projDone}/{projTotal} tasks</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-500 ${
                                    project.status === 'Completed' ? 'bg-green-500' :
                                    project.status === 'In Progress' ? 'bg-purple-500' :
                                    project.status === 'On Hold'  ? 'bg-amber-500' :
                                    'bg-blue-500'
                                  }`}
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => { setProjectToEdit(project); setIsProjectModalOpen(true); }}
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
                              <button
                                onClick={(e) => handleArchiveProject(e, project._id, project.title)}
                                className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 transition font-medium text-sm"
                              >
                                <Archive className="h-4 w-4" /> Archive
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()
                )}
              </tbody>
            </table>
          </div>
          {!isProjectsLoading && projects.length > 0 && (
            <Pagination
              currentPage={currentProjectPage}
              totalPages={projectTotalPages}
              onPageChange={setCurrentProjectPage}
            />
          )}
        </div>

        {/* ── Task Progress Overview ───────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-blue-500" />
              <span className="font-semibold text-gray-700">Task Progress Overview</span>
            </div>
            <span className="text-sm text-gray-400">{totalTasks} total tasks</span>
          </div>

          {isTasksLoading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading tasks...</div>
          ) : totalTasks === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No tasks yet.</div>
          ) : (
            <div className="p-5 flex flex-col gap-6 flex-1 overflow-auto">

              {/* Overall completion */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Overall Completion</span>
                  <span className="text-sm font-bold text-gray-800">{overallDonePercent}%</span>
                </div>
                {/* Completion bar — shows actual weighted % */}
                <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${overallDonePercent}%` }}
                  />
                </div>
                {/* Task distribution bar */}
                <div className="w-full h-1.5 rounded-full overflow-hidden flex mt-1.5">
                  {statusCounts.map(s =>
                    s.count > 0 ? (
                      <div
                        key={s.key}
                        className={`${s.color} h-full transition-all duration-500`}
                        style={{ width: `${(s.count / totalTasks) * 100}%` }}
                        title={`${s.label}: ${s.count}`}
                      />
                    ) : null
                  )}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-2">
                  {statusCounts.map(s => (
                    <div key={s.key} className="flex items-center gap-1.5">
                      <span className={`inline-block w-2.5 h-2.5 rounded-sm ${s.color}`} />
                      <span className="text-xs text-gray-500">{s.label}</span>
                      <span className={`text-xs font-semibold ${s.text}`}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status breakdown cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {statusCounts.map(s => (
                  <div key={s.key} className={`${s.light} rounded-lg p-3 flex flex-col gap-1`}>
                    <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
                    <span className={`text-2xl font-bold ${s.text}`}>{s.count}</span>
                    <span className="text-xs text-gray-400">
                      {Math.round((s.count / totalTasks) * 100)}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Per-project task progress */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FolderGit2 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Progress by Project</span>
                </div>
                <div className="space-y-3">
                  {(() => {
                    const rows = projects
                      .map(project => {
                        const pt = tasks.filter(t => (t.project?._id || t.project) === project._id);
                        const done   = pt.filter(t => t.status === 'Done').length;
                        const inProg = pt.filter(t => t.status === 'In Progress').length;
                        const review = pt.filter(t => t.status === 'Review').length;
                        const todo   = pt.filter(t => t.status === 'To Do').length;
                        const pct    = pt.length === 0 ? 0 : Math.round(
                          (todo * 0 + inProg * 33 + review * 66 + done * 100) / pt.length
                        );
                        return { project, pt, done, inProg, review, todo, pct };
                      })
                      .filter(({ pt }) => pt.length > 0)
                      .sort((a, b) => b.pct - a.pct);

                    if (rows.length === 0) {
                      return <p className="text-xs text-gray-400">No tasks assigned to projects yet.</p>;
                    }

                    return rows.map(({ project, pt, done, inProg, review, todo, pct }) => (
                      <div key={project._id}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              project.status === 'Completed' ? 'bg-green-500' :
                              project.status === 'In Progress' ? 'bg-purple-500' :
                              project.status === 'On Hold'  ? 'bg-amber-400' : 'bg-blue-500'
                            }`} />
                            <span className="text-sm font-medium text-gray-700 truncate">{project.title}</span>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                              {todo   > 0 && <span className="flex items-center gap-0.5"><CircleDot   className="h-3 w-3 text-gray-400"  />{todo}</span>}
                              {inProg > 0 && <span className="flex items-center gap-0.5"><Clock        className="h-3 w-3 text-blue-400"  />{inProg}</span>}
                              {review > 0 && <span className="flex items-center gap-0.5"><Eye          className="h-3 w-3 text-amber-400" />{review}</span>}
                              {done   > 0 && <span className="flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3 text-green-500"/>{done}</span>}
                            </div>
                            <span className="text-xs font-bold text-gray-600 w-8 text-right">{pct}%</span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                          {todo   > 0 && <div className="bg-gray-400  h-full" style={{ width: `${(todo   / pt.length) * 100}%` }} title={`To Do: ${todo}`}         />}
                          {inProg > 0 && <div className="bg-blue-500  h-full" style={{ width: `${(inProg / pt.length) * 100}%` }} title={`In Progress: ${inProg}`}  />}
                          {review > 0 && <div className="bg-amber-400 h-full" style={{ width: `${(review / pt.length) * 100}%` }} title={`Review: ${review}`}       />}
                          {done   > 0 && <div className="bg-green-500 h-full" style={{ width: `${(done   / pt.length) * 100}%` }} title={`Done: ${done}`}           />}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Tasks in Review */}
              {reviewTasks.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-gray-600">
                        Tasks in Review
                        <span className="text-gray-400 font-normal ml-1">({reviewTasks.length})</span>
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {reviewTasks.map(task => (
                      <div
                        key={task._id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-100 cursor-pointer transition-colors group"
                        onClick={() => { setSelectedCompletedTask(task); setIsCompletedTaskModalOpen(true); }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Eye className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{task.title}</p>
                            <p className="text-xs text-gray-400">
                              {task.project?.title || 'Unknown Project'} · {new Date(task.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-amber-600 opacity-0 group-hover:opacity-100 transition">
                          Review &gt;
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed tasks — compact archive list */}
              {completedTasks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-600">
                        Completed Tasks
                        <span className="text-gray-400 font-normal ml-1">({completedTasks.length})</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500 outline-none w-36"
                          value={taskSearchQuery}
                          onChange={(e) => setTaskSearchQuery(e.target.value)}
                        />
                      </div>
                      <button
                        onClick={handleArchiveAllTasks}
                        className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1.5 rounded-md hover:bg-amber-100 transition text-xs font-medium whitespace-nowrap"
                      >
                        <Archive className="h-3.5 w-3.5" /> Archive All
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {completedTasks
                      .map(task => (
                        <div
                          key={task._id}
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-100 cursor-pointer transition-colors group"
                          onClick={() => { setSelectedCompletedTask(task); setIsCompletedTaskModalOpen(true); }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-700 truncate">{task.title}</p>
                              <p className="text-xs text-gray-400">
                                {task.project?.title || 'Unknown Project'} · {new Date(task.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleArchive(e, task._id, task.title)}
                            className="flex-shrink-0 ml-2 text-xs text-amber-600 hover:text-amber-800 font-medium opacity-0 group-hover:opacity-100 transition flex items-center gap-1"
                          >
                            <Archive className="h-3.5 w-3.5" /> Archive
                          </button>
                        </div>
                      ))
                    }
                  </div>
                  {completedTasks.length > taskItemsPerPage && (
                    <Pagination
                      currentPage={currentTaskPage}
                      totalPages={taskTotalPages}
                      onPageChange={setCurrentTaskPage}
                    />
                  )}
                </div>
              )}

            </div>
          )}
        </div>

      </div>
      
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
