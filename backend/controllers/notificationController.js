import Notification from '../models/Notification.js';
import { paginate, paginationMeta } from '../utils/pagination.js';

export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = { recipient: req.user._id };
    const total = await Notification.countDocuments(filter);

    const { query, page: pageNum, limit: limitNum } = paginate(
      Notification.find(filter)
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 }),
      page,
      limit
    );

    const notifications = await query;
    const unreadCount = await Notification.countDocuments({ ...filter, read: false });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: paginationMeta(total, pageNum, limitNum),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markOneAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
