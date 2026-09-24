const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask, uploadTaskFile, archiveTask, getArchivedTasks, restoreTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(protect, getTasks)
  .post(protect, authorize('Admin', 'Project Manager'), createTask);

// Must be declared before /:id to avoid 'archived' being matched as an id param
router.get('/archived', protect, authorize('Admin', 'Project Manager'), getArchivedTasks);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, authorize('Admin', 'Project Manager'), deleteTask);

router.post('/:id/upload', protect, upload.single('file'), uploadTaskFile);

router.patch('/:id/archive', protect, authorize('Admin', 'Project Manager'), archiveTask);
router.patch('/:id/restore', protect, authorize('Admin', 'Project Manager'), restoreTask);

module.exports = router;
