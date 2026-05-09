import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Search, Filter, Loader2, Upload, X, Send, Clock, CheckCircle } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';

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
      await axiosInstance.post(`/packages/${selectedPkg._id}/invoice`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchPackages();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to upload invoice');
    } finally {
      setUploading(false);
    }
  };

  const handleShipRequest = async (pkg) => {
    setSubmittingId(pkg._id);
    try {
      await axiosInstance.post('/ship-requests', {
        packageIds: [pkg._id],
        shippingMethod: 'Air Freight',
        destination: 'Aruba Main Warehouse',
      });
      setSuccessId(pkg._id);
      setTimeout(() => {
        setSuccessId(null);
        fetchPackages();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create ship request');
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
    return map[status] || 'bg-slate-100 text-slate-500';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">My Packages</h1>
          <p className="text-slate-500">Track and manage all your shipments</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by tracking # or contents..."
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white focus:ring-secondary transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-secondary" size={32} />
                  </td>
                </tr>
              ) : filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">No packages found</td>
                </tr>
              ) : (
                filteredPackages.map((pkg) => (
                  <tr key={pkg._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-primary">
                      <Link to={`/packages/${pkg._id}`} className="hover:text-secondary hover:underline">
                        {pkg.trackingNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{pkg.weight} lbs</td>
                    <td className="px-6 py-4 text-slate-600">{pkg.contents}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(pkg.status)}`}>
                        {pkg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {/* Ready to Send or Rejected → Upload Invoice */}
                      {(pkg.status === 'Ready to Send' || pkg.status === 'Invoice Rejected') && (
                        <button
                          onClick={() => openUploadModal(pkg)}
                          className="btn-secondary py-2 px-4 text-sm flex items-center gap-1"
                        >
                          <Upload size={14} /> {pkg.status === 'Invoice Rejected' ? 'Re-upload Invoice' : 'Upload Invoice'}
                        </button>
                      )}

                      {/* Pending Review → show pending chip */}
                      {pkg.status === 'Pending Invoice Review' && (
                        <span className="flex items-center gap-1 text-warning text-sm font-semibold">
                          <Clock size={14} /> Pending Review
                        </span>
                      )}

                      {/* Invoice Approved → Ship Request (direct submit) */}
                      {pkg.status === 'Invoice Approved' && (
                        <button
                          onClick={() => handleShipRequest(pkg)}
                          disabled={submittingId === pkg._id || successId === pkg._id}
                          className="btn-primary py-2 px-4 text-sm flex items-center gap-1 disabled:opacity-60"
                        >
                          {submittingId === pkg._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : successId === pkg._id ? (
                            <CheckCircle size={14} />
                          ) : (
                            <Send size={14} />
                          )}
                          {submittingId === pkg._id ? 'Submitting...' : successId === pkg._id ? 'Done!' : 'Ship Request'}
                        </button>
                      )}

                      {/* Already shipped statuses */}
                      {['Ship Requested', 'Shipped', 'Delivered', 'Ready for Pickup'].includes(pkg.status) && (
                        <span className="text-slate-400 text-sm italic">—</span>
                      )}
                    </td>
                  </tr>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 flex items-center justify-between bg-primary text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Upload size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Upload Invoice</h3>
                    <p className="text-sm text-white/60">{selectedPkg.trackingNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-8">
                <form onSubmit={handleUpload} className="space-y-6">
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-secondary hover:bg-secondary/5 transition-all group">
                    <input
                      type="file"
                      id="modal-invoice-upload"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <label htmlFor="modal-invoice-upload" className="cursor-pointer flex flex-col items-center">
                      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-white transition-all">
                        <Upload size={26} />
                      </div>
                      <p className="font-bold text-primary">{file ? file.name : 'Click to select file'}</p>
                      <p className="text-xs text-slate-400 mt-1">PDF, JPG, or PNG (Max 5MB)</p>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading || !file}
                      className="flex-1 py-3 rounded-xl bg-secondary text-white font-bold hover:bg-secondary/90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
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
