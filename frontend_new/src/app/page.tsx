import Link from "next/link"
import { Header } from "@/components/header"
import { CursorGlow } from "@/components/cursor-glow"

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden scanlines dark">
      <CursorGlow />
      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-6 h-screen flex flex-col">
        <Header />
        
        <div className="flex-grow flex items-center justify-center pt-20">
          <div className="mx-auto max-w-5xl text-center px-4 md:px-6">
            <div className="inline-flex h-9 items-center justify-center rounded-full border border-primary/50 bg-primary/10 px-4 mb-8">
              <span className="font-mono text-xs uppercase tracking-widest text-primary animate-pulse">
                Sandbox Threat Analysis Is Live
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 font-sans">
              Welcome to the <br />
              <span className="bg-gradient-to-r from-primary via-accent to-pink-500 bg-clip-text text-transparent">
                TrapEye Community
              </span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-12 font-mono">
              The bleeding edge of decentralized threat intelligence. Detoxify the web using our next-gen Dynamic Sandbox, real-time Phishing detection, and Community Shield APIs.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8">
              <Link href="/sandbox" className="group relative w-full sm:w-auto inline-flex items-center justify-center overflow-hidden rounded-lg bg-primary px-8 py-4 font-mono font-medium text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(var(--primary),0.5)]">
                <span className="relative z-10">Launch Sandbox Engine</span>
              </Link>
              
              <Link href="/threats" className="group relative w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-border bg-card/50 px-8 py-4 font-mono font-medium transition-all duration-300 hover:border-primary/50 hover:bg-secondary/80 focus:outline-none">
                View Live Threats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
