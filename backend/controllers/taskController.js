import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { logActivity } from '../utils/activityLogger.js';
import { createNotification } from '../utils/notify.js';
import { paginate, paginationMeta } from '../utils/pagination.js';

const populateTask = (query) =>
  query
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('project', 'title color')
    .populate('comments.user', 'name avatar');

const canAccessProject = async (projectId, user) => {
  const project = await Project.findById(projectId);
  if (!project) return { ok: false, message: 'Project not found' };
  if (user.role === 'admin' || project.isMember(user._id)) {
    return { ok: true, project };
  }
  return { ok: false, message: 'Not authorized' };
};

export const getTasks = async (req, res) => {
  try {
    const {
      project,
      status,
      priority,
      assignedTo,
      search,
      overdue,
      page = 1,
      limit = 50,
    } = req.query;

    let filter = {};

    if (project) {
      const access = await canAccessProject(project, req.user);
      if (!access.ok) {
        return res.status(403).json({ success: false, message: access.message });
      }
      filter.project = project;
    } else if (req.user.role !== 'admin') {
      const userProjects = await Project.find({
        $or: [{ createdBy: req.user._id }, { 'members.user': req.user._id }],
      }).select('_id');
      filter.project = { $in: userProjects.map((p) => p._id) };
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }
    if (overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $ne: 'completed' };
    }

    const total = await Task.countDocuments(filter);
    const { query: paginatedQuery, page: pageNum, limit: limitNum } = paginate(
      populateTask(Task.find(filter).sort({ order: 1, updatedAt: -1 })),
      page,
      limit
    );

    const tasks = await paginatedQuery;

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: paginationMeta(total, pageNum, limitNum),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await populateTask(Task.findById(req.params.id));
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const access = await canAccessProject(task.project._id || task.project, req.user);
    if (!access.ok) {
      return res.status(403).json({ success: false, message: access.message });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, assignedTo, project, dueDate, order } = req.body;

    const access = await canAccessProject(project, req.user);
    if (!access.ok) {
      return res.status(403).json({ success: false, message: access.message });
    }

    if (!access.project.isMember(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not a member of this project' });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      status,
      assignedTo,
      project,
      dueDate,
      order,
      createdBy: req.user._id,
    });

    const populated = await populateTask(Task.findById(task._id));

    await logActivity({
      user: req.user._id,
      action: 'created task',
      entityType: 'task',
      entityId: task._id,
      project,
      metadata: { title },
    });

    if (assignedTo && assignedTo !== req.user._id.toString()) {
      const io = req.app.get('io');
      await createNotification(io, {
        recipient: assignedTo,
        sender: req.user._id,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You were assigned "${title}"`,
        link: `/tasks?project=${project}`,
        project,
      });
    }

    const io = req.app.get('io');
    io.to(`project:${project}`).emit('task:created', populated);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const access = await canAccessProject(task.project, req.user);
    if (!access.ok) {
      return res.status(403).json({ success: false, message: access.message });
    }

    const isAdmin = req.user.role === 'admin' || access.project.isProjectAdmin(req.user._id);
    const isAssignee = task.assignedTo?.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
    }

    const prevAssignee = task.assignedTo?.toString();
    const adminFields = ['title', 'description', 'priority', 'status', 'assignedTo', 'dueDate', 'order'];
    const memberFields = ['status', 'description', 'order'];
    const fieldsToApply = isAdmin ? adminFields : memberFields;

    fieldsToApply.forEach((key) => {
      if (req.body[key] !== undefined) task[key] = req.body[key];
    });

    await task.save();
    task = await populateTask(Task.findById(task._id));

    await logActivity({
      user: req.user._id,
      action: 'updated task',
      entityType: 'task',
      entityId: task._id,
      project: task.project._id || task.project,
      metadata: { status: task.status },
    });

    const io = req.app.get('io');
    if (req.body.assignedTo && req.body.assignedTo !== prevAssignee) {
      await createNotification(io, {
        recipient: req.body.assignedTo,
        sender: req.user._id,
        type: 'task_assigned',
        title: 'Task Assigned',
        message: `You were assigned "${task.title}"`,
        link: `/tasks?project=${task.project._id}`,
        project: task.project._id,
      });
    }

    io.to(`project:${task.project._id}`).emit('task:updated', task);

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const access = await canAccessProject(task.project, req.user);
    if (!access.ok) {
      return res.status(403).json({ success: false, message: access.message });
    }

    const isAdmin = req.user.role === 'admin' || access.project.isProjectAdmin(req.user._id);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admins can delete tasks' });
    }

    const projectId = task.project;
    await task.deleteOne();

    const io = req.app.get('io');
    io.to(`project:${projectId}`).emit('task:deleted', { id: req.params.id });

    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const access = await canAccessProject(task.project, req.user);
    if (!access.ok) {
      return res.status(403).json({ success: false, message: access.message });
    }

    task.comments.push({ user: req.user._id, text });
    await task.save();

    const populated = await populateTask(Task.findById(task._id));

    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      const io = req.app.get('io');
      await createNotification(io, {
        recipient: task.assignedTo,
        sender: req.user._id,
        type: 'comment',
        title: 'New Comment',
        message: `Comment on "${task.title}"`,
        link: `/tasks?project=${task.project}`,
        project: task.project,
      });
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ success: false, message: 'Invalid tasks array' });
    }

    const bulkOps = tasks.map(({ id, status, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { status, order } },
      },
    }));

    await Task.bulkWrite(bulkOps);

    const io = req.app.get('io');
    if (tasks[0]?.projectId) {
      io.to(`project:${tasks[0].projectId}`).emit('tasks:reordered', tasks);
    }

    res.status(200).json({ success: true, message: 'Tasks reordered' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const uploadAttachment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const url = `/uploads/${req.file.filename}`;
    task.attachments.push({ filename: req.file.originalname, url });
    await task.save();

    const populated = await populateTask(Task.findById(task._id));
    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
