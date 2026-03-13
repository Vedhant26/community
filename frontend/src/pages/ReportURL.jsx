import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitThreat } from '../api';

export default function ReportURL() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    url: '',
    category: 'unknown',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await submitThreat(formData);
      navigate(`/threat/${res.threat_id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'phishing', label: 'Phishing / Fake Login', icon: '🎣' },
    { id: 'payment_scam', label: 'Payment / Crypto Scam', icon: '💸' },
    { id: 'malware_link', label: 'Malware Download', icon: '🦠' },
    { id: 'unknown', label: 'Suspicious / Unsure', icon: '❓' },
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8 break-words text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 text-red-500 shadow-md grayscale group-hover:grayscale-0">
          🚨
        </div>
        <h2 className="text-3xl font-bold text-zinc-100 mb-2">Report Suspicious Link</h2>
        <p className="text-zinc-400">Help protect the community by submitting malicious URLs for analysis.</p>
      </div>

      <div className="glass-card p-8 bg-[#0a0a0a] shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Target URL</label>
            <input
              type="url"
              required
              placeholder="https://suspicious-link.example.com"
              className="w-full bg-[#121212] border border-zinc-700 text-zinc-100 rounded-lg focus:ring-zinc-400 focus:border-zinc-400 block p-3.5 outline-none transition-colors"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">Threat Category</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <label 
                  key={cat.id}
                  className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border transition-all ${
                    formData.category === cat.id 
                      ? 'bg-zinc-800/80 border-zinc-500 shadow-sm' 
                      : 'bg-[#121212] border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="category" 
                    value={cat.id} 
                    checked={formData.category === cat.id}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="hidden"
                  />
                  <span className="text-2xl grayscale opacity-80">{cat.icon}</span>
                  <span className={formData.category === cat.id ? 'text-zinc-100 font-medium' : 'text-zinc-400'}>
                    {cat.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Additional Details (Optional)</label>
            <textarea
              rows="3"
              placeholder="How did you encounter this link? SMS, email, etc."
              className="w-full bg-[#121212] border border-zinc-700 text-zinc-100 rounded-lg focus:ring-zinc-400 focus:border-zinc-400 block p-3.5 outline-none transition-colors resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-zinc-900 bg-zinc-200 hover:bg-white font-bold rounded-lg text-lg px-5 py-4 text-center disabled:opacity-50 transition-all hover:scale-[1.01]"
          >
            {loading ? 'Analyzing...' : 'Submit Evidence'}
          </button>
        </form>
      </div>
    </div>
  );
}
