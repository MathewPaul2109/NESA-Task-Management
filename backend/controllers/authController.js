const AuthService = require('../services/AuthService');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const user = await AuthService.registerUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    if (error.message === 'User already exists') {
      return res.status(409).json({ message: error.message });
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await AuthService.loginUser(email, password);
    res.json(user);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await AuthService.getMe(req.user.id);
    res.json(user);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const isArchived = req.query.archived === 'true';
    const query = isArchived ? { isArchived: true } : { isArchived: { $ne: true } };
    const users = await AuthService.getUsers(query);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await AuthService.updateUserRole(req.user.id, req.params.id, role);
    res.json(user);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update user details (name, email)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
const updateUserDetails = async (req, res) => {
  try {
    const user = await AuthService.updateUserDetails(req.user.id, req.params.id, req.body);
    res.json(user);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const result = await AuthService.deleteUser(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Restore user
// @route   PUT /api/auth/users/:id/restore
// @access  Private/Admin
const restoreUser = async (req, res) => {
  try {
    const result = await AuthService.restoreUser(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const result = await AuthService.forgotPassword(req.body.email);
    res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const result = await AuthService.resetPassword(req.params.token, req.body.password);
    res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  updateUserRole,
  updateUserDetails,
  deleteUser,
  restoreUser,
  forgotPassword,
  resetPassword
};
