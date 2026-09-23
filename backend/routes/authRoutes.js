const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getUsers, updateUserRole, updateUserDetails, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('Admin', 'Project Manager'), getUsers);
router.put('/users/:id/role', protect, authorize('Admin'), updateUserRole);
router.put('/users/:id', protect, authorize('Admin'), updateUserDetails);

module.exports = router;
