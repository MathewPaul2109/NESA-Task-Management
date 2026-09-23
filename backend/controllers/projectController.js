const Project = require('../models/Project');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let query = {};
    // If User, only show projects where they are a member, manager, or have an assigned task
    if (req.user.role === 'User') {
      const Task = require('../models/Task');
      const assignedTasks = await Task.find({ assignedTo: req.user._id }).select('project');
      const projectIdsFromTasks = assignedTasks.map(t => t.project);

      query = { 
        $or: [
          { members: req.user._id }, 
          { manager: req.user._id },
          { _id: { $in: projectIdsFromTasks } }
        ] 
      };
    }
    const projects = await Project.find(query).populate('manager', 'name email').lean();
    
    // Calculate true total members by merging explicit members + task assignees
    const Task = require('../models/Task');
    for (let p of projects) {
      const tasks = await Task.find({ project: p._id }).select('assignedTo');
      const uniqueMembers = new Set(p.members.map(id => id.toString()));
      tasks.forEach(t => {
        t.assignedTo.forEach(userId => uniqueMembers.add(userId.toString()));
      });
      p.members = Array.from(uniqueMembers);
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('manager', 'name email').populate('members', 'name email');
    if (project) {
      // Access check
      if (req.user.role === 'User' && 
          project.manager._id.toString() !== req.user._id.toString() && 
          !project.members.some(member => member._id.toString() === req.user._id.toString())) {
        return res.status(403).json({ message: 'Not authorized to view this project' });
      }
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private (Admin, PM)
const createProject = async (req, res) => {
  try {
    const { title, description, members, status } = req.body;
    const project = new Project({
      title,
      description,
      manager: req.user._id, // Assumes creator is manager, or specify otherwise
      members,
      status
    });
    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Admin, PM)
const updateProject = async (req, res) => {
  try {
    const { title, description, members, status } = req.body;
    const project = await Project.findById(req.params.id);

    if (project) {
      project.title = title || project.title;
      project.description = description || project.description;
      project.members = members || project.members;
      project.status = status || project.status;

      const updatedProject = await project.save();
      res.json(updatedProject);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project) {
      await project.deleteOne();
      res.json({ message: 'Project removed' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
