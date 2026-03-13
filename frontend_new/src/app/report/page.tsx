"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitThreat } from "@/services/api"
import { Header } from "@/components/header"
import { CursorGlow } from "@/components/cursor-glow"
import { ShieldAlert, Fingerprint, CalendarDays, ExternalLink } from "lucide-react"

const categories = [
  { id: 'phishing', label: 'Phishing / Fake Login', desc: 'Steals credentials' },
  { id: 'payment_scam', label: 'Payment Scam', desc: 'Crypto or financial fraud' },
  { id: 'malware_link', label: 'Malware Link', desc: 'Downloads malicious payload' },
  { id: 'unknown', label: 'Unknown / Suspicious', desc: 'Something looks wrong' },
]

export default function ReportURL() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    url: '',
    category: 'unknown',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await submitThreat(formData)
      router.push(`/threat/${res.threat_id}`)
    } catch (err: any) {
      setError(err.message || 'Submission failed')
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden scanlines">
      <CursorGlow />
      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-6">
        <Header />
        
        <div className="mx-auto max-w-3xl animate-fade-in-up">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-lg shadow-primary/20">
              <ShieldAlert className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">Report Threat</h2>
            <p className="text-muted-foreground mx-auto max-w-lg">
              Submit a suspicious URL to the community shield database. All submissions are strictly anonymous.
            </p>
          </div>

          <article className="group relative overflow-hidden rounded-xl border bg-card/40 p-6 sm:p-10 glass border-border/60">
            <form onSubmit={handleSubmit} className="space-y-8 relative z-20">
              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 font-mono text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Original Target URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://suspicious-site.com"
                  className="w-full rounded-lg border border-border/50 bg-background/50 px-4 py-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Classification</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`flex flex-col items-start rounded-lg border p-4 text-left transition-all active:scale-[0.98] ${
                        formData.category === cat.id
                          ? 'border-primary bg-primary/10 shadow-sm shadow-primary/20'
                          : 'border-border/50 bg-background/50 hover:bg-secondary/50'
                      }`}
                    >
                      <span className={`font-mono text-sm font-bold capitalize mb-1 ${formData.category === cat.id ? 'text-primary' : 'text-foreground'}`}>
                        {cat.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{cat.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Context Notes (Optional)</label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-border/50 bg-background/50 px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono resize-none"
                  placeholder="How did you find this? Included via SMS, email attachment, discord link..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary px-4 py-4 font-mono text-sm font-bold uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Transmitting...' : 'Commit Evidence'}
              </button>
            </form>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary/30 to-background" />
          </article>
        </div>
      </div>
    </main>
  )
}
