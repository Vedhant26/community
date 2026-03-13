import { Link } from 'react-router-dom';

export default function ThreatCard({ threat }) {
  const getCategoryTheme = (cat) => {
    switch (cat) {
      case 'phishing': return 'text-zinc-300 bg-red-500/10 border-red-500/20';
      case 'fake_login': return 'text-zinc-300 bg-purple-500/10 border-purple-500/20';
      case 'payment_scam': return 'text-zinc-300 bg-amber-500/10 border-amber-500/20';
      case 'malware_link': return 'text-zinc-300 bg-pink-500/10 border-pink-500/20';
      default: return 'text-zinc-400 bg-zinc-800/30 border-zinc-700/50';
    }
  };

  const getStatusTheme = (status) => {
    switch (status) {
      case 'confirmed': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'false_positive': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      default: return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    }
  };

  const timeAgo = (dateStr) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysDifference = Math.round((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysDifference === 0) return 'Today';
    return rtf.format(daysDifference, 'day');
  };

  return (
    <div className="glass-card hover:border-zinc-500/50 p-5 animate-fade-in group bg-[#111] shadow-lg shadow-black/20">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-mono text-zinc-500 mb-1 block opacity-80 group-hover:opacity-100 transition-opacity">
            {threat.threat_id}
          </span>
          <h3 className="text-lg font-semibold text-zinc-200 truncate max-w-[280px]" title={threat.domain}>
            {threat.domain}
          </h3>
        </div>
        <div className={`px-2.5 py-1 rounded text-xs font-medium border ${getStatusTheme(threat.status)}`}>
          {threat.status.replace('_', ' ').toUpperCase()}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2 py-0.5 rounded text-xs border ${getCategoryTheme(threat.category)}`}>
          {threat.category.replace('_', ' ')}
        </span>
        <span className="px-2 py-0.5 rounded text-xs bg-zinc-900 text-zinc-400 border border-zinc-800">
          {timeAgo(threat.first_seen)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 p-3 rounded-lg bg-black/40 border border-zinc-800/80">
        <div>
          <span className="block text-xs text-zinc-500 mb-1">Reports</span>
          <span className="font-mono text-xl text-zinc-300">{threat.report_count}</span>
        </div>
        <div>
          <span className="block text-xs text-zinc-500 mb-1">Confirmations</span>
          <span className="font-mono text-xl text-zinc-300">{threat.confirmations}</span>
        </div>
      </div>

      <Link 
        to={`/threat/${threat.threat_id}`}
        className="block w-full text-center py-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 text-sm font-medium border border-zinc-700 transition-colors"
      >
        View Analysis
      </Link>
    </div>
  );
}
