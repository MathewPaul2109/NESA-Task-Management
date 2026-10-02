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

  // Paginated version — returns { projects, total, totalPages, currentPage }
  async findProjectsPaginated(query, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
      Project.find(query).populate('manager', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Project.countDocuments(query),
    ]);
    return { projects, total, totalPages: Math.ceil(total / limit), currentPage: page };
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
