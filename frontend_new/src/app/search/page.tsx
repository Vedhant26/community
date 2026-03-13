"use client"

import { useState } from "react"
import { searchThreats } from "@/services/api"
import { Header } from "@/components/header"
import { CursorGlow } from "@/components/cursor-glow"
import { SearchIcon, Fingerprint } from "lucide-react"
import { ThreatCard } from "@/components/ThreatCard"

export default function SearchThreats() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await searchThreats(query)
      setResults(data)
    } catch (err: any) {
      setError(err.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden scanlines">
      <CursorGlow />
      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-6">
        <Header />
        
        <div className="mx-auto max-w-4xl animate-fade-in-up">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">Threat Intel Search</h2>
            <p className="text-muted-foreground mx-auto max-w-lg">
              Query the TrapEye global intelligence database by Hash ID, domain, or IP address.
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative z-20 mb-12">
            <div className="flex w-full items-center rounded-xl border border-border/60 bg-card/40 p-2 sm:p-3 shadow-lg shadow-black/5 glass">
              <SearchIcon className="mx-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter domain, IP, or TE-Hash..."
                className="flex-1 bg-transparent border-none text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 px-2 font-mono"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="rounded-lg bg-primary px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 ml-2"
              >
                {loading ? 'Scanning...' : 'Trace'}
              </button>
            </div>
            {error && <p className="mt-4 text-red-500 font-mono text-sm text-center">{error}</p>}
          </form>

          {searched && !loading && (
            <div className="space-y-6">
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-4 border-b border-border/50 pb-2">
                Scan Results: {results.length} vectors exposed
              </div>
              
              <div className="grid gap-5 sm:grid-cols-2">
                {results.map((threat, index) => (
                  <ThreatCard key={threat.threat_id} threat={threat} index={index} />
                ))}
              </div>

              {results.length === 0 && (
                <div className="py-20 text-center text-muted-foreground border border-dashed border-border/80 rounded-xl bg-card/20">
                  <Fingerprint className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                  <p className="font-mono">Clean trace. No threats detected for "{query}".</p>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="py-20 text-center text-primary border border-dashed border-primary/20 rounded-xl bg-primary/5">
              <div className="h-8 w-8 animate-ping rounded-full bg-primary/50 mx-auto mb-4"></div>
              <p className="font-mono animate-pulse">Querying global nodes...</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
