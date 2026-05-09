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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Ship Requests</h1>
        <p className="text-slate-500">Packages with approved invoices ready for shipment</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center text-secondary">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : approvedPackages.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-slate-200 m-6 rounded-2xl">
            <Ship size={48} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-primary mb-2">No Approved Packages Yet</h3>
            <p className="text-slate-500">Upload an invoice from My Packages and wait for admin approval.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tracking #</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contents</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Weight</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {approvedPackages.map((pkg, i) => (
                  <motion.tr
                    key={pkg._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-primary">{pkg.trackingNumber}</td>
                    <td className="px-6 py-4 text-slate-600">{pkg.contents}</td>
                    <td className="px-6 py-4 text-slate-600">{pkg.weight} lbs</td>
                    <td className="px-6 py-4">
                      {successId === pkg._id ? (
                        <span className="flex items-center gap-1 w-max px-3 py-1 rounded-full text-xs font-bold bg-success/10 text-success">
                          <CheckCircle size={12} /> Submitted!
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 w-max px-3 py-1 rounded-full text-xs font-bold bg-success/10 text-success">
                          <CheckCircle size={12} /> Invoice Approved
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
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
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ClientShipRequests;
