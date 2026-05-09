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
    <div className="w-64 bg-primary text-white flex flex-col shadow-2xl">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center font-bold text-xl">S2</div>
        <span className="font-bold text-xl tracking-tight">Ship2Aruba</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 group ${isActive ? 'bg-secondary shadow-lg' : 'hover:bg-white/10'
                }`}
            >
              <div className="flex items-center gap-3">
                <link.icon size={20} className={isActive ? 'text-white' : 'text-secondary'} />
                <span className="font-medium">{link.name}</span>
              </div>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <ChevronRight size={16} />
                </motion.div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 p-3 w-full rounded-xl hover:bg-danger/20 hover:text-danger transition-colors group"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
