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
      author: req.user._id,
      content,
    });

    const createdComment = await comment.save();
    
    // Populate author before broadcasting
    await createdComment.populate('author', 'name email');

    // Emit real-time event
    req.io.emit(`new_comment_${req.params.taskId}`, createdComment);

    res.status(201).json(createdComment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getComments,
  addComment
};
