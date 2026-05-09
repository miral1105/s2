import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { motion } from 'framer-motion';
import { Send, CheckCircle, Package } from 'lucide-react';

const CreateShipRequest = () => {
  const { packages, fetchPackages } = useApp();
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [shippingMethod, setShippingMethod] = useState('Air Freight');
  const [destination, setDestination] = useState('Aruba Main Warehouse');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPackages();
  }, []);

  const eligiblePackages = packages.filter(p => 
    p.status === 'Invoice Approved' || p.status === 'Pending Invoice Review'
  );

  const togglePackage = (id) => {
    if (selectedPackages.includes(id)) {
      setSelectedPackages(selectedPackages.filter(pkgId => pkgId !== id));
    } else {
      setSelectedPackages([...selectedPackages, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedPackages.length === 0) {
      setError('Please select at least one package to ship.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axiosInstance.post('/ship-requests', {
        packageIds: selectedPackages,
        shippingMethod,
        destination,
      });
      navigate('/ship-requests');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ship request');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Create Ship Request</h1>
        <p className="text-slate-500">Select approved packages to be forwarded to Aruba.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Eligible Packages</h2>
            
            {eligiblePackages.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Package size={48} className="mx-auto mb-4 text-slate-300" />
                <p>No packages are currently eligible for shipping.</p>
                <p className="text-sm">Invoices must be approved first.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eligiblePackages.map(pkg => (
                  <label key={pkg._id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                    selectedPackages.includes(pkg._id) ? 'border-secondary bg-secondary/5' : 'border-slate-200 hover:border-secondary/50'
                  }`}>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-secondary border-slate-300 rounded focus:ring-secondary"
                      checked={selectedPackages.includes(pkg._id)}
                      onChange={() => togglePackage(pkg._id)}
                    />
                    <div className="ml-4 flex-1">
                      <p className="font-bold text-primary">{pkg.trackingNumber}</p>
                      <p className="text-sm text-slate-500">{pkg.contents} • {pkg.weight} lbs</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Shipping Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Shipping Method</label>
                <select 
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-secondary"
                  value={shippingMethod}
                  onChange={e => setShippingMethod(e.target.value)}
                >
                  <option value="Air Freight">Air Freight (Fast)</option>
                  <option value="Sea Freight">Sea Freight (Economical)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Destination</label>
                <select 
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-secondary"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                >
                  <option value="Aruba Main Warehouse">Aruba Main Warehouse</option>
                  <option value="Direct to Home Delivery">Direct Delivery (Extra Fee)</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-danger/10 text-danger rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || selectedPackages.length === 0}
                className="w-full btn-secondary py-3 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                <Send size={18} />
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateShipRequest;
