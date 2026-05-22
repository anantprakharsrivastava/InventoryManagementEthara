import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import Message from '../models/Message.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany(),
      Project.deleteMany(),
      Task.deleteMany(),
      Activity.deleteMany(),
      Notification.deleteMany(),
      Message.deleteMany(),
    ]);

    const admin = await User.create({
      name: 'Alex Admin',
      email: 'admin@ethara.com',
      password: 'admin123',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    });

    const member1 = await User.create({
      name: 'Sarah Chen',
      email: 'sarah@ethara.com',
      password: 'member123',
      role: 'member',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    });

    const member2 = await User.create({
      name: 'James Wilson',
      email: 'james@ethara.com',
      password: 'member123',
      role: 'member',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
    });

    const project1 = await Project.create({
      title: 'Ethara Platform Launch',
      description: 'Build and launch the next-gen project management SaaS platform.',
      status: 'active',
      color: '#8b5cf6',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdBy: admin._id,
      admins: [admin._id],
      members: [
        { user: admin._id, role: 'admin' },
        { user: member1._id, role: 'member' },
        { user: member2._id, role: 'member' },
      ],
    });

    const project2 = await Project.create({
      title: 'Mobile App Redesign',
      description: 'Complete UI/UX overhaul of the mobile experience.',
      status: 'planning',
      color: '#06b6d4',
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      createdBy: admin._id,
      admins: [admin._id, member1._id],
      members: [
        { user: admin._id, role: 'admin' },
        { user: member1._id, role: 'admin' },
      ],
    });

    const tasks = [
      { title: 'Design system tokens', status: 'completed', priority: 'high', project: project1._id, assignedTo: member1._id, order: 0 },
      { title: 'API authentication flow', status: 'completed', priority: 'urgent', project: project1._id, assignedTo: admin._id, order: 1 },
      { title: 'Kanban board component', status: 'in-progress', priority: 'high', project: project1._id, assignedTo: member2._id, order: 0 },
      { title: 'Dashboard analytics', status: 'in-progress', priority: 'medium', project: project1._id, assignedTo: member1._id, order: 1 },
      { title: 'Socket.io notifications', status: 'review', priority: 'medium', project: project1._id, assignedTo: admin._id, order: 0 },
      { title: 'Deploy to production', status: 'todo', priority: 'urgent', project: project1._id, assignedTo: admin._id, order: 0, dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { title: 'User research interviews', status: 'todo', priority: 'low', project: project2._id, assignedTo: member1._id, order: 0 },
      { title: 'Wireframe prototypes', status: 'in-progress', priority: 'medium', project: project2._id, assignedTo: member1._id, order: 0 },
    ];

    for (const t of tasks) {
      await Task.create({
        ...t,
        description: `Detailed work item for: ${t.title}`,
        createdBy: admin._id,
        dueDate: t.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        comments: [
          { user: admin._id, text: 'Let\'s prioritize this in the next sprint.' },
        ],
      });
    }

    await Activity.create([
      { user: admin._id, action: 'created project', entityType: 'project', entityId: project1._id, project: project1._id },
      { user: member1._id, action: 'completed task', entityType: 'task', project: project1._id },
      { user: member2._id, action: 'updated task status', entityType: 'task', project: project1._id },
    ]);

    await Notification.create({
      recipient: member1._id,
      sender: admin._id,
      type: 'task_assigned',
      title: 'Task Assigned',
      message: 'You were assigned "Dashboard analytics"',
      project: project1._id,
    });

    await Message.create([
      { project: project1._id, sender: admin._id, content: 'Welcome to the Ethara launch project! 🚀' },
      { project: project1._id, sender: member1._id, content: 'Design tokens are ready for review.' },
      { project: project1._id, sender: member2._id, content: 'Working on the Kanban drag-and-drop now.' },
    ]);

    console.log('Seed data created successfully!');
    console.log('--- Login Credentials ---');
    console.log('Admin: admin@ethara.com / admin123');
    console.log('Member: sarah@ethara.com / member123');
    console.log('Member: james@ethara.com / member123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
