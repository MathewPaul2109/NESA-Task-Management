import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTasks, updateTask } from '../../features/tasks/taskSlice';
import { CheckCircle2, Clock, AlertTriangle, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import TaskModal from './TaskModal';
import Pagination from '../../components/Pagination';

const MyTasks = () => {
  const dispatch = useDispatch();
  const { items: tasks, isLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(getTasks({ page: 1, limit: 1000 }));
  }, [dispatch]);

  const myTasks = (tasks || [])
    .filter(t =>
      t && t.assignedTo && t.assignedTo.some(a => a._id === user?._id || a === user?._id)
    )
    .filter(t => t.status !== 'Done') // Filter out done tasks by default
    .filter(t =>
      t.title.toLowerCase().includes(searchInput.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchInput.toLowerCase())
    )
    .filter(t => (statusFilter ? t.status === statusFilter : true))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const paginatedTasks = myTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getDueDateStatus = (dueDate, status) => {
    if (!dueDate || status === 'Done') return null;
    const diffMs = new Date(dueDate) - new Date();
    if (diffMs < 0) return 'overdue';
    if (diffMs / (1000 * 60 * 60) <= 24) return 'due-soon';
    return null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Review': return 'bg-amber-100 text-amber-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  const openModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Tasks</h2>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 outline-none w-full"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-48"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="text-center text-gray-500 py-8">Loading tasks...</div>
      ) : myTasks.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p>No tasks assigned to you yet. Great job!</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Task Title</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Project</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Priority</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedTasks.map(task => {
                      const dueDateStatus = getDueDateStatus(task.dueDate, task.status);
                      return (
                        <tr
                          key={task._id}
                          onClick={() => openModal(task)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-800 line-clamp-1">{task.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-1">{task.description?.replace(/<[^>]*>?/gm, '')}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{task.project?.title || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {dueDateStatus && (
                                <>
                                  {dueDateStatus === 'overdue' ? (
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                  ) : (
                                    <Clock className="h-4 w-4 text-amber-600" />
                                  )}
                                </>
                              )}
                              <span className={dueDateStatus === 'overdue' ? 'text-red-600 font-medium' : dueDateStatus === 'due-soon' ? 'text-amber-600 font-medium' : 'text-gray-600'}>
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {myTasks.length > itemsPerPage && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(myTasks.length / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
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

export default MyTasks;
