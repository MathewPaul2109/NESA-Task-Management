const CommentService = require('../services/CommentService');

// @desc    Get comments for a specific task
// @route   GET /api/comments/:taskId
// @access  Private
const getComments = async (req, res) => {
  try {
    const comments = await CommentService.getComments(req.params.taskId);
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
    const comment = await CommentService.addComment(req.user, req.params.taskId, req.body.content, req.io);
    res.status(201).json(comment);
  } catch (error) {
    if (error.message === 'Task not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all comments/messages for a project
// @route   GET /api/comments/project/:projectId
// @access  Private
const getProjectComments = async (req, res) => {
  try {
    const comments = await CommentService.getProjectComments(req.params.projectId);
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
    const comment = await CommentService.addProjectComment(req.user, req.params.projectId, req.body.content, req.io);
    res.status(201).json(comment);
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
