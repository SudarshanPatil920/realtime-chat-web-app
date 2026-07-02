import { Router } from 'express';
import { getOnlineUsers } from '../controllers/user.controller.js';

const router = Router();
router.get('/online', getOnlineUsers);

export default router;
