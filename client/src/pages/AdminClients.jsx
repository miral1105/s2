import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Plus, X, Loader2, Search, Mail, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', email: '', password: '' });
  const [clientLoading, setClientLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/users/clients');
      setClients(data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    setClientLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.post('/users/clients', newClientData);
      setClients([...clients, data.client || data]);
      setIsModalOpen(false);
      setNewClientData({ name: '', email: '', password: '' });
      if (data.message) toast.success(data.message);
      else toast.success('Client added successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create client');
      toast.error(err.response?.data?.message || 'Failed to create client');
    } finally {
      setClientLoading(false);
    }
  };

  const filteredClients = clients.filter(c =>
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Client <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Management</span>
          </h1>
          <p className="text-slate-500 font-medium">Manage registered clients and their accounts securely.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 py-2.5 px-5 shadow-lg shadow-primary/30"
        >
          <Plus size={18} />
          Add Client
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-secondary">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            className="block w-full pl-12 pr-4 py-3.5 border border-slate-200/60 rounded-2xl bg-white/60 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none shadow-sm font-medium text-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden border border-white/80">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-secondary">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-slate-500 font-medium">Loading clients...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-16 text-center text-slate-500 font-medium">
            No clients found. Click "Add Client" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/20">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-200/60">
                <tr>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Client Details</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {filteredClients.map((client, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={client._id} 
                    className="hover:bg-white/60 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary flex items-center justify-center font-bold text-lg shadow-sm border border-primary/10 group-hover:scale-105 transition-transform">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-bold text-slate-800 tracking-wide">{client.name}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5 text-slate-600 font-medium">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-secondary/10 group-hover:text-secondary transition-colors">
                          <Mail size={14} />
                        </div>
                        {client.email}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-slate-500 font-medium text-sm">
                      <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
                        {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      <AnimatePresence>
        {isModalOpen && (
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
                    <User size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-wide">Register Client</h3>
                    <p className="text-sm text-white/70 font-medium">Create a new client account</p>
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
                {error && (
                  <div className="p-3 bg-danger/10 text-danger rounded-xl border border-danger/20 text-sm mb-4">
                    {error}
                  </div>
                )}
                <form onSubmit={handleAddClient} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Full Name</label>
                    <input
                      type="text" required
                      className="block w-full p-3.5 border border-slate-200/60 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none shadow-sm font-medium"
                      value={newClientData.name}
                      onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                    <input
                      type="email" required
                      className="block w-full p-3.5 border border-slate-200/60 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none shadow-sm font-medium"
                      value={newClientData.email}
                      onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Temporary Password</label>
                    <input
                      type="password" required
                      className="block w-full p-3.5 border border-slate-200/60 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none shadow-sm font-medium"
                      value={newClientData.password}
                      onChange={(e) => setNewClientData({ ...newClientData, password: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={clientLoading}
                      className="flex-1 py-3.5 rounded-xl bg-secondary text-white font-bold hover:bg-secondary/90 transition-all shadow-md flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {clientLoading ? <Loader2 className="animate-spin" size={20} /> : <User size={20} />}
                      {clientLoading ? 'Creating...' : 'Create Client'}
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

export default AdminClients;
