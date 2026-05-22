import Message from '../models/Message.js';
import Project from '../models/Project.js';
import { paginate, paginationMeta } from '../utils/pagination.js';

export const getMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (req.user.role !== 'admin' && !project.isMember(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const filter = { project: projectId };
    const total = await Message.countDocuments(filter);

    const { query, page: pageNum, limit: limitNum } = paginate(
      Message.find(filter)
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 }),
      page,
      limit
    );

    const messages = await query;

    res.status(200).json({
      success: true,
      data: messages.reverse(),
      pagination: paginationMeta(total, pageNum, limitNum),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (req.user.role !== 'admin' && !project.isMember(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const message = await Message.create({
      project: projectId,
      sender: req.user._id,
      content,
    });

    const populated = await Message.findById(message._id).populate('sender', 'name avatar');

    const io = req.app.get('io');
    io.to(`project:${projectId}`).emit('chat:message', populated);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
