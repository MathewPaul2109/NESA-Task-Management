const LogService = require('../services/LogService');

// @desc    Get all system logs
// @route   GET /api/logs
// @access  Private/Admin
const getLogs = async (req, res) => {
  try {
    const logs = await LogService.getLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { getLogs };
