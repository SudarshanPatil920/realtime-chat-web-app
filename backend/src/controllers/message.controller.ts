import { Request, Response, NextFunction } from 'express';
import { Message } from '../models/message.model.js';

export const createMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, message } = req.body;
    const trimmedMessage = message?.trim();

    if (!username || !trimmedMessage) {
      return res.status(400).json({ success: false, message: 'Username and a non-empty message are required.' });
    }

    const createdMessage = await Message.create({
      username: String(username).trim().toLowerCase(),
      message: trimmedMessage,
      status: 'delivered',
    });

    return res.status(201).json({ success: true, data: createdMessage });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 }).limit(200);
    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};
