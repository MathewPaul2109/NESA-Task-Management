const Project = require('../models/Project');

class ProjectRepository {
  async findProjectsByMemberId(userId) {
    return await Project.find({ members: userId }).select('_id');
  }

  async findProjectById(id) {
    return await Project.findById(id).populate('manager', 'name email').populate('members', 'name email');
  }

  async findProjects(query) {
    return await Project.find(query).populate('manager', 'name email').lean();
  }

  async createProject(projectData) {
    const project = new Project(projectData);
    return await project.save();
  }

  async updateProject(project) {
    return await project.save();
  }

  async deleteProject(project) {
    return await project.deleteOne();
  }
}

module.exports = new ProjectRepository();
