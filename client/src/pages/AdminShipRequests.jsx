import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { motion } from 'framer-motion';
import { Ship, Package, Loader2, ChevronDown, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColor = (status) => {
  switch (status) {
    case 'Ship Requested': return 'bg-secondary/10 text-secondary';
    case 'Shipped': return 'bg-primary/10 text-primary';
    case 'Ready for Pickup': return 'bg-warning/10 text-warning';
    case 'Delivered': return 'bg-success/10 text-success';
    default: return 'bg-slate-100 text-slate-500';
  }
};

const AdminShipRequests = () => {
  const [rows, setRows] = useState([]); // flat list of {pkg, client, requestId, createdAt}
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/ship-requests');
      // Flatten: one row per package
      const flat = [];
      data.forEach(req => {
        (req.packages || []).forEach(pkg => {
          flat.push({
            pkg,
            client: req.client,
            requestId: req._id,
            createdAt: req.createdAt,
          });
        });
      });
      setRows(flat);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (packageId, newStatus) => {
    setUpdatingId(packageId);
    try {
      const { data } = await axiosInstance.put(`/ship-requests/packages/${packageId}/status`, { status: newStatus });
      setRows(prev => prev.map(r =>
        r.pkg._id === packageId ? { ...r, pkg: { ...r.pkg, status: newStatus } } : r
      ));
      toast.success(data?.message || `Status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = rows.filter(r =>
    r.pkg.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.client?.suiteNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Ship Requests</h1>
          <p className="text-slate-500">Manage packages requested for shipment by clients</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Search by tracking #, client name, or suite..."
          className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white focus:ring-secondary transition-all"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center text-secondary">
            <Loader2 className="animate-spin" size={36} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-slate-200 m-6 rounded-2xl">
            <Ship size={48} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-primary mb-2">No Ship Requests Yet</h3>
            <p className="text-slate-500">Packages appear here once clients create ship requests.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Request ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tracking #</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contents</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Weight</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(({ pkg, client, requestId, createdAt }, i) => (
                  <motion.tr
                    key={pkg._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      #{requestId.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-primary text-sm">{client?.name}</div>
                      <div className="text-xs text-slate-400">{client?.suiteNumber}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">{pkg.trackingNumber}</td>
                    <td className="px-6 py-4 text-slate-600">{pkg.contents}</td>
                    <td className="px-6 py-4 text-slate-600">{pkg.weight} lbs</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor(pkg.status)}`}>
                        {pkg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {updatingId === pkg._id ? (
                        <Loader2 size={16} className="animate-spin text-secondary" />
                      ) : (
                        <div className="relative inline-block">
                          <select
                            className="appearance-none text-sm border border-slate-200 rounded-lg pl-3 pr-8 py-2 bg-white focus:ring-secondary focus:border-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            value={pkg.status}
                            onChange={e => handleStatusChange(pkg._id, e.target.value)}
                            disabled={pkg.status === 'Delivered'}
                          >
                            <option value="Ship Requested" disabled>Ship Requested</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Ready for Pickup">Ready for Pickup</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminShipRequests;
