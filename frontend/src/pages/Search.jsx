import { useState } from 'react';
import { searchThreats } from '../api';
import ThreatCard from '../components/ThreatCard';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const data = await searchThreats(query);
      setResults(data);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-4">Threat Intelligence Search</h2>
        <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
          Search the TrapEye Community Database by domain, URL, or Threat ID to check if a link has been reported before.
        </p>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-xl text-zinc-500 group-focus-within:text-zinc-200 transition-colors">
            🔍
          </div>
          <input 
            type="search" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full p-5 pl-12 text-sm text-white bg-[#0f0f0f] border border-zinc-700/50 rounded-2xl focus:ring-zinc-400 focus:border-zinc-400 backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all outline-none pr-32 focus:shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
            placeholder="Search example.com, TE-A1B2C3D4, or full URL..." 
            required 
          />
          <button 
            type="submit" 
            disabled={loading}
            className="text-zinc-900 absolute right-2.5 bottom-2.5 bg-zinc-200 hover:bg-white focus:ring-4 focus:outline-none focus:ring-zinc-300 font-medium rounded-xl text-sm px-6 py-2.5 shadow-md disabled:opacity-50 transition-colors"
          >
            {loading ? 'Searching...' : 'Search DB'}
          </button>
        </form>
      </div>

      {hasSearched && !loading && results.length === 0 && (
        <div className="text-center py-12 glass-card">
          <div className="text-4xl mb-4 grayscale opacity-80">✅</div>
          <h3 className="text-xl font-bold text-zinc-200 mb-2">No Matching Threats Found</h3>
          <p className="text-zinc-500">
            This domain is not in our database. However, this does not guarantee it is safe.
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-8 animate-slide-in">
          <h3 className="text-xl font-semibold text-zinc-300 mb-6 flex items-center gap-2 border-b border-zinc-800 pb-2">
            Search Results <span className="text-sm font-normal text-zinc-500 ml-2">({results.length} found)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map(threat => (
              <ThreatCard key={threat.threat_id} threat={threat} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
