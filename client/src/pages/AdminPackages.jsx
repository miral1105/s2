import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import axiosInstance from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Search, Filter, Eye, Check, X, AlertCircle, Plus } from 'lucide-react';
import PackageIntakeModal from '../components/PackageIntakeModal';

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
      await axiosInstance.put(`/packages/${selectedPkg._id}/invoice/review`, {
        reviewStatus: status,
        adminNotes: reviewNotes
      });
      setSelectedPkg(null);
      setReviewNotes('');
      fetchPackages(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axiosInstance.put(`/packages/${id}/status`, { status: newStatus });
      fetchPackages(true);
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">All Packages</h1>
          <p className="text-slate-500">Manage intake, reviews, and status updates</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowIntake(true)}>
          <Plus size={18} /> Add Package
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by tracking # or client name..."
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white focus:ring-secondary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-64">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Filter size={18} />
          </span>
          <select
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white focus:ring-secondary transition-all appearance-none outline-none"
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

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tracking #</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPackages.map((pkg) => (
              <tr key={pkg._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-primary">{pkg.trackingNumber}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900">{pkg.client?.name}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${pkg.status === 'Ready to Send' ? 'bg-slate-100 text-slate-600' :
                      pkg.status === 'Invoice Approved' ? 'bg-emerald-100 text-emerald-700' :
                        pkg.status === 'Invoice Rejected' ? 'bg-rose-100 text-rose-700' :
                          pkg.status === 'Pending Invoice Review' ? 'bg-amber-100 text-amber-700' :
                            pkg.status === 'Ship Requested' ? 'bg-indigo-100 text-indigo-700' :
                              pkg.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                pkg.status === 'Ready for Pickup' ? 'bg-cyan-100 text-cyan-700' :
                                  pkg.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                    'bg-slate-100 text-slate-500'
                    }`}>
                    {pkg.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {pkg.invoice ? (
                    <button
                      onClick={() => setSelectedPkg(pkg)}
                      className="text-secondary hover:underline flex items-center gap-1"
                    >
                      <Eye size={14} /> Review
                    </button>
                  ) : (
                    <span className="text-slate-400 text-xs italic">Not uploaded</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {['Ship Requested', 'Shipped', 'Ready for Pickup'].includes(pkg.status) ? (
                    <div className="relative inline-block">
                      <select
                        className="appearance-none text-sm border border-slate-200 rounded-lg pl-3 pr-8 py-2 bg-white focus:ring-secondary focus:border-secondary cursor-pointer"
                        value={pkg.status}
                        onChange={(e) => handleStatusChange(pkg._id, e.target.value)}
                      >
                        <option value="Ship Requested" disabled>Ship Requested</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Ready for Pickup">Ready for Pickup</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal - Image Only */}
      <AnimatePresence>
        {selectedPkg && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/30 backdrop-blur-sm"
            onClick={() => setSelectedPkg(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 flex items-center justify-between bg-primary text-white">
                <h3 className="text-lg font-bold">Invoice — {selectedPkg.trackingNumber}</h3>
                <button
                  onClick={() => setSelectedPkg(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X size={18} />
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
          </div>
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
