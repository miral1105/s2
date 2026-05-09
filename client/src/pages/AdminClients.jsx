import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Plus, X, Loader2, Search, Mail, Hash } from 'lucide-react';

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
      setClients([...clients, data]);
      setIsModalOpen(false);
      setNewClientData({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create client');
    } finally {
      setClientLoading(false);
    }
  };

  const filteredClients = clients.filter(c =>
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Client Management</h1>
          <p className="text-slate-500">Manage registered clients and their accounts</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Client
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white focus:ring-secondary transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center text-secondary">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No clients found. Click "Add Client" to create one.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map((client) => (
                <tr key={client._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-bold text-primary">{client.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <Mail size={14} className="text-slate-400" />
                      {client.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Client Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-primary text-white">
                <h3 className="text-xl font-bold flex items-center gap-2"><User size={20} /> Register New Client</h3>
                <button onClick={() => setIsModalOpen(false)}><X /></button>
              </div>

              <div className="p-8">
                {error && (
                  <div className="p-3 bg-danger/10 text-danger rounded-xl border border-danger/20 text-sm mb-4">
                    {error}
                  </div>
                )}
                <form onSubmit={handleAddClient} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text" required
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-secondary focus:border-secondary transition-all"
                      value={newClientData.name}
                      onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <input
                      type="email" required
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-secondary focus:border-secondary transition-all"
                      value={newClientData.email}
                      onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Temporary Password</label>
                    <input
                      type="password" required
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-secondary focus:border-secondary transition-all"
                      value={newClientData.password}
                      onChange={(e) => setNewClientData({ ...newClientData, password: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={clientLoading}
                    className="w-full btn-secondary py-3 mt-4 flex items-center justify-center"
                  >
                    {clientLoading ? <Loader2 className="animate-spin" /> : 'Create Client'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminClients;
