const Log = require('../models/Log');

class LogRepository {
  async findAllLogs() {
    return await Log.find().populate('user', 'name email').sort({ createdAt: -1 });
  }

  // Paginated version — returns { logs, total, totalPages, currentPage }
  async findLogsPaginated(query = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      Log.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Log.countDocuments(query),
    ]);
    return { logs, total, totalPages: Math.ceil(total / limit), currentPage: page };
  }

  async createLog(logData) {
    return await Log.create(logData);
  }
}

module.exports = new LogRepository();
