import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ReportURL from './pages/ReportURL';
import ThreatDetail from './pages/ThreatDetail';
import Search from './pages/Search';

function App() {
  return (
    <div className="flex min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-zinc-500/30">
      
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        
        {/* Top bar */}
        <header className="h-16 border-b border-zinc-800/50 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
            <span className="text-xs font-mono text-zinc-400 tracking-wider">LIVE FEED ACTIVE</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-sm font-semibold text-zinc-200">Security Analyst</span>
              <span className="block text-xs text-zinc-400">ID: TRVP-0992</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 uppercase text-sm font-bold shadow-inner">
              SA
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 pb-20">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/report" element={<ReportURL />} />
              <Route path="/threat/:id" element={<ThreatDetail />} />
              <Route path="/search" element={<Search />} />
            </Routes>
          </div>
        </div>
      </main>
      
      {/* Decorative scanline effect */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden opacity-[0.03]">
        <div className="w-full h-[5px] bg-[#ffffff] animate-[scan-line_8s_linear_infinite]"></div>
      </div>
    </div>
  );
}

export default App;
