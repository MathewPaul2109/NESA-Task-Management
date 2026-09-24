import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getArchivedTasks } from '../../features/tasks/taskSlice';
import { Archive, User, FolderOpen } from 'lucide-react';

const priorityStyles = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low:    'bg-green-100 text-green-700',
};

const AdminArchivedTasks = () => {
  const dispatch = useDispatch();
  const { archivedTasks, isArchivedLoading } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(getArchivedTasks());
  }, [dispatch]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
          <Archive className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Archived Tasks</h2>
          <p className="text-sm text-gray-500 mt-0.5">Completed tasks that have been manually archived.</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <span className="font-semibold text-gray-700">All Archived Tasks</span>
          <span className="text-sm text-gray-400">
            {isArchivedLoading ? '...' : `${archivedTasks.length} task${archivedTasks.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Task Title</th>
                <th className="p-4 font-medium">Project</th>
                <th className="p-4 font-medium">Assigned To</th>
                <th className="p-4 font-medium">Priority</th>
                <th className="p-4 font-medium">Archived At</th>
              </tr>
            </thead>
            <tbody>
              {isArchivedLoading ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-gray-400">
                    Loading archived tasks...
                  </td>
                </tr>
              ) : archivedTasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-12">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Archive className="h-10 w-10 opacity-30" />
                      <p className="font-medium">No archived tasks yet</p>
                      <p className="text-sm">Tasks you archive from the dashboard will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                archivedTasks.map(task => (
                  <tr key={task._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-gray-800">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                        <FolderOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        {task.project?.title || 'Unknown Project'}
                      </div>
                    </td>
                    <td className="p-4">
                      {task.assignedTo?.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {task.assignedTo.map(u => (
                            <div key={u._id} className="flex items-center gap-1.5 text-sm text-gray-600">
                              <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                              {u.name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityStyles[task.priority] || 'bg-gray-100 text-gray-600'}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {task.archivedAt ? new Date(task.archivedAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminArchivedTasks;
