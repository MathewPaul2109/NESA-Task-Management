const CommentRepository = require('../repositories/CommentRepository');
const TaskRepository = require('../repositories/TaskRepository');

class CommentService {
  async getComments(taskId) {
    return await CommentRepository.findCommentsByTaskId(taskId);
  }

  async addComment(user, taskId, content, io) {
    const task = await TaskRepository.findTaskById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const createdComment = await CommentRepository.createComment({
      task: taskId,
      project: task.project,
      author: user._id,
      content,
    });

    await createdComment.populate('author', 'name email');
    await createdComment.populate('task', 'title');

    io.emit(`new_comment_${taskId}`, createdComment);
    io.emit(`new_project_message_${task.project}`, createdComment);

    return createdComment;
  }

  async getProjectComments(projectId) {
    return await CommentRepository.findCommentsByProjectId(projectId);
  }

  async addProjectComment(user, projectId, content, io) {
    const createdComment = await CommentRepository.createComment({
      project: projectId,
      author: user._id,
      content,
    });

    await createdComment.populate('author', 'name email');
    io.emit(`new_project_message_${projectId}`, createdComment);

    return createdComment;
  }
}

module.exports = new CommentService();
