const LogRepository = require('../repositories/LogRepository');

const logAction = async (action, userId, details = null, targetId = null) => {
  try {
    await LogRepository.createLog({
      action,
      user: userId,
      details,
      targetId
    });
  } catch (error) {
    console.error('Failed to create log:', error);
  }
};

module.exports = logAction;
