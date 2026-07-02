import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../../shared/services/api';
import { useAuthStore } from './auth.store';

export const AuthScreen = () => {
  const [username, setUsername] = useState('');
  const setAuthUsername = useAuthStore((state) => state.setUsername);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      toast.error('Please enter a username to continue.');
      return;
    }

    try {
      const response = await api.post('/auth/login', { username: trimmed });
      setAuthUsername(response.data.data.user.username);
      toast.success(`Welcome, ${trimmed}!`);
      navigate('/chat');
    } catch {
      toast.error('Unable to sign in right now.');
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.24),_transparent_40%),linear-gradient(135deg,_#020617,_#0f172a)] p-4 text-slate-50 sm:p-6 lg:p-8">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center">
        <section className="grid items-center gap-8 rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
              <Sparkles size={16} />
              Premium real-time collaboration
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">NovaChat for modern teams.</h1>
              <p className="max-w-xl text-lg text-slate-300">A polished, production-style messaging experience with instant presence, resilient persistence, and a thoughtful interface.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4">
              <label className="block text-sm font-medium text-slate-300" htmlFor="username">Choose your username</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input id="username" value={username} onChange={(event) => setUsername(event.target.value)} className="flex-1 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400" placeholder="Enter your username" autoFocus />
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-3 font-medium text-white transition hover:opacity-90">Continue <ArrowRight size={18} /></button>
              </div>
            </form>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-inner shadow-slate-950/50">
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">Connected • Realtime • Persistent</div>
              <div className="space-y-3">
                <div className="rounded-2xl bg-slate-800/80 p-4">
                  <p className="text-sm text-slate-400">Today</p>
                  <p className="mt-2 font-medium text-slate-100">Alex: The launch review is live.</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-r from-cyan-500/20 to-violet-500/20 p-4">
                  <p className="text-sm text-slate-400">Now</p>
                  <p className="mt-2 font-medium text-slate-100">You are online and ready to chat.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
};
