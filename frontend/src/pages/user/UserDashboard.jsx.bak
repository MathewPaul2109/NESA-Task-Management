import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTasks } from '../../features/tasks/taskSlice';
import { appendComment } from '../../features/comments/commentSlice';
import { io } from 'socket.io-client';
import { AlertCircle } from 'lucide-react';
import TaskModal from './TaskModal';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { tasks, isLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  useEffect(() => {
    dispatch(getTasks());

    // Setup socket connection
    const socket = io('http://localhost:5000');
    
    socket.on('task_updated', (updatedTask) => {
      // Re-fetch tasks when a task updates.
      // In a real large-scale app, we would dispatch a targeted update action instead of re-fetching everything.
      dispatch(getTasks());
    });

    socket.on('task_created', (newTask) => {
      dispatch(getTasks());
    });

    socket.on('new_comment', (comment) => {
      dispatch(appendComment(comment));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  // Kanban Columns Data Structure (Filtered for the current user)
  const myTasks = tasks.filter(t => t.assignedTo?.some(assignee => assignee._id === user?._id || assignee === user?._id));

  const columns = {
    'To Do': myTasks.filter(t => t.status === 'To Do'),
    'In Progress': myTasks.filter(t => t.status === 'In Progress'),
    'Review': myTasks.filter(t => t.status === 'Review'),
    'Done': myTasks.filter(t => t.status === 'Done')
  };

  const pendingCount = columns['To Do'].length + columns['In Progress'].length;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">My Tasks</h2>
      </div>

      {!isLoading && pendingCount > 0 && (
        <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg shadow-sm">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm">
            You have <strong className="font-semibold">{pendingCount} pending task{pendingCount > 1 ? 's' : ''}</strong> that {pendingCount > 1 ? 'require' : 'requires'} your attention.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center text-gray-500">Loading tasks...</div>
      ) : (
        <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
          {Object.entries(columns).map(([status, columnTasks]) => (
            <div key={status} className="bg-gray-100 rounded-lg p-4 w-80 flex-shrink-0 flex flex-col shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4">{status} <span className="text-gray-400 text-sm ml-2">({columnTasks.length})</span></h3>
              <div className="flex-1 overflow-y-auto space-y-3">
                {columnTasks.map(task => (
                  <div 
                    key={task._id} 
                    onClick={() => openModal(task)}
                    className="bg-white p-4 rounded shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{task.description}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        task.priority === 'High' ? 'bg-red-100 text-red-700' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority}
                      </span>
                      {task.project && (
                        <span className="text-gray-400 truncate max-w-[100px]">{task.project.title}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }} 
        task={selectedTask} 
      />
    </div>
  );
};

export default UserDashboard;
