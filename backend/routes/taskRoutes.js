const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTasks)
  .post(protect, authorize('Admin', 'Project Manager'), createTask);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, authorize('Admin', 'Project Manager'), deleteTask);

module.exports = router;
