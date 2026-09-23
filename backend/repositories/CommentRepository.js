const Comment = require('../models/Comment');

class CommentRepository {
  async findCommentsByTaskId(taskId) {
    return await Comment.find({ task: taskId })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });
  }

  async findCommentsByProjectId(projectId) {
    return await Comment.find({ project: projectId })
      .populate('author', 'name email')
      .populate('task', 'title')
      .sort({ createdAt: 1 });
  }

  async createComment(commentData) {
    const comment = new Comment(commentData);
    return await comment.save();
  }
}

module.exports = new CommentRepository();
