import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Send,
  Users,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const adminLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'All Packages', icon: Package, path: '/admin/packages' },
    { name: 'Clients', icon: Users, path: '/admin/clients' },
  ];

  const clientLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'My Packages', icon: Package, path: '/packages' },
  ];

  const links = user?.role === 'Admin' ? adminLinks : clientLinks;

  return (
    <div className="w-72 bg-gradient-to-b from-primary to-primary-dark text-white flex flex-col shadow-[4px_0_24px_rgba(30,58,95,0.15)] relative z-20 border-r border-white/5">
      <div className="p-8 flex items-center gap-4 border-b border-white/10">
        <div className="w-12 h-12 bg-gradient-to-tr from-secondary to-accent rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-secondary/20 border border-white/20">S2</div>
        <div>
          <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">Ship2Aruba</span>
          <p className="text-xs text-primary-light font-medium uppercase tracking-widest mt-1">Logistics</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4 px-3">Menu</div>
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isActive ? 'bg-white/10 shadow-lg border border-white/10' : 'hover:bg-white/5'
                }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebarActiveBg"
                  className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-transparent opacity-50"
                />
              )}
              <div className="flex items-center gap-3 relative z-10">
                <link.icon size={22} className={`transition-colors ${isActive ? 'text-accent' : 'text-slate-400 group-hover:text-white'}`} />
                <span className={`font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{link.name}</span>
              </div>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative z-10"
                >
                  <ChevronRight size={18} className="text-accent" />
                </motion.div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/10 bg-black/10 backdrop-blur-md">
        <button
          onClick={logout}
          className="flex items-center gap-3 p-3 w-full rounded-2xl hover:bg-danger/20 hover:text-red-400 text-slate-300 transition-all group"
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
