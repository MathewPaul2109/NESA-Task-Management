const TaskService = require('../services/TaskService');

// @desc    Get all tasks (optionally filtered by project)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    const tasks = await TaskService.getTasksForUser(req.user, projectId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private (Admin, PM)
const createTask = async (req, res) => {
  try {
    const task = await TaskService.createTask(req.user, req.body, req.io);
    res.status(201).json(task);
  } catch (error) {
    if (error.message === 'Project not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const updatedTask = await TaskService.updateTask(req.user, req.params.id, req.body, req.io);
    res.json(updatedTask);
  } catch (error) {
    if (error.message === 'Task not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Not authorized to update this task') {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin, PM)
const deleteTask = async (req, res) => {
  try {
    await TaskService.deleteTask(req.user, req.params.id);
    res.json({ message: 'Task removed' });
  } catch (error) {
    if (error.message === 'Task not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Upload file to task
// @route   POST /api/tasks/:id/upload
// @access  Private
const uploadTaskFile = async (req, res) => {
  try {
    const updatedTask = await TaskService.uploadTaskFile(req.params.id, req.file, req.io);
    res.json(updatedTask);
  } catch (error) {
    if (error.message === 'Task not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'No file uploaded') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all archived tasks
// @route   GET /api/tasks/archived
// @access  Private (Admin, PM)
const getArchivedTasks = async (req, res) => {
  try {
    const tasks = await TaskService.getArchivedTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Archive a completed task
// @route   PATCH /api/tasks/:id/archive
// @access  Private (Admin, PM)
const archiveTask = async (req, res) => {
  try {
    const archivedTask = await TaskService.archiveTask(req.user, req.params.id, req.io);
    res.json(archivedTask);
  } catch (error) {
    if (error.message === 'Task not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Only completed tasks can be archived') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  uploadTaskFile,
  archiveTask,
  getArchivedTasks,
};
