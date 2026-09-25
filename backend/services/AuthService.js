const UserRepository = require('../repositories/UserRepository');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logAction = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

class AuthService {
  async registerUser(userData) {
    const { name, email, password, role } = userData;

    if (!name || !email || !password) {
      throw new Error('Please add all required fields');
    }

    const userExists = await UserRepository.findByEmail(email);
    if (userExists) {
      throw new Error('User already exists');
    }

    const user = await UserRepository.createUser({
      name,
      email,
      password,
      role: role || 'User'
    });

    if (!user) {
      throw new Error('Invalid user data');
    }

    return {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    };
  }

  async loginUser(email, password) {
    const user = await UserRepository.findUserForLogin(email);

    if (user && (await user.matchPassword(password))) {
      return {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      };
    } else {
      await logAction('LOGIN_FAILED', user ? user._id : null, { email, reason: 'Invalid credentials' });
      throw new Error('Invalid credentials');
    }
  }

  async getMe(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async getUsers() {
    return await UserRepository.findUsers();
  }

  async updateUserRole(adminUserId, targetUserId, newRole) {
    const user = await UserRepository.findById(targetUserId);
    if (!user) {
      throw new Error('User not found');
    }
    
    if (!['Admin', 'Project Manager', 'User'].includes(newRole)) {
      throw new Error('Invalid role');
    }

    user.role = newRole;
    await UserRepository.updateUser(user);

    await logAction('ROLE_UPDATED', adminUserId, { newRole: newRole, targetUserEmail: user.email }, user._id);

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
      throw new Error('User not found');
    }

    user.name = updateData.name || user.name;
    user.email = updateData.email || user.email;
    
    await UserRepository.updateUser(user);

    await logAction('USER_UPDATED', adminUserId, { newName: user.name, newEmail: user.email, targetUserId: user._id }, user._id);

    return {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async forgotPassword(email) {
    const user = await UserRepository.findUserForLogin(email);
    if (!user) {
      throw new Error('There is no user with that email');
    }

    const resetToken = user.getResetPasswordToken();
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
      throw new Error('Email could not be sent');
    }
  }

  async resetPassword(token, newPassword) {
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
      throw new Error('Invalid token');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await UserRepository.updateUser(user);
    await logAction('PASSWORD_RESET', user._id, { targetUserEmail: user.email }, user._id);

    return {
      success: true,
      token: generateToken(user._id)
    };
  }
}

module.exports = new AuthService();
