const ProjectService = require('../services/ProjectService');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await ProjectService.getProjectsForUser(req.user, req.query);
    res.json(projects);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await ProjectService.getProjectById(req.user, req.params.id);
    res.json(project);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private (Admin, PM)
const createProject = async (req, res) => {
  try {
    const project = await ProjectService.createProject(req.user, req.body);
    res.status(201).json(project);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Admin, PM)
const updateProject = async (req, res) => {
  try {
    const updatedProject = await ProjectService.updateProject(req.user, req.params.id, req.body);
    res.json(updatedProject);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
const deleteProject = async (req, res) => {
  try {
    await ProjectService.deleteProject(req.user, req.params.id);
    res.json({ message: 'Project removed' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Restore a project
// @route   PUT /api/projects/:id/restore
// @access  Private (Admin only)
const restoreProject = async (req, res) => {
  try {
    await ProjectService.restoreProject(req.user, req.params.id);
    res.json({ message: 'Project restored' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  restoreProject
};
