const Task = require('../models/Task');
const logAction = require('./logger');

const cleanupOldCompletedTasks = async () => {
  try {
    // 12 hours ago
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    
    // Find tasks that are 'Done' and were last updated more than 12 hours ago
    const tasksToDelete = await Task.find({
      status: 'Done',
      updatedAt: { $lt: twelveHoursAgo }
    });

    if (tasksToDelete.length > 0) {
      for (const task of tasksToDelete) {
        await logAction('TASK_AUTO_DELETED', task.assignedTo[0] || null, { title: task.title, reason: 'Auto cleanup (12h completed)' }, task._id);
        await task.deleteOne();
      }
      console.log(`[Cleanup Job] Automatically deleted ${tasksToDelete.length} completed task(s) older than 12 hours.`);
    }
  } catch (error) {
    console.error('[Cleanup Job] Error cleaning up tasks:', error);
  }
};

const startCleanupJob = () => {
  // Run every 30 seconds
  setInterval(cleanupOldCompletedTasks, 30 * 1000);
  console.log('[Cleanup Job] Task cleanup job started (runs every 30s).');
};

module.exports = { startCleanupJob };
