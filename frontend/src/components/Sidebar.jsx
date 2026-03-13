import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: '🛡️' },
    { name: 'Report URL', path: '/report', icon: '🚨' },
    { name: 'Search', path: '/search', icon: '🔍' },
  ];

  return (
    <div className="w-64 bg-[#050505] border-r border-zinc-800 flex flex-col min-h-screen">
      <div className="p-6 border-b border-zinc-800 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-xl shadow-lg shadow-black/50 grayscale">
            👁️
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-500">
            TrapEye
            <span className="block text-xs text-zinc-500 font-medium tracking-wide">SHIELD</span>
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              location.pathname === item.path
                ? 'bg-zinc-800/80 text-white border border-zinc-700 shadow-md'
                : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
            }`}
          >
            <span className="text-xl opacity-80 grayscale group-hover:grayscale-0">{item.icon}</span>
            <span className="font-medium tracking-wide text-sm">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800 mt-auto">
        <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800/50">
          <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Network node</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
            <span className="text-sm font-medium text-zinc-300">Active Sec</span>
          </div>
        </div>
      </div>
    </div>
  );
}
