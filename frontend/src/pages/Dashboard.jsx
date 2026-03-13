import { useState, useEffect } from 'react';
import { getThreats, getStats } from '../api';
import ThreatCard from '../components/ThreatCard';
import StatsBar from '../components/StatsBar';
import FilterBar from '../components/FilterBar';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    sort_by: 'latest'
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, threatsData] = await Promise.all([
        getStats(),
        getThreats(filters)
      ]);
      setStats(statsData);
      setThreats(threatsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="w-2 h-6 bg-zinc-400 rounded-full inline-block"></span>
        Community Intelligence Feed
      </h2>

      <StatsBar stats={stats} />
      
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-6 shadow-lg shadow-black/50">
        <FilterBar filters={filters} setFilters={setFilters} />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-zinc-900 rounded-xl border border-zinc-800"></div>
            ))}
          </div>
        ) : threats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {threats.map(threat => (
              <ThreatCard key={threat.threat_id} threat={threat} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-50">🛡️</div>
            <h3 className="text-xl font-medium text-zinc-300 mb-2">No threats found</h3>
            <p className="text-zinc-500">Try adjusting your filters or search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
