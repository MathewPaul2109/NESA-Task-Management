const Task = require('../models/Task');

class TaskRepository {
  async findTasks(query) {
    return await Task.find({ ...query, isArchived: { $ne: true } })
      .populate('project', 'title')
      .populate('assignedTo', 'name email');
  }

  // Paginated version — returns { tasks, total, totalPages, currentPage }
  async findTasksPaginated(query, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const fullQuery = { ...query, isArchived: { $ne: true } };
    const [tasks, total] = await Promise.all([
      Task.find(fullQuery)
        .populate('project', 'title')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(fullQuery),
    ]);
    return { tasks, total, totalPages: Math.ceil(total / limit), currentPage: page };
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

  async archiveTask(task) {
    task.isArchived = true;
    task.archivedAt = new Date();
    return await task.save();
  }

  async restoreTask(task) {
    task.isArchived = false;
    task.archivedAt = null;
    return await task.save();
  }

  async findArchivedTasks() {
    return await Task.find({ isArchived: true })
      .populate('project', 'title')
      .populate('assignedTo', 'name email')
      .sort({ archivedAt: -1 });
  }

  // Paginated archived tasks
  async findArchivedTasksPaginated(query = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const fullQuery = { ...query, isArchived: true };
    const [tasks, total] = await Promise.all([
      Task.find(fullQuery)
        .populate('project', 'title')
        .populate('assignedTo', 'name email')
        .sort({ archivedAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(fullQuery),
    ]);
    return { tasks, total, totalPages: Math.ceil(total / limit), currentPage: page };
  }
}

module.exports = new TaskRepository();
