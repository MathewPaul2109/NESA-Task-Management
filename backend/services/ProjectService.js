const ProjectRepository = require('../repositories/ProjectRepository');
const TaskRepository = require('../repositories/TaskRepository');
const logAction = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');

class ProjectService {
  async getProjectsForUser(user, queryParams = {}) {
    let query = {};
    const filters = [];

    const page  = parseInt(queryParams.page)  || 1;
    const limit = parseInt(queryParams.limit) || 10;

    if (queryParams.archived === 'true') {
      filters.push({ isArchived: true });
    } else {
      filters.push({ isArchived: { $ne: true } });
    }

    if (user.role === 'User') {
      const assignedTasks = await TaskRepository.findTasksAssignedToUser(user._id);
      const projectIdsFromTasks = assignedTasks.map(t => t.project);
      filters.push({
        $or: [
          { members: user._id },
          { manager: user._id },
          { _id: { $in: projectIdsFromTasks } }
        ]
      });
    } else if (user.role === 'Project Manager') {
      filters.push({
        $or: [
          { manager: user._id },
          { members: user._id },
        ]
      });
    }

    if (queryParams.search) {
      filters.push({ title: { $regex: queryParams.search, $options: 'i' } });
    }

    if (queryParams.status) {
      filters.push({ status: queryParams.status });
    }

    if (filters.length > 0) {
      query = { $and: filters };
    }

    const result = await ProjectRepository.findProjectsPaginated(query, page, limit);

    // Merge task-based member counts into each project
    for (let p of result.projects) {
      const tasks = await TaskRepository.findTasksByProjectId(p._id);
      const uniqueMembers = new Set(p.members.map(id => id.toString()));
      tasks.forEach(t => {
        t.assignedTo.forEach(userId => uniqueMembers.add(userId.toString()));
      });
      p.members = Array.from(uniqueMembers);
    }

    return result;
  }

  async getProjectById(user, projectId) {
    const project = await ProjectRepository.findProjectById(projectId);
    if (!project) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }

    if (user.role === 'User' && 
        project.manager._id.toString() !== user._id.toString() && 
        !project.members.some(member => member._id.toString() === user._id.toString())) {
      const err = new Error('Not authorized to view this project');
      err.statusCode = 403;
      throw err;
    }

    return project;
  }

  async createProject(user, projectData) {
    const { title, description, members, status, manager } = projectData;
    let project = await ProjectRepository.createProject({
      title,
      description,
      manager: manager || user._id,
      members,
      status
    });
    await logAction('PROJECT_CREATED', user._id, { title }, project._id);
    
    const populatedProject = await ProjectRepository.findProjectById(project._id);

    if (populatedProject.manager && populatedProject.manager.email) {
      try {
        await sendEmail({
          email: populatedProject.manager.email,
          subject: 'You have been assigned as Project Manager',
          message: `You have been assigned as the Project Manager for the new project: ${title}\n\nDescription: ${description}`
        });
      } catch (err) {
        console.error('Error sending email to manager:', err);
      }
    }

    if (populatedProject.members && populatedProject.members.length > 0) {
      for (const member of populatedProject.members) {
        if (member.email) {
          try {
            await sendEmail({
              email: member.email,
              subject: 'You have been added to a new Project',
              message: `You have been added to the project: ${title}\n\nProject Manager: ${populatedProject.manager.name}\n\nDescription: ${description}`
            });
          } catch (err) {
            console.error('Error sending email to member:', err);
          }
        }
      }
    }

    return populatedProject;
  }

  async updateProject(user, projectId, updateData) {
    const project = await ProjectRepository.findProjectById(projectId);
    if (!project) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }

    project.title = updateData.title || project.title;
    project.description = updateData.description || project.description;
    project.members = updateData.members || project.members;
    project.status = updateData.status || project.status;
    if (updateData.manager) project.manager = updateData.manager;

    const updatedProject = await ProjectRepository.updateProject(project);
    await logAction('PROJECT_UPDATED', user._id, { title: updatedProject.title, status: updatedProject.status }, updatedProject._id);
    
    return await ProjectRepository.findProjectById(updatedProject._id);
  }

  async deleteProject(user, projectId) {
    const project = await ProjectRepository.findProjectById(projectId);
    if (!project) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }
    await logAction('PROJECT_ARCHIVED', user._id, { title: project.title }, project._id);
    project.isArchived = true;
    await ProjectRepository.updateProject(project);
  }

  async hardDeleteProject(user, projectId) {
    const project = await ProjectRepository.findProjectById(projectId);
    if (!project) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }
    await logAction('PROJECT_HARD_DELETED', user._id, { title: project.title }, project._id);
    await ProjectRepository.deleteProject(project);
  }

  async restoreProject(user, projectId) {
    const project = await ProjectRepository.findProjectById(projectId);
    if (!project) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }
    await logAction('PROJECT_RESTORED', user._id, { title: project.title }, project._id);
    project.isArchived = false;
    await ProjectRepository.updateProject(project);
  }
}

module.exports = new ProjectService();
