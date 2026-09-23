const ProjectRepository = require('../repositories/ProjectRepository');
const TaskRepository = require('../repositories/TaskRepository');
const logAction = require('../utils/logger');

class ProjectService {
  async getProjectsForUser(user) {
    let query = {};
    if (user.role === 'User') {
      const assignedTasks = await TaskRepository.findTasksAssignedToUser(user._id);
      const projectIdsFromTasks = assignedTasks.map(t => t.project);

      query = { 
        $or: [
          { members: user._id }, 
          { manager: user._id },
          { _id: { $in: projectIdsFromTasks } }
        ] 
      };
    }

    const projects = await ProjectRepository.findProjects(query);

    for (let p of projects) {
      const tasks = await TaskRepository.findTasksByProjectId(p._id);
      const uniqueMembers = new Set(p.members.map(id => id.toString()));
      tasks.forEach(t => {
        t.assignedTo.forEach(userId => uniqueMembers.add(userId.toString()));
      });
      p.members = Array.from(uniqueMembers);
    }

    return projects;
  }

  async getProjectById(user, projectId) {
    const project = await ProjectRepository.findProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (user.role === 'User' && 
        project.manager._id.toString() !== user._id.toString() && 
        !project.members.some(member => member._id.toString() === user._id.toString())) {
      throw new Error('Not authorized to view this project');
    }

    return project;
  }

  async createProject(user, projectData) {
    const { title, description, members, status } = projectData;
    const project = await ProjectRepository.createProject({
      title,
      description,
      manager: user._id, 
      members,
      status
    });
    await logAction('PROJECT_CREATED', user._id, { title }, project._id);
    return project;
  }

  async updateProject(user, projectId, updateData) {
    const project = await ProjectRepository.findProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    project.title = updateData.title || project.title;
    project.description = updateData.description || project.description;
    project.members = updateData.members || project.members;
    project.status = updateData.status || project.status;

    const updatedProject = await ProjectRepository.updateProject(project);
    await logAction('PROJECT_UPDATED', user._id, { title: updatedProject.title, status: updatedProject.status }, updatedProject._id);
    
    return updatedProject;
  }

  async deleteProject(user, projectId) {
    const project = await ProjectRepository.findProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    await logAction('PROJECT_DELETED', user._id, { title: project.title }, project._id);
    await ProjectRepository.deleteProject(project);
  }
}

module.exports = new ProjectService();
