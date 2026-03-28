import type { ReactNode } from 'react'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(123,47,212,0.12) 0%, transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(123,47,212,0.06) 0%, transparent 60%)',
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-surface-light/50">
        <div className="flex items-center gap-3">
          <img src="/pyth-logo.jpg" alt="Pyth" className="w-8 h-8 rounded-lg" />
          <h1 className="font-display text-lg sm:text-xl font-bold text-pyth tracking-wider">
            PYTH ROULETTE
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-dim">
          <span className="inline-block w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span className="hidden sm:inline">Powered by Pyth Network</span>
          <span className="sm:hidden">Pyth</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 gap-5">
        {children}
      </main>

      <footer className="relative z-10 text-center text-xs text-text-dim py-3 px-4 border-t border-surface-light/50">
        Play money only &middot; Built with Pyth Price Feeds + Pyth Entropy
      </footer>
    </div>
  )
}
