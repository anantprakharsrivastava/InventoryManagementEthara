import Notification from '../models/Notification.js';

export const createNotification = async (io, data) => {
  const notification = await Notification.create(data);

  if (io) {
    io.to(`user:${data.recipient}`).emit('notification', notification);
  }

  return notification;
};
