import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProjects } from '../../features/projects/projectSlice';
import { getTasks } from '../../features/tasks/taskSlice';
import { FolderGit2, Users, MessageSquare } from 'lucide-react';
import ProjectChatDrawer from '../../components/ProjectChatDrawer';
import ProjectTasksModal from './ProjectTasksModal';

const UserProjects = () => {
  const dispatch = useDispatch();
  const { projects, isLoading: isProjectsLoading } = useSelector((state) => state.projects);
  const { tasks } = useSelector((state) => state.tasks || { tasks: [] });
  const [activeChatProject, setActiveChatProject] = React.useState(null);
  const [activeTasksProject, setActiveTasksProject] = React.useState(null);

  useEffect(() => {
    dispatch(getProjects());
    dispatch(getTasks());
  }, [dispatch]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">My Projects</h2>
      </div>

      {isProjectsLoading ? (
        <div className="text-center text-gray-500">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">You are not assigned to any projects yet.</div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
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
          })}
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
