"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { CursorGlow } from "@/components/cursor-glow"
import {
  ShieldAlert, ShieldCheck, Globe, Fingerprint, CalendarDays,
  AlertTriangle, Activity, Server, Code2, BarChart3, Users,
  Link2, Hash, CheckCircle2, XCircle, Clock
} from "lucide-react"

type FeatureFlag = { label: string; value: string | number | boolean; risky?: boolean }

export default function ThreatReportPage() {
  const params = useParams()
  const { threat_id } = params as { threat_id: string }
  const [threat, setThreat] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!threat_id) return
    fetch(`/api/threats/${threat_id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Threat not found in TrapEye database")
        return r.json()
      })
      .then(setThreat)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [threat_id])

  const features = (() => {
    try { return threat?.url_features_json ? JSON.parse(threat.url_features_json) : null }
    catch { return null }
  })()

  const riskScore: number = features?.risk_score ?? threat?.risk_score ?? 0
  const riskLabel = riskScore >= 70 ? "HIGH" : riskScore >= 40 ? "MEDIUM" : "LOW"
  const riskColor = riskScore >= 70
    ? "text-red-500 border-red-500/40 bg-red-500/10"
    : riskScore >= 40
      ? "text-yellow-500 border-yellow-500/40 bg-yellow-500/10"
      : "text-green-400 border-green-400/40 bg-green-400/10"

  const statusColor = (s: string) =>
    s === "confirmed" ? "bg-red-500/20 text-red-500 border-red-500/30"
    : s === "false_positive" ? "bg-green-500/20 text-green-400 border-green-500/30"
    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"

  if (loading) return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
    </main>
  )

  if (error || !threat) return (
    <main className="relative min-h-screen bg-background text-center pt-40 px-4">
      <Header />
      <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
      <h1 className="text-2xl font-bold mb-2">Threat Report Not Found</h1>
      <p className="text-muted-foreground max-w-md mx-auto font-mono">
        {error || "This QR code references a threat ID that doesn't exist in the TrapEye database."}
      </p>
    </main>
  )

  const featureRows: FeatureFlag[] = features ? [
    { label: "URL Length", value: `${features.url_length} chars`, risky: features.url_length > 70 },
    { label: "Subdomains", value: features.num_subdomains, risky: features.num_subdomains >= 3 },
    { label: "@ Symbol in URL", value: features.has_at_symbol ? "Yes" : "No", risky: features.has_at_symbol },
    { label: "IP Address as Domain", value: features.has_ip_in_domain ? "Yes" : "No", risky: features.has_ip_in_domain },
    { label: "Special Characters", value: features.special_characters },
    { label: "Digits in Domain", value: features.digits_in_domain, risky: features.digits_in_domain > 3 },
    { label: "HTTPS", value: features.uses_https ? "Yes" : "No", risky: !features.uses_https },
    { label: "TLD", value: features.tld, risky: features.tld_risky },
    { label: "Path Depth", value: features.path_depth },
    { label: "Entropy Score", value: `${features.entropy_score} (${features.entropy_level})`, risky: features.entropy_level === "High" },
  ] : []

  return (
    <main className="relative min-h-screen overflow-hidden scanlines bg-background">
      <CursorGlow />
      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-6">
        <Header />

        <div className="mx-auto max-w-5xl space-y-8 animate-fade-in-up mt-6">

          {/* ── Hero Banner ────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 sm:p-8 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            <div className="flex flex-wrap gap-3 mb-5">
              <span className={`px-3 py-1 text-xs font-mono uppercase tracking-widest rounded-full border ${statusColor(threat.status)}`}>
                {threat.status.replace("_", " ")}
              </span>
              <span className={`px-3 py-1 text-xs font-mono uppercase tracking-widest rounded-full border font-bold ${riskColor}`}>
                Risk: {riskLabel} ({riskScore}/100)
              </span>
              <span className="px-3 py-1 text-xs font-mono uppercase tracking-widest rounded-full border border-border text-muted-foreground">
                {threat.category.replace(/_/g, " ")}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight break-all mb-2">
              {threat.domain}
            </h1>
            <p className="font-mono text-sm text-primary/80 break-all mb-6">{threat.original_url}</p>

            <div className="flex flex-wrap gap-4 font-mono text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Fingerprint className="w-4 h-4" />{threat.threat_id}</span>
              <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" />
                First seen {new Date(threat.first_seen).toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />
                Last seen {new Date(threat.last_seen).toLocaleString()}
              </span>
            </div>
          </div>

          {/* ── Risk + Community Side by Side ──────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Risk Score Gauge */}
            <div className="rounded-xl border border-border bg-card/50 p-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Phishing Risk Score
              </h2>
              <div className="flex items-center gap-4">
                <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl font-extrabold ${
                  riskScore >= 70 ? "border-red-500 text-red-500" :
                  riskScore >= 40 ? "border-yellow-500 text-yellow-500" :
                  "border-green-400 text-green-400"
                }`}>
                  {riskScore}
                </div>
                <div>
                  <p className={`text-2xl font-bold font-mono ${riskScore >= 70 ? "text-red-500" : riskScore >= 40 ? "text-yellow-500" : "text-green-400"}`}>
                    {riskLabel}
                  </p>
                  <p className="text-muted-foreground text-sm font-mono mt-1">Phishing Probability</p>
                  {/* Progress bar */}
                  <div className="mt-3 w-40 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${riskScore >= 70 ? "bg-red-500" : riskScore >= 40 ? "bg-yellow-500" : "bg-green-400"}`}
                      style={{ width: `${riskScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Community Votes */}
            <div className="rounded-xl border border-border bg-card/50 p-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Community Reports
              </h2>
              <div className="space-y-4">
                {[
                  { label: "Total Reports", value: threat.report_count, Icon: Activity, color: "text-primary" },
                  { label: "Confirmed Threats", value: threat.confirmations, Icon: ShieldAlert, color: "text-red-500" },
                  { label: "Marked Safe", value: threat.false_positives, Icon: ShieldCheck, color: "text-green-400" },
                ].map(({ label, value, Icon, color }) => (
                  <div key={label} className="flex items-center justify-between border-b border-border/40 pb-3">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                      <Icon className={`w-4 h-4 ${color}`} />{label}
                    </span>
                    <span className={`text-2xl font-bold font-mono ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Threat Intel: IP / Country ──────────────────────── */}
          <div className="rounded-xl border border-border bg-card/50 p-6">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" /> Threat Intelligence Indicators
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "IP Address", value: threat.ip_address || "Unresolved" },
                { label: "Country / Region", value: threat.country || "Unknown" },
                { label: "Domain", value: threat.domain },
                { label: "TLD Risk", value: features?.tld_risky ? `${features?.tld} ⚠ Risky` : features?.tld || "N/A" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-secondary/30 border border-border/50 p-4">
                  <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
                  <p className="font-mono text-sm text-foreground font-semibold break-all">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Suspicious Keywords ─────────────────────────────── */}
          {features?.suspicious_keywords?.length > 0 && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-red-500/80 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" /> Suspicious Keywords Detected
              </h2>
              <div className="flex flex-wrap gap-2">
                {features.suspicious_keywords.map((kw: string) => (
                  <span key={kw} className="px-3 py-1 font-mono text-xs rounded-full bg-red-500/20 border border-red-500/40 text-red-400">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── URL Feature Extraction Table ───────────────────── */}
          {featureRows.length > 0 && (
            <div className="rounded-xl border border-border bg-card/50 p-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" /> URL Feature Extraction
              </h2>
              <div className="divide-y divide-border/50">
                {featureRows.map(({ label, value, risky }) => (
                  <div key={label} className="flex items-center justify-between py-3">
                    <span className="font-mono text-sm text-muted-foreground flex items-center gap-2">
                      {risky
                        ? <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                        : <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
                      {label}
                    </span>
                    <span className={`font-mono text-sm font-semibold ${risky ? "text-red-400" : "text-foreground"}`}>
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Investigator Notes ─────────────────────────────── */}
          {threat.description && (
            <div className="rounded-xl border border-border bg-card/50 p-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" /> Investigator Notes
              </h2>
              <div className="bg-background/50 rounded-lg p-5 border border-border/60 font-mono text-sm whitespace-pre-wrap leading-relaxed text-foreground">
                {threat.description}
              </div>
            </div>
          )}

          <p className="text-center text-xs font-mono text-muted-foreground pt-4">
            Powered by TrapEye Community Shield · Threat ID: {threat.threat_id}
          </p>
        </div>
      </div>
    </main>
  )
}
