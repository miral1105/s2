import { createContext, useState, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [packages, setPackages] = useState([]);
  const [shipRequests, setShipRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPackages = async (isAdmin = false) => {
    setLoading(true);
    try {
      const url = isAdmin ? '/packages' : '/packages/my';
      const { data } = await axiosInstance.get(url);
      setPackages(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch packages');
      setLoading(false);
    }
  };

  const updatePackageStatus = async (pkgId, status) => {
    try {
      await axiosInstance.put(`/packages/${pkgId}/status`, { status });
      setPackages(prev => prev.map(p => p._id === pkgId ? { ...p, status } : p));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppContext.Provider value={{ 
      packages, 
      shipRequests, 
      loading, 
      error, 
      fetchPackages,
      updatePackageStatus 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
