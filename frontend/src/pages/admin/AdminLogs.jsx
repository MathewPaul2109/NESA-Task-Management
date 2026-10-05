import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Activity, Clock, ShieldAlert, FolderGit2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../components/Pagination';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalLogsPages, setTotalLogsPages] = useState(0);
  const [users, setUsers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

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
    const fetchData = async () => {
      try {
        const [logsRes, archivedUsersRes, activeUsersRes] = await Promise.all([
          api.get('/logs', { params: { page: currentPage, limit: itemsPerPage, search: debouncedSearch } }),
          api.get('/auth/users?archived=true'),
          api.get('/auth/users?archived=false'),
        ]);

        const userMap = {};
        [...(archivedUsersRes.data.users || archivedUsersRes.data), ...( activeUsersRes.data.users || activeUsersRes.data)].forEach(u => {
          userMap[u._id] = u.name;
        });

        setUsers(userMap);
        setLogs(logsRes.data.logs || []);
        setTotalLogs(logsRes.data.total || 0);
        setTotalLogsPages(logsRes.data.totalPages || 0);
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentPage, debouncedSearch]);

  const getActionIcon = (action) => {
    if (action.includes('PROJECT')) return <FolderGit2 className="h-4 w-4 text-purple-500" />;
    if (action.includes('ROLE')) return <ShieldAlert className="h-4 w-4 text-red-500" />;
    if (action.includes('TASK')) return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const formatActionName = (action) => {
    return action.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  const formatDetails = (details) => {
    if (!details) return null;
    if (typeof details === 'string') return details;
    try {
        return Object.entries(details)
          .filter(([key]) => {
            // Hide targetUserId only if we have targetUserName directly in details
            if (key === 'targetUserId' && details.targetUserName) return false;
            if (key === 'targetUserId' && details.newName) return false;
            return true;
          })
          .map(([key, value]) => {
            let formattedValue = value;
            let formattedKey = key;
            
            // If this is a targetUserId and we found their name in our map, swap it out!
            if (key === 'targetUserId' && users[value]) {
              formattedKey = 'Target User Name';
              formattedValue = users[value];
            } else if (key === 'targetUserId') {
              // Hide ID entirely if we couldn't resolve it and they really want it hidden, 
              // but I will just label it "Target User (ID)"
              formattedKey = 'Target User (ID)';
            }
            // Add spaces before capital letters and capitalize first letter
            if (formattedKey === key) {
              formattedKey = formattedKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            }
            
            // Handle nested objects or arrays simply
            if (typeof formattedValue === 'object' && formattedValue !== null) {
              formattedValue = JSON.stringify(formattedValue);
            }
            
            return `${formattedKey}: ${formattedValue}`;
          })
          .join('\n');
    } catch (e) {
      return JSON.stringify(details, null, 2);
    }
  };

  const filteredLogs = logs.filter(log => {
    const searchLower = debouncedSearch.toLowerCase();
    const actionStr = formatActionName(log.action).toLowerCase();
    const userName = (log.user?.name || 'System').toLowerCase();
    const userEmail = (log.user?.email || '').toLowerCase();
    return actionStr.includes(searchLower) || userName.includes(searchLower) || userEmail.includes(searchLower);
  });

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">System Activity Logs</h2>
          <p className="text-gray-500 mt-1">Audit trail of critical system actions</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Search logs..." 
            className="pl-4 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 outline-none w-full"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-auto max-h-[400px] md:max-h-none md:flex-1">
          <table className="w-full text-left border-collapse text-sm">
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
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-8 text-gray-500">No activity logs recorded yet.</td>
                </tr>
              ) : (
                (() => {
                  return logs.map((log) => (
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
                        <div 
                          className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed line-clamp-2 cursor-help"
                          title={formatDetails(log.details)}
                        >
                          {formatDetails(log.details)}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm italic">No extra details</span>
                      )}
                    </td>
                  </tr>
                ))
                })()
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && filteredLogs.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalLogsPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
