import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp as useGlobalApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, Send, Clock, CheckCircle, Upload, Loader2 } from 'lucide-react';
import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const ClientDashboard = () => {
  const { user } = useAuth();
  const { packages, fetchPackages, loading } = useGlobalApp();
  const [submittingId, setSubmittingId] = useState(null);
  const [successId, setSuccessId] = useState(null);

  const handleShipRequest = async (pkg) => {
    setSubmittingId(pkg._id);
    try {
      await axiosInstance.post('/ship-requests', {
        packageIds: [pkg._id],
        shippingMethod: 'Air Freight',
        destination: 'Aruba Main Warehouse',
      });
      setSuccessId(pkg._id);
      setTimeout(() => { setSuccessId(null); fetchPackages(); }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create ship request');
    } finally {
      setSubmittingId(null);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const stats = [
    { name: 'My Packages', value: packages.length, icon: Package, color: 'bg-primary', link: '/packages' },
    { name: 'Pending Review', value: packages.filter(p => p.status === 'Pending Invoice Review').length, icon: Clock, color: 'bg-warning', link: '/packages' },
    { name: 'Ready to Ship', value: packages.filter(p => p.status === 'Invoice Approved').length, icon: CheckCircle, color: 'bg-success', link: '/packages' },
    { name: 'Shipped', value: packages.filter(p => p.status === 'Shipped').length, icon: Send, color: 'bg-secondary', link: '/packages' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Welcome, {user?.name}!</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Link to={stat.link} key={stat.name}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.name}</p>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">Recent Packages</h2>
          <button className="text-secondary font-semibold hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tracking #</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Weight</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contents</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">Loading packages...</td>
                </tr>
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">No packages found</td>
                </tr>
              ) : (
                packages.slice(0, 5).map((pkg) => (
                  <tr key={pkg._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-primary">
                      <Link to={`/packages/${pkg._id}`} className="hover:text-secondary hover:underline">
                        {pkg.trackingNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{pkg.weight} lbs</td>
                    <td className="px-6 py-4 text-slate-600">{pkg.contents}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        pkg.status === 'Ready to Send' ? 'bg-slate-100 text-slate-600' :
                        pkg.status === 'Invoice Approved' ? 'bg-success/10 text-success' :
                        pkg.status === 'Invoice Rejected' ? 'bg-red-100 text-red-600' :
                        pkg.status === 'Pending Invoice Review' ? 'bg-warning/10 text-warning' :
                        'bg-secondary/10 text-secondary'
                      }`}>
                        {pkg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {pkg.status === 'Invoice Approved' && (
                        <button
                          onClick={() => handleShipRequest(pkg)}
                          disabled={submittingId === pkg._id || successId === pkg._id}
                          className="btn-primary py-2 px-4 text-sm flex items-center gap-1 disabled:opacity-60"
                        >
                          {submittingId === pkg._id ? <Loader2 size={14} className="animate-spin" /> :
                           successId === pkg._id ? <CheckCircle size={14} /> : <Send size={14} />}
                          {submittingId === pkg._id ? 'Submitting...' : successId === pkg._id ? 'Done!' : 'Ship Request'}
                        </button>
                      )}
                    </td>
                  </tr>
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
