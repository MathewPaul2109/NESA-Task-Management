const LogRepository = require('../repositories/LogRepository');

class LogService {
  async getLogs(page = 1, limit = 10, search = '') {
    // Search by action name or user name/email
    let query = {};
    if (search) {
      query = {
        $or: [
          { action: { $regex: search, $options: 'i' } },
        ]
      };
    }
    return await LogRepository.findLogsPaginated(query, page, limit);
  }
}

module.exports = new LogService();
