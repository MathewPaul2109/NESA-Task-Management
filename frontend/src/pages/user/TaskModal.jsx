import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTask } from '../../features/tasks/taskSlice';
import { getComments, addComment, resetComments } from '../../features/comments/commentSlice';
import { X, Send, Paperclip, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const TaskModal = ({ isOpen, onClose, task }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { comments, isLoading: commentsLoading } = useSelector((state) => state.comments);
  
  const [status, setStatus] = useState('To Do');
  const [newComment, setNewComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (task && isOpen) {
      setStatus(task.status);
      setNotes(task.userNotes || '');
      dispatch(getComments(task._id));
    } else {
      dispatch(resetComments());
      setNotes('');
    }
  }, [task, isOpen, dispatch]);

  if (!isOpen || !task) return null;

  const handleNotesUpdate = () => {
    dispatch(updateTask({ id: task._id, taskData: { userNotes: notes } }));
    dispatch(addComment({ taskId: task._id, content: `Updated task notes: ${notes}` }));
    toast.success('Notes saved and comment posted!');
  };

  const handleStatusUpdate = () => {
    dispatch(updateTask({ id: task._id, taskData: { status } }));
    toast.success('Task status updated!');
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      dispatch(addComment({ taskId: task._id, content: newComment }));
      setNewComment('');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const res = await api.post(`/tasks/${task._id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      dispatch(updateTask({ id: task._id, taskData: res.data }));
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      e.target.value = null; // Reset input
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{task.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{task.project?.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Column: Details */}
          <div className="md:w-1/2 p-6 border-r border-gray-100 overflow-y-auto bg-gray-50">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-gray-800 text-sm whitespace-pre-wrap">{task.description}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Details</h3>
              <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Priority:</span>
                  <span className="font-medium text-gray-800">{task.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Due Date:</span>
                  <span className="font-medium text-gray-800">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Attachments</h3>
                <label className="cursor-pointer text-blue-600 hover:text-blue-700 flex items-center gap-1 text-xs font-medium">
                  <Paperclip className="h-3 w-3" />
                  {isUploading ? 'Uploading...' : 'Attach File'}
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                </label>
              </div>
              {task.attachments && task.attachments.length > 0 ? (
                <div className="space-y-2">
                  {task.attachments.map((file, idx) => (
                    <a 
                      key={idx}
                      href={`http://localhost:5000${file.path}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{file.filename}</span>
                      </div>
                      <Download className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic bg-white p-3 rounded border border-gray-100 text-center">No attachments yet.</div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">User Notes</h3>
              <div className="flex flex-col gap-2">
                <textarea 
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-20"
                  placeholder="Add additional details or progress notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <button 
                  onClick={handleNotesUpdate}
                  className="self-end px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition"
                >
                  Save Notes
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Update Status</h3>
              <div className="flex gap-2">
                <select 
                  className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Done">Done</option>
                </select>
                <button 
                  onClick={handleStatusUpdate}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Comments */}
          <div className="md:w-1/2 flex flex-col bg-white overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Comments</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {commentsLoading ? (
                <div className="text-center text-sm text-gray-500">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="text-center text-sm text-gray-500 py-8">No comments yet. Start the conversation!</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-xs text-gray-800">{comment.author?.name || 'Unknown User'}</span>
                      <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handlePostComment} className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!newComment.trim()}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-300 transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaskModal;
