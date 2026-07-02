import { Server, Socket } from 'socket.io';
import { User } from '../models/user.model.js';
import { Message } from '../models/message.model.js';

export const registerSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    const username = socket.handshake.auth.username as string | undefined;
    const normalizedAuthUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';

    if (normalizedAuthUsername) {
      socket.data.username = normalizedAuthUsername;
      socket.data.socketId = socket.id;
      void User.findOneAndUpdate(
        { username: normalizedAuthUsername },
        { isOnline: true, lastSeen: new Date() },
        { upsert: true, new: true },
      );
    }

    socket.on('join', async (userName: string) => {
      const normalized = String(userName || '').trim().toLowerCase();
      if (!normalized) return;

      await User.findOneAndUpdate(
        { username: normalized },
        { isOnline: true, lastSeen: new Date() },
        { upsert: true, new: true },
      );

      socket.join(normalized);
      socket.data.username = normalized;
      socket.data.socketId = socket.id;
      io.emit('user_online', { username: normalized });
      io.emit('presence_update', { username: normalized, isOnline: true, lastSeen: new Date() });
    });

    socket.on('send_message', async ({ username, message }, callback) => {
      const trimmedMessage = String(message || '').trim();
      if (!trimmedMessage || !username) return;

      const createdMessage = await Message.create({
        username: String(username).trim().toLowerCase(),
        message: trimmedMessage,
        status: 'delivered',
      });

      io.emit('receive_message', createdMessage);
      if (typeof callback === 'function') {
        callback(createdMessage);
      }
    });

    socket.on('typing_start', ({ username }) => {
      socket.broadcast.emit('typing_start', { username });
    });

    socket.on('typing_stop', ({ username }) => {
      socket.broadcast.emit('typing_stop', { username });
    });

    socket.on('disconnect', async () => {
      const currentUsername = typeof socket.data.username === 'string' ? socket.data.username : undefined;
      if (currentUsername) {
        await User.findOneAndUpdate(
          { username: currentUsername },
          { isOnline: false, lastSeen: new Date() },
          { new: true },
        );
        io.emit('user_offline', { username: currentUsername });
        io.emit('presence_update', { username: currentUsername, isOnline: false, lastSeen: new Date() });
      }
    });
  });
};
