import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTasks, updateTask } from '../../features/tasks/taskSlice';
import { appendComment } from '../../features/comments/commentSlice';
import { io } from 'socket.io-client';
import { AlertCircle, Clock, AlertTriangle, ListTodo, Loader, CalendarClock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import TaskModal from './TaskModal';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';

// ─── Droppable Column ────────────────────────────────────────────────────────
const DroppableColumn = ({ id, children, label, count }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg p-3 h-full min-h-0 flex flex-col shadow-sm transition-colors ${
        isOver ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-gray-100'
      }`}
    >
      <h3 className="font-semibold text-gray-700 mb-3 text-sm">
        {label} <span className="text-gray-400 text-xs ml-1">({count})</span>
      </h3>
      <div className="flex-1 overflow-y-auto space-y-2">
        {children}
      </div>
    </div>
  );
};

// ─── Draggable Task Card ──────────────────────────────────────────────────────
const DraggableCard = ({ task, onOpen, getDueDateStatus, dispatch }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: { task },
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const dueDateStatus = getDueDateStatus(task.dueDate, task.status);

  const getProgress = (status) => {
    switch (status) {
      case 'To Do':      return 0;
      case 'In Progress': return 50;
      case 'Review':     return 75;
      case 'Done':       return 100;
      default:           return 0;
    }
  };
  const progress = getProgress(task.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-3 rounded shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow relative border-l-4 ${
        isDragging       ? 'opacity-40 shadow-lg' :
        dueDateStatus === 'overdue'   ? 'border-l-red-500' :
        dueDateStatus === 'due-soon'  ? 'border-l-amber-400' :
        'border-l-transparent'
      }`}
    >
      {/* Drag handle area — covers whole card except the status select */}
      <div
        {...listeners}
        {...attributes}
        className="absolute inset-0 rounded cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Clickable content layer sits above the drag handle */}
      <div className="relative z-10" onClick={() => onOpen(task)}>

        {/* Due date warning badge */}
        {dueDateStatus && (
          <div className={`flex items-center gap-1 text-xs font-medium mb-1.5 ${
            dueDateStatus === 'overdue' ? 'text-red-600' : 'text-amber-600'
          }`}>
            {dueDateStatus === 'overdue'
              ? <><AlertTriangle className="h-3 w-3" /> Overdue</>
              : <><Clock className="h-3 w-3" /> Due soon</>
            }
            <span className="ml-1 font-normal opacity-80">
              — {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
        )}

        <h4 className="font-medium text-gray-900 text-sm mb-0.5 break-words">{task.title}</h4>
        <p className="text-xs text-gray-500 line-clamp-2 mb-2 break-words">{task.description}</p>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-400 mb-0.5">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1">
            <div
              className={`h-1 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'} transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className={`px-1.5 py-0.5 rounded-full text-xs ${
            task.priority === 'High'   ? 'bg-red-100 text-red-700' :
            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {task.priority}
          </span>

          {/* Quick status select — stops propagation so drag doesn't fire */}
          <select
            className="border border-gray-200 rounded p-0.5 text-xs text-gray-600 bg-gray-50 outline-none focus:border-blue-300 relative z-20"
            value={task.status}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              dispatch(updateTask({ id: task._id, taskData: { status: e.target.value } }));
            }}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// ─── Overlay Card (shown while dragging) ─────────────────────────────────────
const OverlayCard = ({ task }) => (
  <div className="bg-white p-4 rounded shadow-xl border border-blue-300 border-l-4 border-l-blue-400 w-72 rotate-2 opacity-95 cursor-grabbing">
    <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
    <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
    <span className={`mt-2 inline-block px-2 py-1 rounded-full text-xs ${
      task.priority === 'High'   ? 'bg-red-100 text-red-700' :
      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
      'bg-green-100 text-green-700'
    }`}>
      {task.priority}
    </span>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'];

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { tasks, isLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null); // task being dragged

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require 8px movement before drag starts — prevents accidental drags on clicks
      activationConstraint: { distance: 8 },
    })
  );

  const openModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  useEffect(() => {
    dispatch(getTasks());

    const socket = io('http://localhost:5000');

    socket.on('task_updated', () => dispatch(getTasks()));
    socket.on('task_created', () => dispatch(getTasks()));
    socket.on('new_comment', (comment) => {
      dispatch(appendComment(comment));
      if (comment.author?._id !== user?._id) {
        toast(`New message from ${comment.author?.name || 'someone'}`, { icon: '💬' });
      }
    });

    return () => socket.disconnect();
  }, [dispatch]);

  const myTasks = tasks.filter(t =>
    t.assignedTo?.some(a => a._id === user?._id || a === user?._id)
  );

  const columns = Object.fromEntries(
    COLUMNS.map(status => [status, myTasks.filter(t => t.status === status)])
  );

  const pendingCount = columns['To Do'].length + columns['In Progress'].length;

  // Stat card computations
  const today = new Date();
  const dueTodayCount = myTasks.filter(t => {
    if (!t.dueDate || t.status === 'Done') return false;
    const due = new Date(t.dueDate);
    return due.getFullYear() === today.getFullYear() &&
           due.getMonth()    === today.getMonth()    &&
           due.getDate()     === today.getDate();
  }).length;

  const getDueDateStatus = (dueDate, status) => {
    if (!dueDate || status === 'Done') return null;
    const diffMs = new Date(dueDate) - new Date();
    if (diffMs < 0) return 'overdue';
    if (diffMs / (1000 * 60 * 60) <= 24) return 'due-soon';
    return null;
  };

  const handleDragStart = ({ active }) => {
    const task = myTasks.find(t => t._id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const targetStatus = over.id; // column id === status string
    const task = myTasks.find(t => t._id === active.id);

    if (task && task.status !== targetStatus) {
      dispatch(updateTask({ id: task._id, taskData: { status: targetStatus } }));
      toast.success(`Moved to "${targetStatus}"`);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">My Tasks</h2>
        <p className="text-xs text-gray-400">Drag cards between columns to update status</p>
      </div>

      {!isLoading && pendingCount > 0 && (
        <div className="mb-3 flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-lg shadow-sm">
          <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <p className="text-xs">
            You have <strong className="font-semibold">{pendingCount} pending task{pendingCount > 1 ? 's' : ''}</strong> that {pendingCount > 1 ? 'require' : 'requires'} your attention.
          </p>
        </div>
      )}

      {/* Stat Cards */}
      {!isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <div className="bg-white px-3 py-2.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2.5">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 flex-shrink-0">
              <ListTodo className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Tasks</p>
              <p className="text-xl font-bold text-gray-800">{myTasks.length}</p>
            </div>
          </div>
          <div className="bg-white px-3 py-2.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2.5">
            <div className="bg-amber-100 p-2 rounded-lg text-amber-600 flex-shrink-0">
              <Loader className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">In Progress</p>
              <p className="text-xl font-bold text-gray-800">{columns['In Progress'].length}</p>
            </div>
          </div>
          <div className="bg-white px-3 py-2.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2.5">
            <div className="bg-red-100 p-2 rounded-lg text-red-500 flex-shrink-0">
              <CalendarClock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Due Today</p>
              <p className="text-xl font-bold text-gray-800">{dueTodayCount}</p>
            </div>
          </div>
          <div className="bg-white px-3 py-2.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2.5">
            <div className="bg-green-100 p-2 rounded-lg text-green-600 flex-shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Completed</p>
              <p className="text-xl font-bold text-gray-800">{columns['Done'].length}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center text-gray-500">Loading tasks...</div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 min-h-0 lg:overflow-hidden pb-4">
            {COLUMNS.map(status => (
              <DroppableColumn
                key={status}
                id={status}
                label={status}
                count={columns[status].length}
              >
                {columns[status].map(task => (
                  <DraggableCard
                    key={task._id}
                    task={task}
                    onOpen={openModal}
                    getDueDateStatus={getDueDateStatus}
                    dispatch={dispatch}
                  />
                ))}
              </DroppableColumn>
            ))}
          </div>

          {/* Ghost card shown under the cursor while dragging */}
          <DragOverlay>
            {activeTask ? <OverlayCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
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
