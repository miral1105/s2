import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Search, Filter, Loader2, Upload, X, Send, Clock, CheckCircle, Package } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ClientPackages = () => {
  const { packages, fetchPackages, loading } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Invoice upload modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Ship request inline state
  const [submittingId, setSubmittingId] = useState(null);
  const [successId, setSuccessId] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const filteredPackages = packages.filter(p => {
    const matchesSearch = p.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contents.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openUploadModal = (pkg) => {
    setSelectedPkg(pkg);
    setFile(null);
    setIsModalOpen(true);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedPkg) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('invoice', file);
    try {
      const { data } = await axiosInstance.post(`/packages/${selectedPkg._id}/invoice`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchPackages();
      setIsModalOpen(false);
      toast.success(data?.message || 'Invoice uploaded successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload invoice');
    } finally {
      setUploading(false);
    }
  };

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
      setTimeout(() => {
        setSuccessId(null);
        fetchPackages();
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create ship request');
    } finally {
      setSubmittingId(null);
    }
  };

  const statusBadge = (status) => {
    const map = {
      'Ready to Send': 'bg-slate-100 text-slate-600',
      'Pending Invoice Review': 'bg-warning/10 text-warning',
      'Invoice Approved': 'bg-success/10 text-success',
      'Invoice Rejected': 'bg-red-100 text-red-600',
      'Ship Requested': 'bg-secondary/10 text-secondary',
      'Shipped': 'bg-primary/10 text-primary',
      'Delivered': 'bg-success/10 text-success',
    };
    return map[status] || 'bg-slate-100 text-slate-500 border border-slate-200';
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">
          My <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Packages</span>
        </h1>
        <p className="text-slate-500 font-medium">Track and manage all your shipments securely.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-secondary">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by tracking # or contents..."
            className="block w-full pl-12 pr-4 py-3.5 border border-slate-200/60 rounded-2xl bg-white/60 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none shadow-sm font-medium text-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              ) : filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-16 text-center text-slate-400">
                    <Package size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="font-medium text-lg text-slate-500">No packages found</p>
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg, i) => (
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
                      <div className="flex items-center gap-3">
                        {/* Ready to Send or Rejected → Upload Invoice */}
                        {(pkg.status === 'Ready to Send' || pkg.status === 'Invoice Rejected') && (
                          <button
                            onClick={() => openUploadModal(pkg)}
                            className="btn-secondary py-2 px-4 text-sm flex items-center gap-2 shadow-sm"
                          >
                            <Upload size={16} /> {pkg.status === 'Invoice Rejected' ? 'Re-upload Invoice' : 'Upload Invoice'}
                          </button>
                        )}

                        {/* Pending Review → show pending chip */}
                        {pkg.status === 'Pending Invoice Review' && (
                          <span className="flex items-center gap-1.5 text-warning text-sm font-bold bg-warning/10 px-3 py-1.5 rounded-lg border border-warning/20">
                            <Clock size={16} /> Pending Review
                          </span>
                        )}

                        {/* Invoice Approved → Ship Request (direct submit) */}
                        {pkg.status === 'Invoice Approved' && (
                          <button
                            onClick={() => handleShipRequest(pkg)}
                            disabled={submittingId === pkg._id || successId === pkg._id}
                            className="btn-primary py-2 px-5 text-sm flex items-center gap-2 disabled:opacity-60 shadow-md"
                          >
                            {submittingId === pkg._id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : successId === pkg._id ? (
                              <CheckCircle size={16} />
                            ) : (
                              <Send size={16} />
                            )}
                            {submittingId === pkg._id ? 'Submitting...' : successId === pkg._id ? 'Done!' : 'Ship Request'}
                          </button>
                        )}

                        {/* Already shipped statuses */}
                        {['Ship Requested', 'Shipped', 'Delivered', 'Ready for Pickup'].includes(pkg.status) && (
                          <span className="text-slate-400 text-sm font-medium italic px-2">—</span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Upload Modal */}
      <AnimatePresence>
        {isModalOpen && selectedPkg && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/30 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 flex items-center justify-between bg-primary text-white border-b border-primary-light">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner">
                    <Upload size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-wide">Upload Invoice</h3>
                    <p className="text-sm text-white/70 font-medium">{selectedPkg.trackingNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8">
                <form onSubmit={handleUpload} className="space-y-8">
                  <div className="border-2 border-dashed border-slate-200/60 rounded-3xl p-10 text-center hover:border-secondary hover:bg-secondary/5 transition-all group bg-slate-50/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
                    <input
                      type="file"
                      id="modal-invoice-upload"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <label htmlFor="modal-invoice-upload" className="cursor-pointer flex flex-col items-center relative z-10">
                      <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-white transition-all">
                        <Upload size={28} className={file ? 'text-secondary group-hover:text-white' : 'text-slate-400 group-hover:text-white'} />
                      </div>
                      <p className="font-bold text-lg text-primary">{file ? file.name : 'Click to select file'}</p>
                      <p className="text-sm font-medium text-slate-400 mt-2">PDF, JPG, or PNG (Max 5MB)</p>
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading || !file}
                      className="flex-1 py-3.5 rounded-xl bg-secondary text-white font-bold hover:bg-secondary/90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0"
                    >
                      {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                      {uploading ? 'Uploading...' : 'Submit Invoice'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientPackages;
