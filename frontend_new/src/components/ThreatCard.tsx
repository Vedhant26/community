"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { ShieldAlert, Fingerprint, CalendarDays, ExternalLink } from "lucide-react"

export function ThreatCard({ threat, index }: { threat: any, index: number }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return "bg-red-500 shadow-red-500/50"
      case 'false_positive': return "bg-emerald-500 shadow-emerald-500/50"
      default: return "bg-yellow-500 animate-pulse shadow-yellow-500/50"
    }
  }

  const timeAgo = (dateStr: string) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    const daysDifference = Math.round((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (daysDifference === 0) return 'Today'
    return rtf.format(daysDifference, 'day')
  }

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card/40 p-6 sm:p-7 glass transition-all duration-400 active:scale-[0.99] hover-lift hover:border-primary/40 hover:bg-card/70 animate-fade-in-up border-border/60",
      )}
      style={{ animationDelay: `${(index % 6) * 100 + 200}ms` }}
    >
      <div className="absolute right-5 top-5 flex items-center gap-2.5">
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-full transition-shadow duration-300 shadow-sm",
            getStatusColor(threat.status)
          )}
        />
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{threat.status.replace("_", " ")}</span>
      </div>

      <div className="mb-5 font-mono text-xs text-muted-foreground flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
        <Fingerprint className="w-3.5 h-3.5"/> 
        {threat.threat_id}
      </div>

      <h3 className="mb-3 text-lg sm:text-xl font-bold tracking-tight transition-all duration-300 group-hover:text-primary pt-2 truncate break-words" title={threat.domain}>
        {threat.domain}
      </h3>

      <div className="mb-5 flex flex-wrap gap-2">
        <span className="rounded-md border border-border/80 bg-secondary/60 px-2.5 py-1 font-mono text-xs text-secondary-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 capitalize">
          {threat.category.replace('_', ' ')}
        </span>
        <span className="flex items-center gap-1 rounded-md border border-border/80 bg-secondary/60 px-2.5 py-1 font-mono text-xs text-muted-foreground">
          <CalendarDays className="w-3 h-3" />
          {timeAgo(threat.first_seen)}
        </span>
      </div>

      <div className="mb-5 flex items-center gap-5 font-mono text-xs text-muted-foreground">
        <span className="flex flex-col gap-1 transition-colors group-hover:text-foreground">
          <span className="text-[10px] uppercase">Reports</span>
          <span className="text-xl text-primary font-bold">{threat.report_count}</span>
        </span>
        <span className="flex flex-col gap-1 transition-colors group-hover:text-foreground">
          <span className="text-[10px] uppercase">Confirmations</span>
          <span className="text-xl text-foreground font-bold">{threat.confirmations}</span>
        </span>
      </div>

      <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border/50">
        <Link
          href={`/threat/${threat.threat_id}`}
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary hover:text-foreground transition-all duration-300 group/link"
        >
          <ShieldAlert className="h-4 w-4 transition-transform group-hover/link:scale-110 group-hover/link:rotate-12" />
          <span className="underline-animate">Threat Analysis</span>
        </Link>
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary via-primary/80 to-transparent transition-all duration-500 group-hover:w-full" />
    </article>
  )
}
