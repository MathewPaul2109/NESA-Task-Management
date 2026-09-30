const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getUsers, updateUserRole, updateUserDetails, deleteUser, hardDeleteUser, restoreUser, forgotPassword, resetPassword, refreshToken, logoutUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', logoutUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('Admin', 'Project Manager'), getUsers);
router.put('/users/:id/role', protect, authorize('Admin'), updateUserRole);
router.put('/users/:id', protect, authorize('Admin'), updateUserDetails);
router.delete('/users/:id', protect, authorize('Admin'), deleteUser);
router.delete('/users/:id/hard', protect, authorize('Admin'), hardDeleteUser);
router.put('/users/:id/restore', protect, authorize('Admin'), restoreUser);

module.exports = router;
