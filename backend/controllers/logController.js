const LogService = require('../services/LogService');

// @desc    Get all system logs
// @route   GET /api/logs
// @access  Private/Admin
const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const result = await LogService.getLogs(parseInt(page), parseInt(limit), search);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { getLogs };
