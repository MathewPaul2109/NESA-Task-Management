const User = require('../models/User');

class UserRepository {
  async findById(id) {
    return await User.findById(id).select('-password');
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }
  
  async findUserForLogin(query) {
    if (typeof query === 'string') {
      return await User.findOne({ email: query }).select('+password');
    }
    return await User.findOne(query).select('+password');
  }

  async findOne(query) {
    return await User.findOne(query);
  }

  async findUsers(query = {}) {
    return await User.find(query).select('-password');
  }

  // Paginated version — returns { users, total, totalPages, currentPage }
  async findUsersPaginated(query = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);
    return { users, total, totalPages: Math.ceil(total / limit), currentPage: page };
  }

  async countUsers(query = {}) {
    return await User.countDocuments(query);
  }

  async createUser(userData) {
    return await User.create(userData);
  }

  async updateUser(user) {
    return await user.save();
  }

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }
}

module.exports = new UserRepository();
