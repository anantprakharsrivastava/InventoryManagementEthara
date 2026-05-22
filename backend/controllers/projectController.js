import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { logActivity } from '../utils/activityLogger.js';
import { createNotification } from '../utils/notify.js';
import { paginate, paginationMeta } from '../utils/pagination.js';

const populateProject = (query) =>
  query
    .populate('createdBy', 'name email avatar')
    .populate('members.user', 'name email avatar role')
    .populate('admins', 'name email avatar');

export const getProjects = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 12 } = req.query;
    let filter = {};

    if (req.user.role !== 'admin') {
      filter = {
        $or: [
          { createdBy: req.user._id },
          { 'members.user': req.user._id },
        ],
      };
    }

    if (status) filter.status = status;
    if (search) {
      filter.$text = { $search: search };
    }

    const total = await Project.countDocuments(filter);
    const { query: paginatedQuery, page: pageNum, limit: limitNum } = paginate(
      populateProject(Project.find(filter).sort({ updatedAt: -1 })),
      page,
      limit
    );

    const projects = await paginatedQuery;

    res.status(200).json({
      success: true,
      data: projects,
      pagination: paginationMeta(total, pageNum, limitNum),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await populateProject(Project.findById(req.params.id));
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (req.user.role !== 'admin' && !project.isMember(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const taskStats = await Task.aggregate([
      { $match: { project: project._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.status(200).json({ success: true, data: project, taskStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, description, status, dueDate, color, members = [] } = req.body;

    const memberList = members.map((m) => ({
      user: m.user || m,
      role: m.role || 'member',
    }));

    memberList.push({ user: req.user._id, role: 'admin' });

    const project = await Project.create({
      title,
      description,
      status,
      dueDate,
      color,
      createdBy: req.user._id,
      members: memberList,
      admins: [req.user._id],
    });

    const populated = await populateProject(Project.findById(project._id));

    await logActivity({
      user: req.user._id,
      action: 'created project',
      entityType: 'project',
      entityId: project._id,
      project: project._id,
      metadata: { title },
    });

    const io = req.app.get('io');
    for (const m of memberList) {
      if (m.user.toString() !== req.user._id.toString()) {
        await createNotification(io, {
          recipient: m.user,
          sender: req.user._id,
          type: 'project_invite',
          title: 'Project Invitation',
          message: `You were added to project "${title}"`,
          link: `/projects/${project._id}`,
          project: project._id,
        });
      }
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const canEdit =
      req.user.role === 'admin' ||
      project.isProjectAdmin(req.user._id);

    if (!canEdit) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const allowed = ['title', 'description', 'status', 'dueDate', 'color'];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) project[key] = req.body[key];
    });

    await project.save();
    project = await populateProject(Project.findById(project._id));

    await logActivity({
      user: req.user._id,
      action: 'updated project',
      entityType: 'project',
      entityId: project._id,
      project: project._id,
    });

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (req.user.role !== 'admin' && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (req.user.role !== 'admin' && !project.isProjectAdmin(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (project.members.some((m) => m.user.toString() === userId)) {
      return res.status(400).json({ success: false, message: 'User already a member' });
    }

    project.members.push({ user: userId, role });
    if (role === 'admin') {
      project.admins = [...(project.admins || []), userId];
    }
    await project.save();

    const io = req.app.get('io');
    await createNotification(io, {
      recipient: userId,
      sender: req.user._id,
      type: 'project_invite',
      title: 'Added to Project',
      message: `You were added to "${project.title}"`,
      link: `/projects/${project._id}`,
      project: project._id,
    });

    const populated = await populateProject(Project.findById(project._id));
    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (req.user.role !== 'admin' && !project.isProjectAdmin(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    project.members = project.members.filter((m) => m.user.toString() !== userId);
    project.admins = project.admins?.filter((a) => a.toString() !== userId);
    await project.save();

    const populated = await populateProject(Project.findById(project._id));
    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search
      ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] }
      : {};

    const users = await User.find(filter).select('name email avatar role').limit(20);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
