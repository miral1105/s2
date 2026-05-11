import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { Ship, Package, CheckCircle, Loader2, Send } from 'lucide-react';

const ClientShipRequests = () => {
  const [approvedPackages, setApprovedPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/packages/my');
      setApprovedPackages(data.filter(p => p.status === 'Invoice Approved'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShipRequest = async (pkg) => {
    setSubmittingId(pkg._id);
    setError('');
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
      setError(err.response?.data?.message || 'Failed to create ship request');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">
          Ship <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Requests</span>
        </h1>
        <p className="text-slate-500 font-medium">Packages with approved invoices ready for shipment securely.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}

      <div className="glass-card overflow-hidden border border-white/80">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-secondary">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-slate-500 font-medium">Loading approved packages...</p>
          </div>
        ) : approvedPackages.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center border-dashed border-2 border-slate-200 m-6 rounded-2xl bg-slate-50/50">
            <Ship size={48} className="text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Approved Packages Yet</h3>
            <p className="text-slate-500 font-medium">Upload an invoice from My Packages and wait for admin approval.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/20">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-200/60">
                <tr>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Tracking #</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Contents</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Weight</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                <AnimatePresence>
                  {approvedPackages.map((pkg, i) => (
                    <motion.tr
                      key={pkg._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/60 transition-colors group"
                    >
                      <td className="px-8 py-6 font-bold text-primary flex items-center gap-2">
                        <Package size={16} className="text-slate-400 group-hover:text-secondary transition-colors" />
                        {pkg.trackingNumber}
                      </td>
                      <td className="px-8 py-6 text-slate-600 font-medium">{pkg.contents}</td>
                      <td className="px-8 py-6 text-slate-600 font-medium">{pkg.weight} lbs</td>
                      <td className="px-8 py-6">
                        {successId === pkg._id ? (
                          <span className="flex items-center gap-1.5 w-max px-4 py-1.5 rounded-full text-xs font-bold bg-success/10 text-success border border-success/20 shadow-sm">
                            <CheckCircle size={14} /> Submitted!
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 w-max px-4 py-1.5 rounded-full text-xs font-bold bg-success/10 text-success border border-success/20 shadow-sm">
                            <CheckCircle size={14} /> Invoice Approved
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <button
                          onClick={() => handleShipRequest(pkg)}
                          disabled={submittingId === pkg._id || successId === pkg._id}
                          className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2 disabled:opacity-60 shadow-md hover:shadow-lg transition-all"
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
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientShipRequests;
