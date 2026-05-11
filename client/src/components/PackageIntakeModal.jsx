import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, User, Search, X, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PackageIntakeModal = ({ isOpen, onClose, onPackageAdded }) => {
  const [formData, setFormData] = useState({
    trackingNumber: '',
    weight: '',
    contents: '',
    length: '',
    width: '',
    height: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const debounceTimer = useRef(null);
  const skipSearch = useRef(false); // skip search after selection

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ trackingNumber: '', weight: '', contents: '', length: '', width: '', height: '' });
      setSearchQuery('');
      setClients([]);
      setSelectedClient(null);
      setError('');
      setSuccess(false);
      setDropdownOpen(false);
    }
  }, [isOpen]);

  // Debounced server-side search
  useEffect(() => {
    // Skip search if client was just selected
    if (skipSearch.current) {
      skipSearch.current = false;
      return;
    }
    if (!searchQuery.trim()) {
      setClients([]);
      setDropdownOpen(false);
      return;
    }
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await axiosInstance.get(`/users/clients?search=${encodeURIComponent(searchQuery)}`);
        setClients(data);
        setDropdownOpen(true);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleClientSearch = (e) => {
    setSearchQuery(e.target.value);
    setSelectedClient(null);
  };

  const handleSelectClient = (client) => {
    skipSearch.current = true; // prevent search from firing on text change
    setSelectedClient(client);
    setSearchQuery(`${client.name} · ${client.email}`);
    setDropdownOpen(false);
    setClients([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient) { setError('Please select a client.'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.post('/packages', {
        ...formData,
        clientId: selectedClient._id,
        dimensions: { length: formData.length, width: formData.width, height: formData.height }
      });
      setSuccess(true);
      if (data.message) toast.success(data.message);
      else toast.success('Package registered successfully!');
      
      setTimeout(() => {
        if (onPackageAdded) onPackageAdded();
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create package');
      toast.error(err.response?.data?.message || 'Failed to create package');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/30 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between bg-primary text-white border-b border-primary-light">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner">
                <Package size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-wide">Add New Package</h2>
                <p className="text-sm text-white/70 font-medium">Log an incoming package for a client</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/5"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-8">
            {success ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-success rounded-full flex items-center justify-center text-white"
                >
                  <CheckCircle size={32} />
                </motion.div>
                <p className="text-xl font-bold text-primary">Package Registered!</p>
                <p className="text-slate-500">The package has been added to the client's account.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left – Package Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Package size={14} className="text-secondary" /> Package Details
                    </h3>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">Tracking Number</label>
                      <input type="text" name="trackingNumber" required placeholder="Carrier tracking code"
                        className="block w-full p-3.5 border border-slate-200/60 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none shadow-sm font-medium"
                        value={formData.trackingNumber} onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Weight (lbs)</label>
                        <input type="number" name="weight" required placeholder="0.0"
                          className="block w-full p-3.5 border border-slate-200/60 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none shadow-sm font-medium"
                          value={formData.weight} onChange={handleChange} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Contents</label>
                        <input type="text" name="contents" required placeholder="e.g. Electronics"
                          className="block w-full p-3.5 border border-slate-200/60 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none shadow-sm font-medium"
                          value={formData.contents} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">Dimensions (L × W × H in inches)</label>
                      <div className="flex items-center gap-3">
                        <input type="number" name="length" placeholder="L" onChange={handleChange}
                          className="flex-1 p-3.5 border border-slate-200/60 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none shadow-sm font-medium text-center" />
                        <span className="text-slate-400 font-bold">×</span>
                        <input type="number" name="width" placeholder="W" onChange={handleChange}
                          className="flex-1 p-3.5 border border-slate-200/60 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none shadow-sm font-medium text-center" />
                        <span className="text-slate-400 font-bold">×</span>
                        <input type="number" name="height" placeholder="H" onChange={handleChange}
                          className="flex-1 p-3.5 border border-slate-200/60 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none shadow-sm font-medium text-center" />
                      </div>
                    </div>
                  </div>

                  {/* Right – Client Selector (server-side search) */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <User size={14} className="text-secondary" /> Recipient Client
                    </h3>

                    <div className="space-y-1.5 relative">
                      <label className="text-sm font-bold text-slate-700">Search Client</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          {searchLoading
                            ? <Loader2 size={18} className="animate-spin text-secondary" />
                            : <Search size={18} className="text-slate-400" />
                          }
                        </span>
                        <input
                          type="text"
                          placeholder="Type name or email..."
                          className={`block w-full pl-12 pr-4 py-3.5 border rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none shadow-sm font-medium ${selectedClient ? 'border-success bg-success/5 text-success focus:border-success focus:ring-success/20' : 'border-slate-200/60 text-slate-700'
                            }`}
                          value={searchQuery}
                          onChange={handleClientSearch}
                          autoComplete="off"
                        />
                      </div>

                      {/* Dropdown results */}
                      <AnimatePresence>
                        {dropdownOpen && clients.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-52 overflow-y-auto"
                          >
                            <ul className="py-2">
                              {clients.map(client => (
                                <li
                                  key={client._id}
                                  className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                                  onClick={() => handleSelectClient(client)}
                                >
                                  <div className="font-semibold text-primary flex items-center gap-2">
                                    {client.name}
                                  </div>
                                  <div className="text-sm text-slate-400">{client.email}</div>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                        {dropdownOpen && !searchLoading && clients.length === 0 && searchQuery.trim() && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl"
                          >
                            <div className="px-4 py-6 text-center text-slate-400">
                              <p className="font-medium">No client found</p>
                              <p className="text-sm mt-1">Add the client first from the Clients tab.</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Selected client confirmation */}
                      {selectedClient && (
                        <div className="mt-3 p-3 bg-success/10 border border-success/30 rounded-xl flex items-center gap-3">
                          <CheckCircle size={18} className="text-success flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-success">{selectedClient.name}</p>
                            <p className="text-xs text-slate-500">{selectedClient.email}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setSelectedClient(null); setSearchQuery(''); }}
                            className="ml-auto text-slate-400 hover:text-slate-600"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={onClose}
                    className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-3.5 rounded-xl bg-secondary text-white font-bold hover:bg-secondary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:translate-y-0">
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Package size={20} />}
                    {loading ? 'Creating...' : 'Create Package'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PackageIntakeModal;
