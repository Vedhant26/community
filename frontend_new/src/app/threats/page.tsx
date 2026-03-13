"use client"

import { useState, useEffect } from "react"
import { getThreats } from "@/services/api"
import { ThreatCard } from "@/components/ThreatCard"
import { CursorGlow } from "@/components/cursor-glow"
import { Header } from "@/components/header"

export default function ThreatFeed() {
  const [threats, setThreats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchThreats()
  }, [])

  const fetchThreats = async () => {
    try {
      const data = await getThreats()
      setThreats(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const categories = ["all", "phishing", "fake_login", "payment_scam", "malware_link", "unknown"]

  const filteredThreats = filter === "all" ? threats : threats.filter(t => t.category === filter)

  return (
    <main className="relative min-h-screen overflow-hidden scanlines">
      <CursorGlow />
      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-6">
        <Header />
        
        <div className="mx-auto max-w-7xl animate-fade-in-up">
          <div className="mb-10 sm:mb-14 flex flex-col gap-6 sm:gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <p className="font-mono text-xs uppercase tracking-[0.25em] sm:tracking-[0.35em] text-primary">Live Feed</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Community Threats</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Real-time crowdsourced phishing intelligence detected by TrapEye Guardian nodes globally.
              </p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:flex-wrap scrollbar-hide stagger-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`shrink-0 rounded-lg border px-5 py-2.5 font-mono text-xs uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ${
                    filter === c 
                      ? "border-primary bg-primary/15 text-primary shadow-sm shadow-primary/20"
                      : "border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {c.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredThreats.map((threat, index) => (
                <ThreatCard key={threat.threat_id} threat={threat} index={index} />
              ))}
              {filteredThreats.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                  No threats found matching the current criteria.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
