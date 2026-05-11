import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp as useGlobalApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, Send, Clock, CheckCircle, Upload, Loader2, ArrowRight } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const ClientDashboard = () => {
  const { user } = useAuth();
  const { packages, fetchPackages, loading } = useGlobalApp();
  const [submittingId, setSubmittingId] = useState(null);
  const [successId, setSuccessId] = useState(null);

  const handleShipRequest = async (pkg) => {
    setSubmittingId(pkg._id);
    try {
      const { data } = await axiosInstance.post('/ship-requests', {
        packageIds: [pkg._id],
        shippingMethod: 'Air Freight',
        destination: 'Aruba Main Warehouse',
      });
      setSuccessId(pkg._id);
      toast.success(data?.message || 'Ship request created successfully');
      setTimeout(() => { setSuccessId(null); fetchPackages(); }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ship request');
    } finally {
      setSubmittingId(null);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const stats = [
    { name: 'My Packages', value: packages.length, icon: Package, color: 'bg-gradient-to-br from-primary to-primary-light shadow-primary/30', link: '/packages' },
    { name: 'Pending Review', value: packages.filter(p => p.status === 'Pending Invoice Review').length, icon: Clock, color: 'bg-gradient-to-br from-warning to-amber-400 shadow-warning/30', link: '/packages' },
    { name: 'Ready to Ship', value: packages.filter(p => p.status === 'Invoice Approved').length, icon: CheckCircle, color: 'bg-gradient-to-br from-success to-emerald-400 shadow-success/30', link: '/packages' },
    { name: 'Shipped', value: packages.filter(p => p.status === 'Shipped').length, icon: Send, color: 'bg-gradient-to-br from-secondary to-accent shadow-secondary/30', link: '/packages' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{user?.name}</span>!
        </h1>
        <p className="text-slate-500 font-medium">Here is what's happening with your packages today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Link to={stat.link} key={stat.name} className="block group">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
              className="glass-card relative overflow-hidden p-6 hover:-translate-y-2 transition-all duration-300"
            >
              {/* Decorative background blob */}
              <div className={`absolute -right-6 -top-6 w-24 h-24 ${stat.color} rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
              
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{stat.name}</p>
                  <p className="text-4xl font-extrabold text-slate-800">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                  <stat.icon size={28} strokeWidth={2.5} />
                </div>
              </div>
              <div className="mt-6 flex items-center text-sm font-semibold text-secondary group-hover:text-primary transition-colors">
                View Details <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="glass-card overflow-hidden border border-white/80">
        <div className="p-8 border-b border-slate-100/50 flex items-center justify-between bg-white/40">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Recent Packages</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Your latest registered shipments</p>
          </div>
          <Link to="/packages" className="btn-secondary py-2 px-5 rounded-xl text-sm shadow-sm hover:shadow-md">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto bg-white/20">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200/60">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Tracking #</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Weight</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Contents</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-16 text-center">
                    <Loader2 className="animate-spin mx-auto text-secondary mb-4" size={32} />
                    <p className="text-slate-400 font-medium">Loading your packages...</p>
                  </td>
                </tr>
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-16 text-center text-slate-400">
                    <Package size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="font-medium text-lg text-slate-500">No packages found</p>
                  </td>
                </tr>
              ) : (
                packages.slice(0, 5).map((pkg, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={pkg._id} 
                    className="hover:bg-white/60 transition-colors group"
                  >
                    <td className="px-8 py-6 font-bold text-primary">
                      <Link to={`/packages/${pkg._id}`} className="hover:text-secondary hover:underline flex items-center gap-2">
                        <Package size={16} className="text-slate-400 group-hover:text-secondary transition-colors" />
                        {pkg.trackingNumber}
                      </Link>
                    </td>
                    <td className="px-8 py-6 font-medium text-slate-600">{pkg.weight} lbs</td>
                    <td className="px-8 py-6 font-medium text-slate-600">{pkg.contents}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                        pkg.status === 'Ready to Send' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                        pkg.status === 'Invoice Approved' ? 'bg-success/10 text-success border border-success/20' :
                        pkg.status === 'Invoice Rejected' ? 'bg-red-100 text-red-600 border border-red-200' :
                        pkg.status === 'Pending Invoice Review' ? 'bg-warning/10 text-warning border border-warning/20' :
                        'bg-secondary/10 text-secondary border border-secondary/20'
                      }`}>
                        {pkg.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {pkg.status === 'Invoice Approved' && (
                        <button
                          onClick={() => handleShipRequest(pkg)}
                          disabled={submittingId === pkg._id || successId === pkg._id}
                          className="btn-primary py-2 px-5 text-sm flex items-center gap-2 disabled:opacity-60 shadow-md"
                        >
                          {submittingId === pkg._id ? <Loader2 size={16} className="animate-spin" /> :
                           successId === pkg._id ? <CheckCircle size={16} /> : <Send size={16} />}
                          {submittingId === pkg._id ? 'Submitting...' : successId === pkg._id ? 'Done!' : 'Ship Request'}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
