import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-10 shadow-2xl relative z-10 border border-white/80"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-light rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="text-white font-bold text-3xl tracking-wider">S2</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Back</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Enter your credentials to access your account.</p>
        </div>

        {error && (
          <div className="bg-danger/10 text-danger p-4 rounded-xl mb-6 text-sm border border-danger/20 font-medium flex items-center gap-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-secondary transition-colors">
                <Mail size={20} />
              </span>
              <input
                type="email"
                required
                className="block w-full pl-12 pr-4 py-4 border border-slate-200/60 rounded-2xl bg-white/60 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none shadow-sm font-medium text-slate-700"
                placeholder="admin@ship2aruba.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-secondary transition-colors">
                <Lock size={20} />
              </span>
              <input
                type="password"
                required
                className="block w-full pl-12 pr-4 py-4 border border-slate-200/60 rounded-2xl bg-white/60 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none shadow-sm font-medium text-slate-700 tracking-widest"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 mt-8 text-lg font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 disabled:hover:translate-y-0 disabled:shadow-none"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-200/60">
          <p className="text-center text-sm font-medium text-slate-500">
            Client accounts are managed by administration.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
