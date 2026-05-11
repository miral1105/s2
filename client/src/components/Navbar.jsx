import { useAuth } from '../context/AuthContext';
import { Bell, Search, User } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="h-[88px] bg-white/40 backdrop-blur-xl border-b border-white/60 flex items-center justify-between px-8 z-10 sticky top-0 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center bg-white/60 border border-slate-200/50 rounded-2xl px-4 py-2.5 w-72 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white transition-all shadow-sm">
        <Search size={18} className="text-slate-400 mr-3" />
        <input type="text" placeholder="Search anything..." className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400 font-medium" />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-3 bg-white/60 border border-slate-200/50 rounded-2xl text-slate-500 hover:text-primary hover:bg-white hover:shadow-md transition-all">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-4 pl-6 border-l border-slate-200/60">
          <div className="text-right">
            <p className="text-sm font-bold text-primary">{user?.name}</p>
            <p className="text-[11px] font-bold text-secondary uppercase tracking-wider bg-secondary/10 px-2 py-0.5 rounded-lg inline-block mt-0.5">{user?.role}</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-tr from-primary to-primary-light text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg border border-white/20 shadow-primary/20">
            {user?.name?.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
