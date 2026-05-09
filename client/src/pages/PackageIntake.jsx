import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, User, MoveRight, Loader2, CheckCircle, Search, Plus, X } from 'lucide-react';

const PackageIntake = () => {
  const [formData, setFormData] = useState({
    trackingNumber: '',
    weight: '',
    contents: '',
    length: '',
    width: '',
    height: ''
  });
  
  // Client selection state
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Add client modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', email: '', password: '' });
  const [clientLoading, setClientLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data } = await axiosInstance.get('/users/clients');
      setClients(data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClientSearch = (e) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
    setSelectedClient(null); // Clear selection if typing
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setSearchQuery(client.email);
    setIsDropdownOpen(false);
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    setClientLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.post('/users/clients', newClientData);
      setClients([...clients, data]);
      handleSelectClient(data); // Auto-select the new client
      setIsModalOpen(false);
      setNewClientData({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create client');
    } finally {
      setClientLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient) {
      setError('Please select a client from the list.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      // Pass client._id instead of email to the backend
      await axiosInstance.post('/packages', {
        ...formData,
        clientId: selectedClient._id,
        dimensions: {
          length: formData.length,
          width: formData.width,
          height: formData.height
        }
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create package');
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.suiteNumber && c.suiteNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-success rounded-full flex items-center justify-center text-white"
        >
          <CheckCircle size={40} />
        </motion.div>
        <h2 className="text-2xl font-bold text-primary">Package Registered!</h2>
        <p className="text-slate-500 text-center">The package has been added to the client's suite.<br/>Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Package Intake</h1>
        <p className="text-slate-500">Log an incoming package from the carrier</p>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Basic Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Package size={20} className="text-secondary" />
                Package Details
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tracking Number</label>
                <input 
                  type="text" 
                  name="trackingNumber"
                  required
                  className="block w-full p-3 border border-slate-200 rounded-xl focus:ring-secondary focus:border-secondary transition-all"
                  placeholder="Carrier tracking code"
                  value={formData.trackingNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Weight (lbs)</label>
                  <input 
                    type="number" 
                    name="weight"
                    required
                    className="block w-full p-3 border border-slate-200 rounded-xl focus:ring-secondary focus:border-secondary transition-all"
                    placeholder="0.0"
                    value={formData.weight}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Contents</label>
                  <input 
                    type="text" 
                    name="contents"
                    required
                    className="block w-full p-3 border border-slate-200 rounded-xl focus:ring-secondary focus:border-secondary transition-all"
                    placeholder="e.g. Electronics"
                    value={formData.contents}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Dimensions (L x W x H in inches)</label>
                <div className="flex items-center gap-2">
                  <input type="number" name="length" placeholder="L" className="w-full p-3 border border-slate-200 rounded-xl" onChange={handleChange} />
                  <span>x</span>
                  <input type="number" name="width" placeholder="W" className="w-full p-3 border border-slate-200 rounded-xl" onChange={handleChange} />
                  <span>x</span>
                  <input type="number" name="height" placeholder="H" className="w-full p-3 border border-slate-200 rounded-xl" onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Right Column: Client Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <User size={20} className="text-secondary" />
                Recipient Info
              </h3>

              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-slate-700">Select Client</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Search size={18} />
                    </span>
                    <input 
                      type="text" 
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-secondary focus:border-secondary transition-all ${selectedClient ? 'border-success bg-success/5' : 'border-slate-200'}`}
                      placeholder="Search by name, email, or suite..."
                      value={searchQuery}
                      onChange={handleClientSearch}
                      onFocus={() => setIsDropdownOpen(true)}
                    />
                    
                    {/* Dropdown List */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto"
                        >
                          {filteredClients.length > 0 ? (
                            <ul className="py-2">
                              {filteredClients.map(client => (
                                <li 
                                  key={client._id}
                                  className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                                  onClick={() => handleSelectClient(client)}
                                >
                                  <div className="font-bold text-primary">{client.name} <span className="text-sm text-secondary ml-2 font-medium">{client.suiteNumber}</span></div>
                                  <div className="text-sm text-slate-500">{client.email}</div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="px-4 py-6 text-center text-slate-500">
                              <p>No client found.</p>
                              <p className="text-sm mt-1">Click '+ Add Client' to create one.</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="btn-secondary px-4 py-3 flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus size={18} /> Add
                  </button>
                </div>
                {selectedClient && (
                  <p className="text-xs font-medium text-success flex items-center gap-1 mt-2">
                    <CheckCircle size={12} /> Client selected and assigned to package.
                  </p>
                )}
              </div>

              {error && (
                <div className="p-4 bg-danger/10 text-danger rounded-xl border border-danger/20 text-sm">
                  {error}
                </div>
              )}

              <div className="pt-8">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 group disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (
                    <>
                      Confirm Intake
                      <MoveRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
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
                <h3 className="text-xl font-bold flex items-center gap-2"><User size={20}/> Register New Client</h3>
                <button onClick={() => setIsModalOpen(false)}><X /></button>
              </div>
              
              <div className="p-8">
                <form onSubmit={handleAddClient} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                    <input 
                      type="text" required
                      className="w-full p-3 border border-slate-200 rounded-xl"
                      value={newClientData.name}
                      onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <input 
                      type="email" required
                      className="w-full p-3 border border-slate-200 rounded-xl"
                      value={newClientData.email}
                      onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Temporary Password</label>
                    <input 
                      type="password" required
                      className="w-full p-3 border border-slate-200 rounded-xl"
                      value={newClientData.password}
                      onChange={(e) => setNewClientData({...newClientData, password: e.target.value})}
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

export default PackageIntake;
