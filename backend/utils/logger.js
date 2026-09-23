const Log = require('../models/Log');

const logAction = async (action, userId, details = null, targetId = null) => {
  try {
    const log = new Log({
      action,
      user: userId,
      details,
      targetId
    });
    await log.save();
  } catch (error) {
    console.error('Failed to create log:', error);
  }
};

module.exports = logAction;
