const ProjectRepository = require('../repositories/ProjectRepository');
const TaskRepository = require('../repositories/TaskRepository');
const UserRepository = require('../repositories/UserRepository');
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
      
      const memberMap = new Map();
      // Add existing populated members
      if (p.members && Array.isArray(p.members)) {
        p.members.forEach(m => {
          if (m && m._id) {
            memberMap.set(m._id.toString(), m);
          }
        });
      }
      
      // Collect new user IDs from tasks
      const additionalUserIds = new Set();
      tasks.forEach(t => {
        if (t.assignedTo && Array.isArray(t.assignedTo)) {
          t.assignedTo.forEach(userId => {
            const idStr = userId.toString();
            if (!memberMap.has(idStr)) {
              additionalUserIds.add(idStr);
            }
          });
        }
      });
      
      if (additionalUserIds.size > 0) {
        const extraUsers = await UserRepository.findUsers({ _id: { $in: Array.from(additionalUserIds) } });
        extraUsers.forEach(u => {
          memberMap.set(u._id.toString(), { _id: u._id, name: u.name, email: u.email });
        });
      }
      
      p.members = Array.from(memberMap.values());
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
        const cleanDescription = description ? description.replace(/<[^>]*>?/gm, '') : '';
        sendEmail({
          email: populatedProject.manager.email,
          subject: 'You have been assigned as Project Manager',
          message: `You have been assigned as the Project Manager for the new project: ${title}\n\nDescription: ${cleanDescription}`
        }).catch(err => console.error('Error sending email to manager:', err));
      } catch (err) {
        console.error('Error in manager email block:', err);
      }
    }

    if (populatedProject.members && populatedProject.members.length > 0) {
      for (const member of populatedProject.members) {
        if (member.email) {
          try {
            const cleanDescription = description ? description.replace(/<[^>]*>?/gm, '') : '';
            sendEmail({
              email: member.email,
              subject: 'You have been added to a new Project',
              message: `You have been added to the project: ${title}\n\nProject Manager: ${populatedProject.manager.name}\n\nDescription: ${cleanDescription}`
            }).catch(err => console.error('Error sending email to member:', err));
          } catch (err) {
            console.error('Error in member email block:', err);
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
    
    if (updateData.status && updateData.status === 'Completed' && project.status !== 'Completed') {
      const allProjectTasks = await TaskRepository.findTasksByProjectId(project._id);
      if (allProjectTasks.length === 0) {
        const err = new Error('Cannot complete a project that has no tasks');
        err.statusCode = 400;
        throw err;
      }
      const allDone = allProjectTasks.every(t => t.status === 'Done');
      if (!allDone) {
        const err = new Error('Cannot complete project: Not all tasks are done');
        err.statusCode = 400;
        throw err;
      }
      project.status = updateData.status;
    } else if (updateData.status) {
      project.status = updateData.status;
    }
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
    project.status = 'Active';
    await ProjectRepository.updateProject(project);
  }
}

module.exports = new ProjectService();
