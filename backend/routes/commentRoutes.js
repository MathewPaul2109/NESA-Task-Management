const express = require('express');
const router = express.Router();
const { getComments, addComment, getProjectComments, addProjectComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/project/:projectId')
  .get(protect, getProjectComments)
  .post(protect, addProjectComment);

router.route('/:taskId')
  .get(protect, getComments)
  .post(protect, addComment);

module.exports = router;
