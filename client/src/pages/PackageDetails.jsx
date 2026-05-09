import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { motion } from 'framer-motion';
import { Package, FileText, Upload, CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react';

const PackageDetails = () => {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDetails = async () => {
    try {
      const { data } = await axiosInstance.get('/packages/my');
      const found = data.find(p => p._id === id);
      setPkg(found);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('invoice', file);

    try {
      await axiosInstance.post(`/packages/${id}/invoice`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchDetails();
      setUploading(false);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!pkg) return <div className="p-8 text-center text-danger">Package not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Package Details</h1>
          <p className="text-slate-500">Tracking: <span className="font-bold">{pkg.trackingNumber}</span></p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-soft ${pkg.status === 'Ready to Send' ? 'bg-slate-100 text-slate-600' :
            pkg.status === 'Invoice Approved' ? 'bg-success/10 text-success' :
              pkg.status === 'Pending Invoice Review' ? 'bg-warning/10 text-warning' :
                'bg-secondary/10 text-secondary'
          }`}>
          {pkg.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Main Info */}
          <div className="glass-card p-6 space-y-6">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
              <Package size={20} className="text-secondary" />
              Package Information
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Weight</p>
                <p className="text-lg font-medium text-primary">{pkg.weight} lbs</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Dimensions</p>
                <p className="text-lg font-medium text-primary">
                  {pkg.dimensions?.length || 0} x {pkg.dimensions?.width || 0} x {pkg.dimensions?.height || 0} in
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Contents</p>
                <p className="text-lg font-medium text-primary">{pkg.contents}</p>
              </div>
            </div>
          </div>

          {/* Invoice Section */}
          <div className="glass-card p-6 space-y-6">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
              <FileText size={20} className="text-secondary" />
              Invoice Verification
            </h3>

            {pkg.invoice ? (
              <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-soft">
                    <FileText className="text-secondary" />
                  </div>
                  <div>
                    <p className="font-bold text-primary">Invoice Uploaded</p>
                    <p className="text-sm text-slate-500">Status: {pkg.invoice.reviewStatus}</p>
                  </div>
                </div>
                {pkg.invoice.reviewStatus === 'Approved' ? (
                  <CheckCircle className="text-success" />
                ) : pkg.invoice.reviewStatus === 'Rejected' ? (
                  <AlertCircle className="text-danger" />
                ) : (
                  <Clock className="text-warning animate-pulse" />
                )}
              </div>
            ) : (
              <form onSubmit={handleUpload} className="space-y-4">
                <p className="text-sm text-slate-500">Please upload your commercial invoice or purchase receipt to proceed with shipping.</p>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-secondary hover:bg-secondary/5 transition-all group">
                  <input
                    type="file"
                    id="invoice-upload"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <label htmlFor="invoice-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-white transition-all">
                      <Upload size={24} />
                    </div>
                    <p className="font-bold text-primary">{file ? file.name : 'Click to select file'}</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, JPG, or PNG (Max 5MB)</p>
                  </label>
                </div>
                {file && (
                  <button
                    disabled={uploading}
                    className="w-full btn-secondary flex items-center justify-center gap-2"
                  >
                    {uploading ? <Loader2 className="animate-spin" /> : 'Upload & Submit for Review'}
                  </button>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 bg-primary text-white">
            <h3 className="font-bold mb-4">Workflow Actions</h3>
            {(pkg.status === 'Invoice Approved' || pkg.status === 'Pending Invoice Review') ? (
              <button 
                onClick={() => window.location.href = '/ship-requests/create'}
                className="w-full bg-white text-primary font-bold py-3 px-4 rounded-xl hover:bg-secondary hover:text-white transition-all shadow-lg"
              >
                Create Ship Request
              </button>
            ) : (
              <p className="text-sm text-white/60">
                Shipping actions will be available once your invoice is uploaded.
              </p>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold text-primary mb-4 text-sm uppercase tracking-widest">Support</h3>
            <p className="text-sm text-slate-500 mb-4">Have questions about this package? Contact our support team.</p>
            <button className="w-full border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all">
              Chat Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetails;
