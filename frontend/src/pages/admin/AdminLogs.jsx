import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Activity, Clock, ShieldAlert, FolderGit2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/logs');
        setLogs(res.data);
      } catch (error) {
        toast.error('Failed to fetch activity logs');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionIcon = (action) => {
    if (action.includes('PROJECT')) return <FolderGit2 className="h-4 w-4 text-purple-500" />;
    if (action.includes('ROLE')) return <ShieldAlert className="h-4 w-4 text-red-500" />;
    if (action.includes('TASK')) return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const formatActionName = (action) => {
    return action.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">System Activity Logs</h2>
        <p className="text-gray-500 mt-1">Audit trail of critical system actions</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Action</th>
                <th className="p-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="text-center p-8 text-gray-500">Loading logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-8 text-gray-500">No activity logs recorded yet.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase text-xs">
                          {log.user?.name ? log.user.name.charAt(0) : '?'}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-800">{log.user?.name || 'System'}</p>
                          <p className="text-xs text-gray-500">{log.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="font-semibold text-sm text-gray-700">{formatActionName(log.action)}</span>
                      </div>
                    </td>
                    <td className="p-4 align-top max-w-sm">
                      {log.details ? (
                        <div className="bg-gray-100 p-2 rounded text-xs font-mono text-gray-700 whitespace-pre-wrap break-all">
                          {JSON.stringify(log.details, null, 2)}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm italic">No extra details</span>
                      )}
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

export default AdminLogs;
