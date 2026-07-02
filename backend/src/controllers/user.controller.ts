import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model.js';

export const getOnlineUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({ isOnline: true }).sort({ updatedAt: -1 }).limit(100);
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};
