const Task = require('../models/Task');

class TaskRepository {
  async findTasks(query) {
    return await Task.find(query)
      .populate('project', 'title')
      .populate('assignedTo', 'name email');
  }

  async findTaskById(id) {
    return await Task.findById(id);
  }

  async findTasksByProjectId(projectId) {
    return await Task.find({ project: projectId }).select('assignedTo');
  }

  async findTasksAssignedToUser(userId) {
    return await Task.find({ assignedTo: userId }).select('project');
  }

  async createTask(taskData) {
    const task = new Task(taskData);
    return await task.save();
  }

  async updateTask(task) {
    return await task.save();
  }

  async deleteTask(task) {
    return await task.deleteOne();
  }
}

module.exports = new TaskRepository();
