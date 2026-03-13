export default function StatsBar({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="glass-card p-5 border-l-4 border-l-zinc-300 bg-[#0c0c0c] shadow-lg">
        <p className="text-xs text-zinc-500 font-medium mb-1 tracking-wider uppercase">Active Threats</p>
        <p className="text-3xl font-mono text-zinc-100">{stats.total_threats}</p>
      </div>
      
      <div className="glass-card p-5 border-l-4 border-l-zinc-500 bg-[#0c0c0c] shadow-lg">
        <p className="text-xs text-zinc-500 font-medium mb-1 tracking-wider uppercase">Confirmed Bad</p>
        <p className="text-3xl font-mono text-zinc-100">{stats.confirmed}</p>
      </div>
      
      <div className="glass-card p-5 border-l-4 border-l-zinc-600 bg-[#0c0c0c] shadow-lg">
        <p className="text-xs text-zinc-500 font-medium mb-1 tracking-wider uppercase">Pending Analysis</p>
        <p className="text-3xl font-mono text-zinc-100">{stats.pending}</p>
      </div>

      <div className="glass-card p-5 border-l-4 border-l-zinc-800 bg-[#0c0c0c] shadow-lg">
        <p className="text-xs text-zinc-500 font-medium mb-1 tracking-wider uppercase">False Positives</p>
        <p className="text-3xl font-mono text-zinc-400">{stats.false_positives}</p>
      </div>
    </div>
  );
}
