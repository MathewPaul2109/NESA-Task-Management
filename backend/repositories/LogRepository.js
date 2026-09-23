const Log = require('../models/Log');

class LogRepository {
  async findAllLogs() {
    return await Log.find().populate('user', 'name email').sort({ createdAt: -1 });
  }

  async createLog(logData) {
    return await Log.create(logData);
  }
}

module.exports = new LogRepository();
