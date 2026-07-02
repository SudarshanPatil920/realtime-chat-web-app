import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model.js';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const username = req.body.username?.trim();

    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required.' });
    }

    const normalizedUsername = username.toLowerCase();
    let user = await User.findOne({ username: normalizedUsername });

    if (!user) {
      user = await User.create({ username: normalizedUsername, isOnline: true, lastSeen: new Date() });
    } else {
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
