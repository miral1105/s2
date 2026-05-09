import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Package, Users, FileText, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { packages, fetchPackages, loading } = useApp();

  useEffect(() => {
    fetchPackages(true);
  }, []);

  const stats = [
    { name: 'Total Packages', value: packages.length, icon: Package, color: 'bg-primary' },
    { name: 'Active Clients', value: new Set(packages.map(p => p.client?._id)).size, icon: Users, color: 'bg-secondary' },
    { name: 'Pending Invoices', value: packages.filter(p => p.status === 'Pending Invoice Review').length, icon: FileText, color: 'bg-warning' },
    { name: 'Ready to Ship', value: packages.filter(p => p.status === 'Invoice Approved').length, icon: TrendingUp, color: 'bg-success' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Admin Control Center</h1>
        <p className="text-slate-500">Overview of all operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex flex-col gap-4 border-l-4 border-l-secondary"
          >
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.name}</p>
              <p className="text-3xl font-bold text-primary mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-primary mb-6">Recent Operations</h2>
          <div className="space-y-4">
            {packages.slice(0, 5).map((pkg) => (
              <div key={pkg._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <div>
                    <p className="font-bold text-primary">{pkg.trackingNumber}</p>
                    <p className="text-xs text-slate-500">{pkg.client?.name} (Suite: {pkg.client?.suiteNumber})</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-600">
                  {pkg.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col items-center justify-center text-center space-y-4 bg-primary text-white">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
            <Package size={40} className="text-secondary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">New Package Intake</h3>
            <p className="text-white/70 mt-1">Register a new incoming package to a client's suite</p>
          </div>
          <button className="bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg">
            Start Intake
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
