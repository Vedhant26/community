"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getThreat, confirmThreat, markSafe } from "@/services/api"
import { Header } from "@/components/header"
import { CursorGlow } from "@/components/cursor-glow"
import {
  ShieldAlert, ShieldCheck, Fingerprint, CalendarDays, ExternalLink,
  Globe, AlertTriangle, MessageSquareWarning, Activity, UserCheck
} from "lucide-react"
import { QRModal } from "@/components/QRModal"

export default function ThreatDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  
  const [threat, setThreat] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (id) fetchThreat()
  }, [id])

  const fetchThreat = async () => {
    try {
      setLoading(true)
      const data = await getThreat(id as string)
      setThreat(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load threat details')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: 'confirm' | 'safe') => {
    try {
      setActionLoading(true)
      if (action === 'confirm') {
        await confirmThreat(id as string)
      } else {
        await markSafe(id as string)
      }
      await fetchThreat()
    } catch (err) {
      console.error(err)
      alert("Action failed to register")
    } finally {
      setActionLoading(false)
    }
  }

  const timeAgo = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
  }

  if (loading) {
    return (
      <main className="relative min-h-screen bg-background">
        <Header />
        <div className="flex h-screen items-center justify-center pt-20">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </main>
    )
  }

  if (error || !threat) {
    return (
      <main className="relative min-h-screen bg-background text-center pt-40 px-4">
        <Header />
        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
        <h1 className="text-2xl font-bold mb-2">Threat Not Found</h1>
        <p className="text-muted-foreground max-w-md mx-auto">{error || "The requested Hash ID does not exist in the TrapEye database."}</p>
        <button onClick={() => router.push('/')} className="mt-8 px-6 py-2 border border-border/50 rounded hover:bg-secondary">Return Home</button>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden scanlines">
      <CursorGlow />
      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-6">
        <Header />
        
        <div className="mx-auto max-w-5xl animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 text-xs font-mono uppercase tracking-widest rounded-full shadow-sm \${
                  threat.status === 'confirmed' ? 'bg-red-500/20 text-red-500 border border-red-500/30 shadow-red-500/10' :
                  threat.status === 'false_positive' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
                  'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 shadow-yellow-500/10'
                }`}>
                  {threat.status.replace("_", " ")}
                </span>
                <span className="font-mono text-sm text-muted-foreground flex items-center gap-2 border border-border/50 px-3 py-1 rounded bg-secondary/30">
                  <Fingerprint className="w-4 h-4" /> 
                  {threat.threat_id}
                </span>
                <QRModal threatId={threat.threat_id} domain={threat.domain} />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground break-all" title={threat.url}>
                {threat.domain}
              </h1>
              <a href={threat.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-mono text-sm truncate max-w-full group">
                <ExternalLink className="w-4 h-4" />
                <span className="underline-animate">{threat.url}</span>
              </a>
            </div>

            <div className="flex gap-3 bg-card/50 p-4 rounded-xl border border-border min-w-64 glass shadow-sm">
              <button 
                onClick={() => handleAction('confirm')}
                disabled={actionLoading}
                className="flex-1 flex flex-col items-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 transition-colors rounded-lg border border-red-500/30 disabled:opacity-50"
              >
                <ShieldAlert className="w-6 h-6 text-red-500" />
                <span className="text-xs font-mono font-bold text-red-500 tracking-wider">CONFIRM</span>
              </button>
              <button 
                onClick={() => handleAction('safe')}
                disabled={actionLoading}
                className="flex-1 flex flex-col items-center gap-2 px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors rounded-lg border border-emerald-500/30 disabled:opacity-50"
              >
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                <span className="text-xs font-mono font-bold text-emerald-500 tracking-wider">SAFE</span>
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <article className="border border-border/50 bg-card/40 rounded-xl p-6 glass">
              <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
                <Activity className="h-4 w-4 text-primary" /> Metrics
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-border/50 pb-2">
                  <span className="text-muted-foreground text-sm font-mono">Total Reports</span>
                  <span className="text-3xl font-bold">{threat.report_count}</span>
                </div>
                <div className="flex justify-between items-end border-b border-border/50 pb-2">
                  <span className="text-muted-foreground text-sm font-mono">Confirmations</span>
                  <span className="text-3xl font-bold">{threat.confirmations}</span>
                </div>
                <div className="flex justify-between items-end border-b border-border/50 pb-2">
                  <span className="text-muted-foreground text-sm font-mono">Safe Marks</span>
                  <span className="text-3xl font-bold">{threat.false_positive_marks}</span>
                </div>
              </div>
            </article>

            <article className="border border-border/50 bg-card/40 rounded-xl p-6 glass md:col-span-1 lg:col-span-2">
              <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
                <Globe className="h-4 w-4 text-primary" /> Threat Vector
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-muted-foreground font-mono uppercase mb-1 block">Category</label>
                  <p className="font-medium text-lg capitalize">{threat.category.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-mono uppercase mb-1 block">First Detected</label>
                  <p className="font-medium flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 muted" /> {timeAgo(threat.first_seen)}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-mono uppercase mb-1 block">Last Updated</label>
                  <p className="font-medium flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 muted" /> {timeAgo(threat.updated_at)}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-mono uppercase mb-1 block">Community ID</label>
                  <p className="font-medium font-mono text-sm break-all text-primary">{threat.threat_id}</p>
                </div>
              </div>
            </article>

            <article className="border border-border/50 bg-card/40 rounded-xl p-6 glass md:col-span-2 lg:col-span-3">
              <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
                <MessageSquareWarning className="h-4 w-4 text-primary" /> Investigator Notes
              </div>
              {threat.description ? (
                <div className="bg-background/50 rounded-lg p-5 border border-border/80 text-foreground font-mono text-sm whitespace-pre-wrap leading-relaxed">
                  {threat.description}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-lg bg-background/20 font-mono text-sm">
                  No investigator notes provided for this threat vector.
                </div>
              )}
            </article>
          </div>
        </div>
      </div>
    </main>
  )
}
