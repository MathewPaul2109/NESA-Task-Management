const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask, uploadTaskFile } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(protect, getTasks)
  .post(protect, authorize('Admin', 'Project Manager'), createTask);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, authorize('Admin', 'Project Manager'), deleteTask);

router.post('/:id/upload', protect, upload.single('file'), uploadTaskFile);

module.exports = router;
