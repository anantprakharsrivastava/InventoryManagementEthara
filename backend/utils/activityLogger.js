import Activity from '../models/Activity.js';

export const logActivity = async ({ user, action, entityType, entityId, project, metadata = {} }) => {
  try {
    await Activity.create({
      user,
      action,
      entityType,
      entityId,
      project,
      metadata,
    });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};
