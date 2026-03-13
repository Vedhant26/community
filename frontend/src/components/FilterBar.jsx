export default function FilterBar({ filters, setFilters }) {
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'phishing', label: 'Phishing' },
    { value: 'fake_login', label: 'Fake Login' },
    { value: 'payment_scam', label: 'Payment Scam' },
    { value: 'malware_link', label: 'Malware Link' },
    { value: 'unknown', label: 'Unknown' },
  ];

  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'false_positive', label: 'False Positive' },
  ];

  const sorts = [
    { value: 'latest', label: 'Latest First' },
    { value: 'most_reported', label: 'Most Reported' },
    { value: 'oldest', label: 'Oldest First' },
  ];

  const handleChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <select 
        name="category" 
        value={filters.category} 
        onChange={handleChange}
        className="bg-[#121212] border border-zinc-700 text-zinc-300 text-sm rounded-lg focus:ring-zinc-400 focus:border-zinc-400 block p-2.5 outline-none transition-colors"
      >
        {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>

      <select 
        name="status" 
        value={filters.status} 
        onChange={handleChange}
        className="bg-[#121212] border border-zinc-700 text-zinc-300 text-sm rounded-lg focus:ring-zinc-400 focus:border-zinc-400 block p-2.5 outline-none transition-colors"
      >
        {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>

      <select 
        name="sort_by" 
        value={filters.sort_by} 
        onChange={handleChange}
        className="bg-[#121212] border border-zinc-700 text-zinc-300 text-sm rounded-lg focus:ring-zinc-400 focus:border-zinc-400 block p-2.5 outline-none transition-colors ml-auto"
      >
        {sorts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
    </div>
  );
}
