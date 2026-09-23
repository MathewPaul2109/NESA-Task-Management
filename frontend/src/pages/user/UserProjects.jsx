import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProjects } from '../../features/projects/projectSlice';
import { FolderGit2, Users } from 'lucide-react';

const UserProjects = () => {
  const dispatch = useDispatch();
  const { projects, isLoading } = useSelector((state) => state.projects);

  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">My Projects</h2>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">You are not assigned to any projects yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                  <FolderGit2 className="h-6 w-6" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === 'Active' ? 'bg-green-100 text-green-700' :
                  project.status === 'On Hold' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {project.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{project.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-3 mb-4 h-12">
                {project.description}
              </p>
              <div className="flex items-center text-sm text-gray-600 pt-4 border-t border-gray-100">
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                <span>{project.members?.length || 0} Team Members</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProjects;
