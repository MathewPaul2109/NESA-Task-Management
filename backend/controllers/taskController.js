const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all tasks (optionally filtered by project)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    let query = {};

    if (projectId) {
      query.project = projectId;
    }

    if (req.user.role === 'User') {
      // User can see tasks for projects they are a member of
      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = userProjects.map(p => p._id);

      if (projectId) {
        if (!projectIds.some(id => id.toString() === projectId.toString())) {
          return res.status(403).json({ message: 'Not authorized for this project' });
        }
      } else {
        query.project = { $in: projectIds };
      }
    }

    const tasks = await Task.find(query).populate('project', 'title').populate('assignedTo', 'name email');
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
    const { title, description, project, assignedTo, priority, dueDate } = req.body;
    
    // Verify project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = new Task({
      title,
      description,
      project,
      assignedTo,
      priority,
      dueDate
    });

    const createdTask = await task.save();

    // Broadcast new task
    req.io.emit('task_created', createdTask);

    // Send email to assignees
    if (assignedTo && assignedTo.length > 0) {
      for (const assigneeId of assignedTo) {
        const user = await User.findById(assigneeId);
        if (user && user.email) {
          const message = `You have been assigned a new task: ${title}\n\nDescription: ${description}`;
          try {
            await sendEmail({
              email: user.email,
              subject: 'New Task Assignment',
              message,
            });
          } catch (err) {
            console.error('Error sending email to ' + user.email + ':', err);
          }
        }
      }
    }

    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status, priority, dueDate } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization: User can only update status if they are in the assignedTo array
    if (req.user.role === 'User' && !task.assignedTo.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Admin/PM can update everything. User typically only status.
    if (req.user.role === 'User') {
      task.status = status || task.status;
    } else {
      task.title = title || task.title;
      task.description = description || task.description;
      task.assignedTo = assignedTo || task.assignedTo;
      task.status = status || task.status;
      task.priority = priority || task.priority;
      task.dueDate = dueDate || task.dueDate;
    }

    const updatedTask = await task.save();

    // Broadcast task update
    req.io.emit('task_updated', updatedTask);

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin, PM)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task) {
      await task.deleteOne();
      res.json({ message: 'Task removed' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
