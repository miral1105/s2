import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Package, Users, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { packages, fetchPackages, loading } = useApp();

  useEffect(() => {
    fetchPackages(true);
  }, []);

  const stats = [
    { name: 'Total Packages', value: packages.length, icon: Package, color: 'bg-gradient-to-br from-primary to-primary-light shadow-primary/30', link: '/admin/packages' },
    { name: 'Active Clients', value: new Set(packages.map(p => p.client?._id)).size, icon: Users, color: 'bg-gradient-to-br from-secondary to-accent shadow-secondary/30', link: '/admin/clients' },
    { name: 'Pending Invoices', value: packages.filter(p => p.status === 'Pending Invoice Review').length, icon: FileText, color: 'bg-gradient-to-br from-warning to-amber-400 shadow-warning/30', link: '/admin/packages' },
    { name: 'Ready to Ship', value: packages.filter(p => p.status === 'Invoice Approved').length, icon: TrendingUp, color: 'bg-gradient-to-br from-success to-emerald-400 shadow-success/30', link: '/admin/packages' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">
          Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Control Center</span>
        </h1>
        <p className="text-slate-500 font-medium">Overview of all current operations and metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Link to={stat.link} key={stat.name} className="block group">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
              className="glass-card relative overflow-hidden p-6 hover:-translate-y-2 transition-all duration-300 border-t-4"
              style={{ borderTopColor: 'transparent' }}
            >
              {/* Decorative blob */}
              <div className={`absolute -right-6 -bottom-6 w-32 h-32 ${stat.color} rounded-full opacity-5 blur-2xl group-hover:opacity-15 transition-opacity`}></div>
              
              <div className="flex flex-col gap-5">
                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                  <stat.icon size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.name}</p>
                  <p className="text-4xl font-extrabold text-slate-800">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 border border-white/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Recent Operations</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Latest package status updates</p>
            </div>
            <Link to="/admin/packages" className="text-secondary font-bold hover:underline flex items-center text-sm">
              View all <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {packages.slice(0, 5).map((pkg, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={pkg._id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/60 hover:bg-white/90 border border-slate-100 shadow-sm rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 tracking-wide">{pkg.trackingNumber}</p>
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                      <Users size={14} /> {pkg.client?.name} <span className="text-slate-300">•</span> Suite {pkg.client?.suiteNumber}
                    </p>
                  </div>
                </div>
                <div className="mt-3 sm:mt-0">
                  <span className={`px-4 py-1.5 text-xs font-bold rounded-full shadow-sm border ${
                    pkg.status === 'Ready to Send' ? 'bg-white text-slate-600 border-slate-200' :
                    pkg.status === 'Invoice Approved' ? 'bg-success/10 text-success border-success/20' :
                    pkg.status === 'Invoice Rejected' ? 'bg-red-100 text-red-600 border-red-200' :
                    pkg.status === 'Pending Invoice Review' ? 'bg-warning/10 text-warning border-warning/20' :
                    'bg-secondary/10 text-secondary border-secondary/20'
                  }`}>
                    {pkg.status}
                  </span>
                </div>
              </motion.div>
            ))}
            {packages.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-medium">No operations found.</div>
            )}
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-b from-primary to-primary-dark text-white shadow-xl shadow-primary/20 border border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-secondary rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
          
          <div className="relative z-10 w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg group-hover:scale-110 transition-transform duration-500">
            <Package size={48} className="text-accent" />
          </div>
          
          <div className="relative z-10 space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">New Package Intake</h3>
            <p className="text-white/70 font-medium px-4">Log a new incoming package securely to a client's suite</p>
          </div>
          
          <button className="relative z-10 bg-gradient-to-r from-secondary to-accent hover:from-accent hover:to-secondary text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-secondary/30 hover:shadow-xl hover:-translate-y-1 active:scale-95 w-full max-w-[200px] flex items-center justify-center gap-2">
            Start Intake <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
