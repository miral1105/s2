import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import axiosInstance from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Search, Filter, Eye, Check, X, AlertCircle, Plus } from 'lucide-react';
import PackageIntakeModal from '../components/PackageIntakeModal';
import toast from 'react-hot-toast';

const AdminPackages = () => {
  const { packages, fetchPackages, loading } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showIntake, setShowIntake] = useState(false);

  useEffect(() => {
    fetchPackages(true);
  }, []);

  const filteredPackages = packages.filter(p => {
    const matchesSearch = p.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleReview = async (status) => {
    try {
      const { data } = await axiosInstance.put(`/packages/${selectedPkg._id}/invoice/review`, {
        reviewStatus: status,
        adminNotes: reviewNotes
      });
      setSelectedPkg(null);
      setReviewNotes('');
      fetchPackages(true);
      toast.success(data?.message || 'Review updated successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update review');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { data } = await axiosInstance.put(`/packages/${id}/status`, { status: newStatus });
      fetchPackages(true);
      toast.success(data?.message || `Status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            All <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Packages</span>
          </h1>
          <p className="text-slate-500 font-medium">Manage intake, reviews, and package status updates.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 py-2.5 px-5 shadow-lg shadow-primary/30" onClick={() => setShowIntake(true)}>
          <Plus size={18} /> Add Package
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-secondary">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by tracking # or client name..."
            className="block w-full pl-12 pr-4 py-3.5 border border-slate-200/60 rounded-2xl bg-white/60 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none shadow-sm font-medium text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-secondary">
            <Filter size={18} />
          </span>
          <select
            className="block w-full pl-12 pr-4 py-3.5 border border-slate-200/60 rounded-2xl bg-white/60 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all appearance-none outline-none shadow-sm font-medium text-slate-700 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Ready to Send">Ready to Send</option>
            <option value="Pending Invoice Review">Pending Review</option>
            <option value="Invoice Approved">Invoice Approved</option>
            <option value="Invoice Rejected">Invoice Rejected</option>
            <option value="Ship Requested">Ship Requested</option>
            <option value="Shipped">Shipped</option>
            <option value="Ready for Pickup">Ready for Pickup</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden border border-white/80">
        <div className="overflow-x-auto bg-white/20">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200/60">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Tracking #</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Client</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Invoice</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredPackages.map((pkg, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  key={pkg._id} 
                  className="hover:bg-white/60 transition-colors group"
                >
                  <td className="px-8 py-6 font-bold text-primary flex items-center gap-2">
                    <Package size={16} className="text-slate-400 group-hover:text-secondary transition-colors" />
                    {pkg.trackingNumber}
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-slate-800">{pkg.client?.name}</div>
                    <div className="text-xs text-slate-500 font-medium">Suite: {pkg.client?.suiteNumber}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border ${
                      pkg.status === 'Ready to Send' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                      pkg.status === 'Invoice Approved' ? 'bg-success/10 text-success border-success/20' :
                      pkg.status === 'Invoice Rejected' ? 'bg-red-100 text-red-600 border-red-200' :
                      pkg.status === 'Pending Invoice Review' ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-secondary/10 text-secondary border-secondary/20'
                    }`}>
                      {pkg.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {pkg.invoice ? (
                      <button
                        onClick={() => setSelectedPkg(pkg)}
                        className="text-secondary hover:underline flex items-center gap-1.5 font-bold text-sm bg-secondary/10 px-3 py-1.5 rounded-lg border border-secondary/20 hover:bg-secondary/20 transition-colors"
                      >
                        <Eye size={16} /> Review
                      </button>
                    ) : (
                      <span className="text-slate-400 text-sm italic font-medium">Not uploaded</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    {['Ship Requested', 'Shipped', 'Ready for Pickup'].includes(pkg.status) ? (
                      <div className="relative inline-block w-40">
                        <select
                          className="appearance-none text-sm border border-slate-200/60 font-medium rounded-xl w-full pl-3 pr-8 py-2 bg-white/80 focus:ring-2 focus:ring-secondary/20 focus:border-secondary cursor-pointer shadow-sm outline-none"
                          value={pkg.status}
                          onChange={(e) => handleStatusChange(pkg._id, e.target.value)}
                        >
                          <option value="Ship Requested" disabled>Ship Requested</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Ready for Pickup">Ready for Pickup</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    ) : <span className="text-slate-400 px-2">—</span>}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal - Image Only */}
      <AnimatePresence>
        {selectedPkg && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/30 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedPkg(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 flex items-center justify-between bg-primary text-white border-b border-primary-light">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner">
                    <Eye size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-wide">Review Invoice</h3>
                    <p className="text-sm text-white/70 font-medium">{selectedPkg.trackingNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPkg(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/5"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="bg-slate-100">
                {selectedPkg.invoice?.fileUrl?.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${selectedPkg.invoice.fileUrl}`}
                    className="w-full h-[70vh]"
                    title="Invoice PDF"
                  />
                ) : (
                  <img
                    src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${selectedPkg.invoice.fileUrl}`}
                    alt="Invoice"
                    className="w-full object-contain max-h-[70vh]"
                  />
                )}
              </div>

              {/* Modal Footer with Approve/Reject Buttons */}
              {selectedPkg.status === 'Pending Invoice Review' && (
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      handleStatusChange(selectedPkg._id, 'Invoice Rejected');
                      setSelectedPkg(null);
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all shadow-lg"
                  >
                    <X size={18} /> Reject Invoice
                  </button>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedPkg._id, 'Invoice Approved');
                      setSelectedPkg(null);
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-success text-white font-bold hover:bg-success/90 transition-all shadow-lg"
                  >
                    <Check size={18} /> Approve Invoice
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <PackageIntakeModal
        isOpen={showIntake}
        onClose={() => setShowIntake(false)}
        onPackageAdded={() => { fetchPackages(true); setShowIntake(false); }}
      />
    </div>
  );
};

export default AdminPackages;
