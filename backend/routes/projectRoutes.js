const express = require('express');
const router = express.Router();
const { getProjects, getProjectById, createProject, updateProject, deleteProject, hardDeleteProject, restoreProject } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('Admin', 'Project Manager'), createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, authorize('Admin', 'Project Manager'), updateProject)
  .delete(protect, authorize('Admin'), deleteProject);

router.delete('/:id/hard', protect, authorize('Admin'), hardDeleteProject);
router.put('/:id/restore', protect, authorize('Admin'), restoreProject);

module.exports = router;
