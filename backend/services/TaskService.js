const TaskRepository = require('../repositories/TaskRepository');
const ProjectRepository = require('../repositories/ProjectRepository');
const UserRepository = require('../repositories/UserRepository');
const logAction = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');

class TaskService {
  async getTasksForUser(user, projectId) {
    let query = {};

    if (projectId) {
      query.project = projectId;
    }

    if (user.role === 'User') {
      const userProjects = await ProjectRepository.findProjectsByMemberId(user._id);
      const projectIds = userProjects.map(p => p._id);

      if (projectId) {
        if (!projectIds.some(id => id.toString() === projectId.toString())) {
          query.$and = [
            { project: projectId },
            { assignedTo: user._id }
          ];
        } else {
          query.project = projectId;
        }
      } else {
        query.$or = [
          { project: { $in: projectIds } },
          { assignedTo: user._id }
        ];
      }
    }

    return await TaskRepository.findTasks(query);
  }

  async createTask(user, taskData, io) {
    const { title, description, project, assignedTo, priority, dueDate } = taskData;
    
    const projectExists = await ProjectRepository.findProjectById(project);
    if (!projectExists) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }

    const createdTask = await TaskRepository.createTask({
      title,
      description,
      project,
      assignedTo,
      priority,
      dueDate
    });

    await logAction('TASK_CREATED', user._id, { title, priority }, createdTask._id);
    io.emit('task_created', createdTask);

    if (assignedTo && assignedTo.length > 0) {
      for (const assigneeId of assignedTo) {
        const assignee = await UserRepository.findById(assigneeId);
        if (assignee && assignee.email) {
          const message = `You have been assigned a new task: ${title}\n\nDescription: ${description}`;
          try {
            await sendEmail({
              email: assignee.email,
              subject: 'New Task Assignment',
              message,
            });
          } catch (err) {
            console.error('Error sending email to ' + assignee.email + ':', err);
          }
        }
      }
    }

    return createdTask;
  }

  async updateTask(user, taskId, updateData, io) {
    const task = await TaskRepository.findTaskById(taskId);
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }

    if (user.role === 'User' && !task.assignedTo.includes(user._id)) {
      const err = new Error('Not authorized to update this task');
      err.statusCode = 403;
      throw err;
    }

    if (user.role === 'User') {
      task.status = updateData.status || task.status;
    } else {
      task.title = updateData.title || task.title;
      task.description = updateData.description || task.description;
      task.assignedTo = updateData.assignedTo || task.assignedTo;
      task.status = updateData.status || task.status;
      task.priority = updateData.priority || task.priority;
      task.dueDate = updateData.dueDate || task.dueDate;
    }

    const updatedTask = await TaskRepository.updateTask(task);
    await logAction('TASK_UPDATED', user._id, { status: updatedTask.status, title: updatedTask.title }, updatedTask._id);
    io.emit('task_updated', updatedTask);

    return updatedTask;
  }

  async deleteTask(user, taskId) {
    const task = await TaskRepository.findTaskById(taskId);
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }
    await logAction('TASK_DELETED', user._id, { title: task.title }, task._id);
    await TaskRepository.deleteTask(task);
  }

  async archiveTask(user, taskId, io) {
    const task = await TaskRepository.findTaskById(taskId);
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }
    if (task.status !== 'Done') {
      const err = new Error('Only completed tasks can be archived');
      err.statusCode = 400;
      throw err;
    }

    const archivedTask = await TaskRepository.archiveTask(task);
    await logAction('TASK_ARCHIVED', user._id, { title: task.title }, task._id);
    io.emit('task_archived', { _id: archivedTask._id });

    return archivedTask;
  }

  async getArchivedTasks() {
    return await TaskRepository.findArchivedTasks();
  }

  async restoreTask(user, taskId, io) {
    const task = await TaskRepository.findTaskById(taskId);
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }
    if (!task.isArchived) {
      const err = new Error('Task is not archived');
      err.statusCode = 400;
      throw err;
    }

    const restoredTask = await TaskRepository.restoreTask(task);
    await logAction('TASK_RESTORED', user._id, { title: task.title }, task._id);
    io.emit('task_created', restoredTask);

    return restoredTask;
  }

  async uploadTaskFile(taskId, file, io) {
    const task = await TaskRepository.findTaskById(taskId);
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }
    if (!file) {
      const err = new Error('No file uploaded');
      err.statusCode = 400;
      throw err;
    }

    const attachment = {
      filename: file.originalname,
      path: `/uploads/${file.filename}`
    };

    task.attachments.push(attachment);
    const updatedTask = await TaskRepository.updateTask(task);
    io.emit('task_updated', updatedTask);

    return updatedTask;
  }
}

module.exports = new TaskService();
