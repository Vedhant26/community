export default function QRModal({ isOpen, onClose, qrCode, title }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f0f0f] border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in text-center p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          ✕
        </button>
        
        <h3 className="text-xl font-bold text-white mb-2">Share Threat</h3>
        <p className="text-sm text-zinc-400 mb-6">{title}</p>
        
        <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-lg glow-border grayscale">
          {qrCode ? (
            <img src={`data:image/png;base64,${qrCode}`} alt="Threat QR Code" className="w-48 h-48" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center bg-zinc-100 text-zinc-400">
              Loading...
            </div>
          )}
        </div>
        
        <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">
          Scan to view details
        </p>
      </div>
    </div>
  );
}
