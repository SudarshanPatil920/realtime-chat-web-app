import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Circle, MoonStar, Sparkles, SunMedium, Wifi, WifiOff } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../auth/auth.store';
import { useNavigate } from 'react-router-dom';
import { api } from '../../shared/services/api';
import { formatTime } from '../../shared/utils/format';

type MessageStatus = 'sent' | 'delivered' | 'read';

interface MessageItem {
  _id: string;
  username: string;
  message: string;
  status?: MessageStatus;
  createdAt: string;
}

interface PresenceItem {
  username: string;
  isOnline: boolean;
  lastSeen: string;
}

export const ChatScreen = () => {
  const username = useAuthStore((state) => state.username);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [draft, setDraft] = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<PresenceItem[]>([]);
  const [isDark, setIsDark] = useState(true);
  const [connectionState, setConnectionState] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');
  const socketRef = useRef<Socket | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const statusTimeoutsRef = useRef<number[]>([]);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      statusTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  const upsertMessage = (incomingMessage: MessageItem) => {
    setMessages((prev) => {
      const existingIndex = prev.findIndex((existing) => existing._id === incomingMessage._id || (existing._id.startsWith('temp-') && existing.username === incomingMessage.username && existing.message === incomingMessage.message));
      if (existingIndex >= 0) {
        const nextMessages = [...prev];
        nextMessages[existingIndex] = {
          ...nextMessages[existingIndex],
          ...incomingMessage,
          status: incomingMessage.status ?? nextMessages[existingIndex].status ?? 'delivered',
        };
        return nextMessages;
      }
      return [...prev, incomingMessage];
    });
  };

  const scheduleStatusUpdate = (messageId: string, status: MessageStatus, delay: number) => {
    const timeoutId = window.setTimeout(() => {
      setMessages((prev) => prev.map((message) => (message._id === messageId ? { ...message, status } : message)));
    }, delay);
    statusTimeoutsRef.current.push(timeoutId);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [messagesResponse, usersResponse] = await Promise.all([
          api.get('/messages'),
          api.get('/users/online'),
        ]);
        setMessages(messagesResponse.data.data || []);
        setOnlineUsers(usersResponse.data.data || []);
      } catch {
        toast.error('Unable to load the conversation.');
      }
    };

    void fetchInitialData();
  }, []);

  useEffect(() => {
    const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
    const socketUrl = env?.VITE_SOCKET_URL || undefined;
    const socket = io(socketUrl, {
      auth: { username },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionState('connected');
      socket.emit('join', username);
    });
    socket.on('connect_error', () => setConnectionState('disconnected'));
    socket.on('reconnecting', () => setConnectionState('reconnecting'));
    socket.on('reconnect', () => setConnectionState('connected'));
    socket.on('receive_message', (message: MessageItem) => {
      upsertMessage(message);
    });
    socket.on('typing_start', ({ username: activeUsername }: { username: string }) => {
      if (activeUsername !== username) setTypingUser(activeUsername);
    });
    socket.on('typing_stop', ({ username: activeUsername }: { username: string }) => {
      if (activeUsername === typingUser) setTypingUser(null);
    });
    socket.on('user_online', ({ username: activeUsername }: { username: string }) => {
      setOnlineUsers((prev) => {
        if (prev.some((user) => user.username === activeUsername)) return prev;
        return [...prev, { username: activeUsername, isOnline: true, lastSeen: new Date().toISOString() }];
      });
    });
    socket.on('user_offline', ({ username: activeUsername }: { username: string }) => {
      setOnlineUsers((prev) => prev.map((user) => (user.username === activeUsername ? { ...user, isOnline: false, lastSeen: new Date().toISOString() } : user)));
    });

    return () => {
      socket.disconnect();
    };
  }, [username, typingUser]);

  useEffect(() => {
    messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || !username) return;

    const optimisticMessage: MessageItem = {
      _id: `temp-${Date.now()}`,
      username,
      message: trimmed,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setDraft('');
    socketRef.current?.emit('typing_stop', { username });

    socketRef.current?.emit('send_message', { username, message: trimmed }, (createdMessage: MessageItem) => {
      upsertMessage({ ...createdMessage, status: 'delivered' });
      scheduleStatusUpdate(createdMessage._id, 'read', 1400);
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (!socketRef.current) return;
    if (value.trim()) {
      socketRef.current.emit('typing_start', { username });
    } else {
      socketRef.current.emit('typing_stop', { username });
    }
  };

  const currentUser = username || 'You';

  const sortedUsers = useMemo(() => [...onlineUsers].sort((a, b) => Number(b.isOnline) - Number(a.isOnline)), [onlineUsers]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'}`}>
      <Toaster position="top-right" />
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-3 py-3 sm:px-4 lg:px-6">
        <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-[24px] border px-4 py-4 shadow-lg backdrop-blur ${isDark ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white/80'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 p-3 text-white">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-lg font-semibold">NovaChat</p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Realtime • Secure • Beautiful</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'}`}>
                {connectionState === 'connected' ? <Wifi size={16} className="text-emerald-400" /> : connectionState === 'reconnecting' ? <Wifi size={16} className="text-amber-400" /> : <WifiOff size={16} className="text-rose-400" />}
                {connectionState === 'connected' ? 'Connected' : connectionState === 'reconnecting' ? 'Reconnecting' : 'Disconnected'}
              </div>
              <button onClick={() => setIsDark((value) => !value)} className={`rounded-full p-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                {isDark ? <SunMedium size={16} /> : <MoonStar size={16} />}
              </button>
              <button
                onClick={() => {
                  // Disconnect socket and clear session
                  try {
                    socketRef.current?.disconnect();
                  } catch {
                    /* ignore */
                  }
                  clearSession();
                  navigate('/');
                }}
                className={`ml-2 rounded-full px-3 py-1 text-sm ${isDark ? 'bg-slate-800/70 text-slate-200' : 'bg-slate-100 text-slate-700'}`}
              >
                Logout
              </button>
            </div>
          </div>
        </motion.header>

        <main className="mt-4 grid flex-1 gap-4 lg:grid-cols-[1.15fr_0.35fr]">
          <section className={`flex min-h-[70vh] flex-col overflow-hidden rounded-[28px] border shadow-xl ${isDark ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white/90'}`}>
            <div className={`border-b px-4 py-3 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{currentUser}</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{typingUser ? `${typingUser} is typing...` : 'Ready to collaborate'}</p>
                </div>
                <div className={`rounded-full px-3 py-1 text-sm ${isDark ? 'bg-emerald-400/10 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                  Online now
                </div>
              </div>
            </div>
            <div ref={messageListRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message) => {
                const isOwn = message.username === username;
                return (
                  <motion.div key={message._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-[22px] px-4 py-3 shadow ${isOwn ? 'rounded-br-md bg-gradient-to-r from-cyan-500 to-violet-500 text-white' : isDark ? 'rounded-bl-md bg-slate-800 text-slate-100' : 'rounded-bl-md bg-slate-100 text-slate-900'}`}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] opacity-80">
                        <span>{message.username}</span>
                        <div className="flex items-center gap-2">
                          <span>{formatTime(message.createdAt)}</span>
                          {isOwn ? (
                            <span
                              className={`text-[12px] leading-none ${message.status === 'read' ? 'text-cyan-200' : message.status === 'delivered' ? 'text-white/80' : 'text-white/70'}`}
                              aria-label={message.status === 'read' ? 'Read' : message.status === 'delivered' ? 'Delivered' : 'Sent'}
                            >
                              {message.status === 'read' || message.status === 'delivered' ? '✓✓' : '✓'}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6">{message.message}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className={`border-t px-4 py-3 ${isDark ? 'border-white/10 bg-slate-950/60' : 'border-slate-200 bg-slate-50/80'}`}>
              <div className={`rounded-[24px] border p-3 ${isDark ? 'border-white/10 bg-slate-900/80' : 'border-slate-200 bg-white'}`}>
                <textarea value={draft} onChange={(event) => handleDraftChange(event.target.value)} onKeyDown={handleKeyDown} rows={3} className={`w-full resize-none border-none bg-transparent text-sm outline-none ${isDark ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}`} placeholder="Message everyone..." />
                <div className="mt-3 flex items-center justify-between">
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Press Enter to send · Shift + Enter for a new line</p>
                  <button onClick={() => void handleSend()} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-3 py-2 text-sm font-medium text-white">
                    <ArrowUp size={16} /> Send
                  </button>
                </div>
              </div>
            </div>
          </section>

          <aside className={`rounded-[28px] border p-4 shadow-xl ${isDark ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white/90'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Team Presence</h2>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Live connection and availability</p>
              </div>
              <div className={`rounded-full px-3 py-1 text-xs ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>{sortedUsers.length} users</div>
            </div>
            <div className="mt-4 space-y-3">
              {sortedUsers.map((user) => (
                <div key={user.username} className={`flex items-center justify-between rounded-2xl px-3 py-3 ${isDark ? 'bg-slate-800/80' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full font-semibold ${isDark ? 'bg-slate-700 text-slate-100' : 'bg-slate-200 text-slate-800'}`}>{user.username.slice(0, 1).toUpperCase()}</div>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.isOnline ? 'Online now' : 'Offline'}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${user.isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Circle size={10} fill="currentColor" />
                    {user.isOnline ? 'Live' : 'Away'}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};
