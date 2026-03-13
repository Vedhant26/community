import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getThreat, getThreatQR, confirmThreat, markSafe } from '../api';
import QRModal from '../components/QRModal';

export default function ThreatDetail() {
  const { id } = useParams();
  const [threat, setThreat] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [isQrModalOpen, setQrModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchThreat();
  }, [id]);

  const fetchThreat = async () => {
    try {
      const data = await getThreat(id);
      setThreat(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = async () => {
    setQrModalOpen(true);
    if (!qrCode) {
      try {
        const qrData = await getThreatQR(id);
        setQrCode(qrData.qr_code);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleVote = async (type) => {
    setActionLoading(true);
    try {
      if (type === 'confirm') {
        await confirmThreat(id);
      } else {
        await markSafe(id);
      }
      await fetchThreat(); // Refresh data
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!threat) {
    return (
      <div className="text-center py-20 text-zinc-400">
        <h2 className="text-2xl font-bold text-white mb-2">Threat Not Found</h2>
        <Link to="/" className="text-zinc-400 hover:text-white underline">Return to Dashboard</Link>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-red-500 text-white shadow-md shadow-red-500/20';
      case 'false_positive': return 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20';
      default: return 'bg-zinc-600 text-white shadow-md shadow-zinc-500/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 font-mono break-all">{threat.domain}</h2>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(threat.status)}`}>
              {threat.status.replace('_', ' ')}
            </span>
            <span className="text-sm font-mono text-zinc-500">{threat.threat_id}</span>
          </div>
        </div>
        <button 
          onClick={handleShowQR}
          className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center justify-center hover:bg-zinc-700 hover:text-white transition-all shadow-md grayscale text-xl"
          title="Share QR Code"
        >
          📱
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 md:col-span-2 bg-[#0c0c0c] shadow-xl">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Target Data</h3>
          
          <div className="mb-6">
            <label className="text-xs text-zinc-500 block mb-1">Full URL</label>
            <div className="bg-[#121212] p-3 border border-zinc-800 rounded-lg text-zinc-300 font-mono text-sm break-all">
              {threat.original_url}
            </div>
          </div>
          
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Category</label>
              <div className="text-zinc-200 capitalize font-medium">{threat.category.replace('_', ' ')}</div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">First Seen</label>
              <div className="text-zinc-200">{new Date(threat.first_seen).toLocaleString()}</div>
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-500 block mb-1">Reporter Notes</label>
            <div className="bg-[#121212] p-4 font-normal border border-zinc-800 rounded-lg text-zinc-400 text-sm italic min-h-[80px]">
              {threat.description || "No notes provided by the reporter."}
            </div>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between bg-[#0c0c0c] shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Community Stats</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
                <span className="text-zinc-400 text-sm">Total Reports</span>
                <span className="text-2xl font-mono text-white">{threat.report_count}</span>
              </div>
              <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
                <span className="text-zinc-300 text-sm flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-300"></span> Confirmations</span>
                <span className="text-xl font-mono text-white">{threat.confirmations}</span>
              </div>
              <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
                <span className="text-zinc-500 text-sm flex items-center gap-1"><span className="w-2 h-2 rounded-full border border-zinc-500"></span> False Positives</span>
                <span className="text-xl font-mono text-white">{threat.false_positives}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Community Action</h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleVote('confirm')}
                disabled={actionLoading}
                className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Confirm Bad
              </button>
              <button 
                onClick={() => handleVote('safe')}
                disabled={actionLoading}
                className="py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Mark Safe
              </button>
            </div>
          </div>
        </div>
      </div>

      <QRModal 
        isOpen={isQrModalOpen} 
        onClose={() => setQrModalOpen(false)} 
        qrCode={qrCode} 
        title={threat.domain} 
      />
    </div>
  );
}
