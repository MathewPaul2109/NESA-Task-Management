import React from 'react';
import { X, Clock, User as UserIcon } from 'lucide-react';
import { useSelector } from 'react-redux';

const ProjectTasksModal = ({ isOpen, onClose, project }) => {
  const { tasks } = useSelector((state) => state.tasks || { tasks: [] });
  
  if (!isOpen || !project) return null;

  // Filter tasks for this project that are NOT 'Done'
  const pendingTasks = tasks.filter(t => 
    (t.project?._id || t.project) === project._id && t.status !== 'Done'
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{project.title} - Pending Tasks</h2>
            <p className="text-sm text-gray-500 mt-1">Tasks left to do and their assignees</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {pendingTasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              All tasks are completed for this project! 🎉
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTasks.map(task => (
                <div key={task._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{task.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      task.status === 'Review' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-50 pt-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="font-medium mb-1">Assigned To:</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {task.assignedTo && task.assignedTo.length > 0 ? (
                          task.assignedTo.map(user => (
                            <div key={user._id || user} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                              <UserIcon className="h-3 w-3" />
                              <span>{user.name || 'Unknown User'}</span>
                            </div>
                          ))
                        ) : (
                          <span className="italic">Unassigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectTasksModal;
