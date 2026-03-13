"use client"

import { useState } from "react"
import { QrCode, X, Loader2, Copy, CheckCheck, ExternalLink, Shield } from "lucide-react"

interface QRModalProps {
  threatId: string
  domain?: string
}

// Detect the best shareable URL for use inside the QR code.
// On localhost, we swap to the machine's LAN IP by calling a tiny
// backend endpoint so phones on the same WiFi can access the page.
async function resolveSharableBase(): Promise<string> {
  const origin = window.location.origin
  const host = window.location.hostname
  // Already on a real LAN/host — just use it directly
  if (host !== "localhost" && host !== "127.0.0.1") return origin

  // Try fetching the machine's LAN IP via the Next.js proxy
  try {
    const r = await fetch("/api/local-ip", { signal: AbortSignal.timeout(2000) })
    if (r.ok) {
      const { ip } = await r.json()
      const port = window.location.port || "3000"
      return `http://${ip}:${port}`
    }
  } catch {}
  return origin
}

export function QRModal({ threatId, domain }: QRModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [reportUrl, setReportUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchQR = async () => {
    setLoading(true)
    setError(null)
    try {
      const base = await resolveSharableBase()
      // Use the Next.js proxy — works from both PC and phone
      const apiUrl = `/api/threats/${threatId}/qr?base_url=${encodeURIComponent(base)}`
      const response = await fetch(apiUrl)
      if (!response.ok) throw new Error(`API error ${response.status}`)
      const data = await response.json()
      setQrCodeData(data.qr_code)
      setReportUrl(data.url)
    } catch (err: any) {
      setError(err.message || "Failed to generate QR code")
    } finally {
      setLoading(false)
    }
  }

  const openModal = () => {
    setIsOpen(true)
    if (!qrCodeData) fetchQR()
  }

  const copyUrl = async () => {
    if (!reportUrl) return
    await navigator.clipboard.writeText(reportUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isLocalhost = reportUrl?.includes("localhost") || reportUrl?.includes("127.0.0.1")

  return (
    <>
      <button
        id={`qr-btn-${threatId}`}
        onClick={openModal}
        className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg transition-all duration-200 font-mono text-xs uppercase tracking-widest font-bold hover:scale-[1.02] active:scale-[0.98]"
      >
        <QrCode className="w-4 h-4" /> Share QR
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/90 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false) }}
        >
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl mx-4 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/60 bg-secondary/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold font-mono tracking-tight">Threat Report QR</h2>
                  {domain && <p className="text-xs font-mono text-muted-foreground">{domain}</p>}
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">

              {/* QR Display */}
              <div className="flex items-center justify-center min-h-[220px] bg-secondary/30 rounded-xl border border-dashed border-border">
                {loading ? (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <span className="font-mono text-xs uppercase tracking-widest animate-pulse">
                      Generating secure link...
                    </span>
                  </div>
                ) : error ? (
                  <div className="text-center px-4">
                    <p className="text-destructive font-mono text-sm mb-3">{error}</p>
                    <button
                      onClick={fetchQR}
                      className="text-xs font-mono text-primary hover:underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : qrCodeData ? (
                  <div className="p-4 bg-white rounded-xl shadow-lg">
                    <img
                      src={`data:image/png;base64,${qrCodeData}`}
                      alt={`QR code for threat ${threatId}`}
                      className="w-52 h-52 object-contain"
                    />
                  </div>
                ) : null}
              </div>

              {/* Report URL display */}
              {reportUrl && (
                <div className="space-y-2">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                    Encodes link:
                  </p>
                  <div className="flex items-center gap-2 bg-secondary/50 rounded-lg border border-border px-3 py-2.5">
                    <span className="font-mono text-xs text-foreground truncate flex-1 select-all">
                      {reportUrl}
                    </span>
                    <button
                      onClick={copyUrl}
                      className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                      title="Copy link"
                    >
                      {copied
                        ? <CheckCheck className="w-4 h-4 text-green-400" />
                        : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                      title="Open in browser"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Localhost warning */}
                  {isLocalhost && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-mono">
                      <span className="shrink-0">⚠</span>
                      <span>
                        QR encodes <strong>localhost</strong> — phones can't reach this.
                        Open the app via your <strong>local IP</strong> (e.g. <em>http://192.168.x.x:3000</em>) to get a phone-scannable QR.
                      </span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground font-mono">
                Scan to view complete threat intelligence report · ID: {threatId}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
