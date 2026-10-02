const UserRepository = require('../repositories/UserRepository');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const logAction = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30s',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refreshsecret123', {
    expiresIn: '7d',
  });
};

class AuthService {
  async registerUser(userData) {
    const { name, email, password, role } = userData;

    if (!name || !email || !password) {
      const err = new Error('Please add all required fields');
      err.statusCode = 400;
      throw err;
    }

    if (/^[A-Z]/.test(email)) {
      const err = new Error('Email must not start with a capital letter');
      err.statusCode = 400;
      throw err;
    }

    if (!/[A-Z]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password) || !/\d/.test(password)) {
      const err = new Error('Password must contain at least one capital letter, one special character, and one number');
      err.statusCode = 400;
      throw err;
    }

    if (password.length < 6) {
      const err = new Error('Password must be at least 6 characters long');
      err.statusCode = 400;
      throw err;
    }

    const userExists = await UserRepository.findByEmail(email);
    if (userExists) {
      const err = new Error('User already exists');
      err.statusCode = 409;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // If this is the very first user, they must be an Admin
    const userCount = await UserRepository.countUsers();
    const finalRole = userCount === 0 ? 'Admin' : (role || 'User');

    const user = await UserRepository.createUser({
      name,
      email,
      password: hashedPassword,
      role: finalRole
    });

    if (!user) {
      const err = new Error('Invalid user data ..');
      err.statusCode = 400;
      throw err;
    }

    return {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateAccessToken(user._id),
      refreshToken: generateRefreshToken(user._id),
    };
  }

  async loginUser(email, password) {
    if (!email || !password) {
      const err = new Error('Please provide both email and password');
      err.statusCode = 400;
      throw err;
    }

    const user = await UserRepository.findUserForLogin(email);

    if (user && user.isArchived) {
      const err = new Error('This account has been deactivated.');
      err.statusCode = 403;
      throw err;
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      return {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateAccessToken(user._id),
        refreshToken: generateRefreshToken(user._id),
      };
    } else {
      await logAction('LOGIN_FAILED', user ? user._id : null, { email, reason: 'Invalid credentials' });
      const err = new Error('Invalid credentials....');
      err.statusCode = 401;
      throw err;
    }
  }

  async refreshToken(token) {
    if (!token) {
      const err = new Error('No refresh token provided');
      err.statusCode = 401;
      throw err;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refreshsecret123');
      const user = await UserRepository.findById(decoded.id);

      if (!user || user.isArchived) {
        const err = new Error('User not found or deactivated');
        err.statusCode = 401;
        throw err;
      }

      return {
        token: generateAccessToken(user._id),
      };
    } catch (error) {
      const err = new Error('Invalid refresh token');
      err.statusCode = 401;
      throw err;
    }
  }

  async getMe(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return user;
  }

  async getUsers(query = {}, page = 1, limit = 10) {
    return await UserRepository.findUsersPaginated(query, page, limit);
  }

  async updateUserRole(adminUserId, targetUserId, newRole) {
    const user = await UserRepository.findById(targetUserId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    if (!['Admin', 'Project Manager', 'User'].includes(newRole)) {
      const err = new Error('Invalid role');
      err.statusCode = 400;
      throw err;
    }

    user.role = newRole;
    await UserRepository.updateUser(user);

    await logAction('ROLE_UPDATED', adminUserId, { newRole: newRole, targetUserName: user.name, targetUserEmail: user.email }, user._id);

    return {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async updateUserDetails(adminUserId, targetUserId, updateData) {
    const user = await UserRepository.findById(targetUserId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    user.name = updateData.name || user.name;
    user.email = updateData.email || user.email;

    await UserRepository.updateUser(user);

    await logAction('USER_UPDATED', adminUserId, { newName: user.name, newEmail: user.email, targetUserName: user.name }, user._id);

    return {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async deleteUser(adminUserId, targetUserId) {
    const user = await UserRepository.findById(targetUserId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    user.isArchived = true;
    await UserRepository.updateUser(user);

    await logAction('USER_ARCHIVED', adminUserId, { targetUserName: user.name }, targetUserId);

    return { message: 'User archived' };
  }

  async hardDeleteUser(adminUserId, targetUserId) {
    const user = await UserRepository.findById(targetUserId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    await UserRepository.deleteUser(targetUserId);
    await logAction('USER_HARD_DELETED', adminUserId, { targetUserName: user.name }, targetUserId);
    return { message: 'User permanently deleted' };
  }

  async restoreUser(adminUserId, targetUserId) {
    const user = await UserRepository.findById(targetUserId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    user.isArchived = false;
    await UserRepository.updateUser(user);

    await logAction('USER_RESTORED', adminUserId, { targetUserName: user.name }, targetUserId);

    return { message: 'User restored' };
  }

  async forgotPassword(email) {
    const user = await UserRepository.findUserForLogin(email);
    if (!user) {
      const err = new Error('There is no user with that email');
      err.statusCode = 404;
      throw err;
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await UserRepository.updateUser(user);

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message
      });
      return { success: true, data: 'Email sent' };
    } catch (error) {
      console.error(error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await UserRepository.updateUser(user);
      const err = new Error('Email could not be sent');
      err.statusCode = 500;
      throw err;
    }
  }

  async resetPassword(token, newPassword) {
    if (!newPassword || newPassword.length < 6) {
      const err = new Error('Password must be at least 6 characters long');
      err.statusCode = 400;
      throw err;
    }

    if (!/[A-Z]/.test(newPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) || !/\d/.test(newPassword)) {
      const err = new Error('Password must contain at least one capital letter, one special character, and one number');
      err.statusCode = 400;
      throw err;
    }

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await UserRepository.findUserForLogin({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    // Mongoose bug check: UserRepository.findUserForLogin typically takes email (string), but here we pass an object.
    // I need to add a findOne method that takes a general query to the repo.
    if (!user) {
      const err = new Error('Invalid token');
      err.statusCode = 400;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await UserRepository.updateUser(user);
    await logAction('PASSWORD_RESET', user._id, { targetUserEmail: user.email }, user._id);

    return {
      success: true,
      token: generateAccessToken(user._id),
      refreshToken: generateRefreshToken(user._id)
    };
  }
}

module.exports = new AuthService();
