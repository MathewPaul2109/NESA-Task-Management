require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');
const Project = require('./models/Project');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Find admin user for logging context
    const admin = await User.findOne({ role: 'Admin' });
    if (!admin) {
      console.log('No admin found');
      process.exit(1);
    }

    // Find 2 regular users
    const users = await User.find({ role: 'User', isArchived: { $ne: true } }).limit(2);
    if (users.length < 2) {
      console.log('Not enough users found');
      process.exit(1);
    }
    const userIds = users.map(u => u._id);

    // Find any project
    const project = await Project.findOne();
    if (!project) {
      console.log('No active projects found');
      process.exit(1);
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);

    const taskData = [
      {
        title: 'Review Frontend Documentation',
        description: '<p>Please review the newly added frontend components for consistency.</p>',
        project: project._id,
        assignedTo: userIds,
        priority: 'High',
        dueDate: dueDate.toISOString(),
      },
      {
        title: 'Update API Endpoints',
        description: '<p>Update the user fetching logic across the admin dashboard.</p>',
        project: project._id,
        assignedTo: userIds,
        priority: 'Medium',
        dueDate: dueDate.toISOString(),
      },
      {
        title: 'Perform Integration Tests',
        description: '<p>Run the full e2e suite and report any anomalies before release.</p>',
        project: project._id,
        assignedTo: userIds,
        priority: 'Low',
        dueDate: dueDate.toISOString(),
      }
    ];

    for (let data of taskData) {
      await Task.create(data);
      console.log('Created task:', data.title);
    }

    console.log('Successfully assigned 3 tasks to 2 users');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
