import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProjectComments, addProjectComment, appendComment, resetComments } from '../features/comments/commentSlice';
import { X, Send, MessageSquare } from 'lucide-react';
import { io } from 'socket.io-client';

const ProjectChatDrawer = ({ isOpen, onClose, project }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { comments, isLoading } = useSelector((state) => state.comments);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && project) {
      dispatch(getProjectComments(project._id));
      
      const socket = io('http://localhost:5000');
      socket.on(`new_project_message_${project._id}`, (message) => {
        dispatch(appendComment(message));
      });

      return () => {
        socket.disconnect();
      };
    } else {
      dispatch(resetComments());
    }
  }, [isOpen, project, dispatch]);

  useEffect(() => {
    // Scroll to bottom when comments change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      dispatch(addProjectComment({ projectId: project._id, content: newMessage }));
      setNewMessage('');
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 line-clamp-1">{project.title}</h2>
              <p className="text-xs text-gray-500">Project Chat</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {isLoading ? (
            <div className="text-center text-sm text-gray-500 mt-10">Loading messages...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-sm text-gray-500 mt-10">
              No messages yet. Start the conversation!
            </div>
          ) : (
            comments.map((comment) => {
              const isMine = comment.author?._id === user?._id;
              
              return (
                <div key={comment._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-700">
                      {isMine ? 'You' : comment.author?.name || 'Unknown User'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className={`max-w-[85%] rounded-2xl p-3 ${
                    isMine ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                    {/* "Forwarded" Task Reference Block */}
                    {comment.task && (
                      <div className={`mb-2 p-2 rounded text-xs border-l-2 ${
                        isMine ? 'bg-blue-700/50 border-blue-300 text-blue-50' : 'bg-gray-200 border-gray-400 text-gray-600'
                      }`}>
                        <div className="font-semibold mb-0.5">Re: Task</div>
                        <div className="line-clamp-1 italic">{comment.task.title}</div>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-300 transition shrink-0"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectChatDrawer;
