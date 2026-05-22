import express from 'express';
import {
  getNotifications,
  markAsRead,
  markOneAsRead,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', getNotifications);
router.put('/read-all', markAsRead);
router.put('/:id/read', markOneAsRead);

export default router;
