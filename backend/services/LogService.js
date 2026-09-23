const LogRepository = require('../repositories/LogRepository');

class LogService {
  async getLogs() {
    return await LogRepository.findAllLogs();
  }
}

module.exports = new LogService();
