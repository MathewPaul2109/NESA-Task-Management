const Comment = require('../models/Comment');
const Task = require('../models/Task');

// @desc    Get comments for a specific task
// @route   GET /api/comments/:taskId
// @access  Private
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add a comment to a task
// @route   POST /api/comments/:taskId
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    // Check if task exists
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = new Comment({
      task: req.params.taskId,
      project: task.project,
      author: req.user._id,
      content,
    });

    const createdComment = await comment.save();
    
    // Populate author and task before broadcasting
    await createdComment.populate('author', 'name email');
    await createdComment.populate('task', 'title');

    // Emit real-time events for both specific task and the project chat
    req.io.emit(`new_comment_${req.params.taskId}`, createdComment);
    req.io.emit(`new_project_message_${task.project}`, createdComment);

    res.status(201).json(createdComment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all comments/messages for a project
// @route   GET /api/comments/project/:projectId
// @access  Private
const getProjectComments = async (req, res) => {
  try {
    const comments = await Comment.find({ project: req.params.projectId })
      .populate('author', 'name email')
      .populate('task', 'title')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add a general comment/message to a project
// @route   POST /api/comments/project/:projectId
// @access  Private
const addProjectComment = async (req, res) => {
  try {
    const { content } = req.body;

    const comment = new Comment({
      project: req.params.projectId,
      author: req.user._id,
      content,
    });

    const createdComment = await comment.save();
    await createdComment.populate('author', 'name email');

    // Emit real-time event for the project chat
    req.io.emit(`new_project_message_${req.params.projectId}`, createdComment);

    res.status(201).json(createdComment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getComments,
  addComment,
  getProjectComments,
  addProjectComment
};
