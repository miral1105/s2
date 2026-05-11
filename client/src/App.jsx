import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PackageIntake from './pages/PackageIntake';
import PackageDetails from './pages/PackageDetails';
import AdminPackages from './pages/AdminPackages';
import ClientPackages from './pages/ClientPackages';
import ClientShipRequests from './pages/ClientShipRequests';
import CreateShipRequest from './pages/CreateShipRequest';
import AdminShipRequests from './pages/AdminShipRequests';
import AdminClients from './pages/AdminClients';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1E3A5F',
              boxShadow: '0 8px 30px rgba(30, 58, 95, 0.12)',
              borderRadius: '16px',
              fontWeight: '500',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
          }}
        />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Client Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<ClientDashboard />} />
                <Route path="/packages" element={<ClientPackages />} />
                <Route path="/packages/:id" element={<PackageDetails />} />
                <Route path="/ship-requests" element={<ClientShipRequests />} />
                <Route path="/ship-requests/create" element={<CreateShipRequest />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route element={<Layout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/intake" element={<PackageIntake />} />
                <Route path="/admin/packages" element={<AdminPackages />} />
                <Route path="/admin/ship-requests" element={<AdminShipRequests />} />
                <Route path="/admin/clients" element={<AdminClients />} />
              </Route>
            </Route>

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
