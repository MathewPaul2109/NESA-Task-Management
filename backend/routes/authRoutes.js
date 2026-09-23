const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getUsers, updateUserRole } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('Admin', 'Project Manager'), getUsers);
router.put('/users/:id/role', protect, authorize('Admin'), updateUserRole);

module.exports = router;
