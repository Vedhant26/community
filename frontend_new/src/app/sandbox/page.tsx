"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { CursorGlow } from "@/components/cursor-glow"
import { ShieldAlert, Globe, ScanSearch, Activity, Server, FileDigit, Image as ImageIcon } from "lucide-react"

export default function SandboxPage() {
  const [url, setUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [report, setReport] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setIsAnalyzing(true)
    setError(null)
    setReport(null)
    
    // Auto-prefix http if missing
    let targetUrl = url
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "http://" + targetUrl
    }

    try {
      const resp = await fetch(`/api/sandbox`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl })
      })

      if (!resp.ok) {
        throw new Error(await resp.text())
      }

      const data = await resp.json()
      setReport(data)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to analyze URL in the sandbox.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden scanlines dark bg-background">
      <CursorGlow />
      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-6">
        <Header />
        
        <div className="mx-auto max-w-5xl animate-fade-in-up mt-8">
          <div className="mb-10 sm:mb-14 space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.25em] sm:tracking-[0.35em] text-primary">Isolation Env</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Dynamic Web Sandbox</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Safely detonate and analyze suspicious URLs in an isolated, headless browser environment. Capture network requests, screenshots, and structural heuristics.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="relative group max-w-3xl mb-12">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/50 to-accent/50 blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative flex items-center bg-card/80 backdrop-blur-md rounded-xl border border-border/50 shadow-2xl p-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
              <Globe className="absolute left-6 h-6 w-6 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter suspicious URL (e.g., sneaky-login.tv)"
                className="w-full bg-transparent border-0 pl-14 pr-32 py-4 font-mono text-lg text-foreground focus:ring-0 placeholder:text-muted-foreground/50 outline-none"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isAnalyzing}
              />
              <button
                disabled={isAnalyzing || !url}
                type="submit"
                className="absolute right-3 top-3 bottom-3 inline-flex items-center gap-2 rounded-lg bg-primary px-6 font-mono font-medium text-primary-foreground tracking-wide transition-all duration-300 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed my-auto"
              >
                {isAnalyzing ? (
                  <>
                    <ScanSearch className="h-4 w-4 animate-pulse" />
                     Detonating...
                  </>
                ) : (
                  <>Detonate</>
                )}
              </button>
            </div>
          </form>

          {/* Error State */}
          {error && (
            <div className="p-6 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 font-mono animate-fade-in-up">
              <span className="font-bold flex items-center gap-2 mb-2"><ShieldAlert className="h-5 w-5"/> Analysis Error</span>
              {error}
            </div>
          )}

          {/* Sandbox Launching state */}
          {isAnalyzing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
               <div className="col-span-1 p-8 rounded-xl border border-border bg-card/50 flex flex-col items-center justify-center space-y-6">
                 <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                   <Server className="h-8 w-8 text-primary" />
                 </div>
                 <div className="text-center font-mono space-y-2">
                   <h3 className="text-xl text-foreground font-semibold">Spinning up environment</h3>
                   <p className="text-muted-foreground text-sm">Allocating headless container context...</p>
                 </div>
               </div>
               <div className="col-span-1 p-6 rounded-xl border border-dashed border-border flex flex-col items-start justify-center text-muted-foreground font-mono text-xs overflow-hidden h-64">
                 <p className="text-primary">&gt; INIT SANDBOX V1.0</p>
                 <p className="animate-pulse">&gt; Navigating to {url}...</p>
                 <br />
                 <p className="opacity-50">&gt; Bypassing anti-bot checks...</p>
                 <p className="opacity-50">&gt; Capturing DOM snapshot...</p>
                 <p className="opacity-50">&gt; Hooking network interfaces...</p>
                 <p className="opacity-50">&gt; Waiting for payload execution...</p>
               </div>
            </div>
          )}

          {/* Results State */}
          {report && !isAnalyzing && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-2xl font-bold font-mono tracking-tight flex items-center gap-3">
                  <Activity className="h-6 w-6 text-primary" />
                  Sandbox Report
                </h3>
                <div className={`px-4 py-1 rounded-full font-mono text-sm border font-bold ${
                  report.risk_score >= 50 
                    ? 'bg-red-500/20 text-red-500 border-red-500/50' 
                    : report.risk_score >= 20 
                      ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
                      : 'bg-green-500/20 text-green-500 border-green-500/50'
                }`}>
                  Risk Score: {report.risk_score}/100
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Meta & Stats */}
                <div className="md:col-span-1 space-y-6">
                  <div className="p-6 rounded-xl border border-border bg-card/50">
                    <h4 className="font-mono text-sm text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                       <FileDigit className="h-4 w-4"/> Target Profile
                    </h4>
                    <div className="space-y-4 font-mono text-sm">
                      <div>
                        <span className="text-muted-foreground">Original URL:</span>
                        <p className="truncate text-foreground" title={report.url}>{report.url}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Page Title:</span>
                        <p className="truncate text-foreground text-primary">{report.title || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status Code:</span>
                        <p className="text-foreground">{report.status_code}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl border border-border bg-card/50">
                    <h4 className="font-mono text-sm text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                       <ShieldAlert className="h-4 w-4"/> Detected Heuristics
                    </h4>
                    <div className="space-y-3 font-mono text-sm">
                      <div className="flex justify-between items-center border-b border-border/50 pb-2">
                        <span className="text-muted-foreground">Password Fields</span>
                        <span className={report.suspicious_elements.has_password_field ? "text-red-400 font-bold" : "text-green-400"}>
                          {report.suspicious_elements.has_password_field ? 'True' : 'False'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-border/50 pb-2">
                        <span className="text-muted-foreground">Iframes Included</span>
                        <span className="text-foreground">{report.suspicious_elements.iframes}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-border/50 pb-2">
                        <span className="text-muted-foreground">Suspicious Forms</span>
                        <span className="text-foreground">{report.suspicious_elements.forms}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2">
                        <span className="text-muted-foreground">External Scripts</span>
                        <span className="text-foreground">{report.suspicious_elements.external_scripts}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Screenshot view */}
                <div className="md:col-span-2">
                  <div className="h-full border border-border rounded-xl bg-card overflow-hidden flex flex-col shadow-lg relative group">
                    <div className="bg-secondary/50 p-3 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                      </div>
                      <h4 className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" /> Live Render Preview
                      </h4>
                    </div>
                    
                    <div className="flex-grow flex items-center justify-center bg-black relative p-4">
                       {report.screenshot_base64 ? (
                         <img 
                           src={`data:image/jpeg;base64,${report.screenshot_base64}`} 
                           alt="Sandbox execution screenshot" 
                           className="max-h-[500px] w-auto border border-border rounded shadow-xl group-hover:scale-[1.02] transition-transform duration-500"
                         />
                       ) : (
                         <div className="text-center font-mono text-muted-foreground">
                           <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                           <p>No screenshot captured.</p>
                         </div>
                       )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
