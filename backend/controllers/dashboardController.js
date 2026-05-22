import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';

export const getDashboardStats = async (req, res) => {
  try {
    let projectFilter = {};
    let taskFilter = {};

    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({
        $or: [{ createdBy: req.user._id }, { 'members.user': req.user._id }],
      }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      projectFilter = { _id: { $in: projectIds } };
      taskFilter = { project: { $in: projectIds } };
    }

    const [totalProjects, totalTasks, completedTasks, overdueTasks] = await Promise.all([
      Project.countDocuments(projectFilter),
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'completed' }),
      Task.countDocuments({
        ...taskFilter,
        dueDate: { $lt: new Date() },
        status: { $ne: 'completed' },
      }),
    ]);

    const tasksByStatus = await Task.aggregate([
      { $match: taskFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const tasksByPriority = await Task.aggregate([
      { $match: taskFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const completedByDay = await Task.aggregate([
      {
        $match: {
          ...taskFilter,
          status: 'completed',
          updatedAt: { $gte: last7Days[0] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
          count: { $sum: 1 },
        },
      },
    ]);

    const productivity = last7Days.map((day) => {
      const key = day.toISOString().split('T')[0];
      const found = completedByDay.find((d) => d._id === key);
      return {
        date: key,
        label: day.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: found?.count || 0,
      };
    });

    const recentProjects = await Project.find(projectFilter)
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('createdBy', 'name avatar')
      .select('title status color updatedAt dueDate');

    let activityFilter = {};
    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({
        $or: [{ createdBy: req.user._id }, { 'members.user': req.user._id }],
      }).select('_id');
      activityFilter = { project: { $in: userProjects.map((p) => p._id) } };
    }

    const teamActivity = await Activity.find(activityFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name avatar')
      .populate('project', 'title');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProjects,
          totalTasks,
          completedTasks,
          overdueTasks,
          completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
        tasksByStatus,
        tasksByPriority,
        productivity,
        recentProjects,
        teamActivity,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
