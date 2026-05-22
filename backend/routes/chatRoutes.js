import express from 'express';
import { getMessages, sendMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/:projectId', getMessages);
router.post('/:projectId', sendMessage);

export default router;
