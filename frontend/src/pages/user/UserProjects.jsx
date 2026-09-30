import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProjects } from '../../features/projects/projectSlice';
import { getTasks } from '../../features/tasks/taskSlice';
import { FolderGit2, Users, MessageSquare } from 'lucide-react';
import ProjectChatDrawer from '../../components/ProjectChatDrawer';
import ProjectTasksModal from './ProjectTasksModal';
import Pagination from '../../components/Pagination';

const UserProjects = () => {
  const dispatch = useDispatch();
  const { projects, isLoading: isProjectsLoading } = useSelector((state) => state.projects);
  const { tasks } = useSelector((state) => state.tasks || { tasks: [] });
  const [activeChatProject, setActiveChatProject] = React.useState(null);
  const [activeTasksProject, setActiveTasksProject] = React.useState(null);

  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  const [searchInput, setSearchInput] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

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
    dispatch(getProjects());
    dispatch(getTasks());
  }, [dispatch]);

  const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(debouncedSearch.toLowerCase()));

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">My Projects</h2>
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="pl-4 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 outline-none w-full"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {isProjectsLoading ? (
        <div className="text-center text-gray-500">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">You are not assigned to any projects yet.</div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 pb-6 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {(() => {
            const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
            return paginatedProjects.map(project => {
            const projectTasks = tasks.filter(t => (t.project?._id || t.project) === project._id);
            const totalTasks = projectTasks.length;
            const completedTasks = projectTasks.filter(t => t.status === 'Done').length;
            const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

            return (
            <div 
              key={project._id} 
              onClick={() => setActiveTasksProject(project)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                  <FolderGit2 className="h-6 w-6" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  project.status === 'On Hold' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {project.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{project.title}</h3>
              <div
                className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
              
              {/* Progress Bar Section */}
              <div className="mb-4">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1.5 font-medium">
                  <span>Task Progress</span>
                  <span>{completedTasks}/{totalTasks}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      project.status === 'Completed' ? 'bg-green-500' :
                      project.status === 'On Hold' ? 'bg-amber-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-100 mt-auto">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{project.members?.length || 0} Team Members</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveChatProject(project); }}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition font-medium"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </button>
              </div>
            </div>
            );
          })
          })()}
          </div>
          <div className="mt-auto">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredProjects.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}
      <ProjectChatDrawer 
        isOpen={!!activeChatProject} 
        onClose={() => setActiveChatProject(null)} 
        project={activeChatProject} 
      />
      <ProjectTasksModal 
        isOpen={!!activeTasksProject} 
        onClose={() => setActiveTasksProject(null)} 
        project={activeTasksProject} 
      />
    </div>
  );
};

export default UserProjects;
