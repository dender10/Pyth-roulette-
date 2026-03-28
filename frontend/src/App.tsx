import { Layout } from './components/Layout'
import { PriceTicker } from './components/PriceTicker'
import { BalanceDisplay } from './components/BalanceDisplay'
import { RouletteWheel } from './components/RouletteWheel'
import { BettingPanel } from './components/BettingPanel'
import { CountdownTimer } from './components/CountdownTimer'
import { ResultDisplay } from './components/ResultDisplay'
import { GameHistory } from './components/GameHistory'
import { GameContext, useGameProvider, useGameContext } from './hooks/useGameState'
import { hasWallet } from './config/chain'

function GameApp() {
  const { state } = useGameContext()
  const showBetting = state.phase === 'BETTING'
  const showRequesting = state.phase === 'REQUESTING'
  const showCountdown = state.phase === 'WAITING'
  const showResult = state.phase === 'RESULT' || state.phase === 'REVEALING'

  return (
    <Layout>
      {!hasWallet && (
        <div className="w-full max-w-2xl bg-pyth/10 border border-pyth/30 rounded-lg px-4 py-2 text-center text-xs text-pyth">
          Demo mode — using client-side randomness. Add a testnet private key to <code className="bg-surface px-1 rounded">.env</code> for real Pyth Entropy.
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-2xl gap-3">
        <BalanceDisplay />
        <PriceTicker />
      </div>

      <RouletteWheel />

      {showRequesting && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <p className="text-text-dim text-sm font-display">
              {hasWallet ? 'Requesting randomness from Pyth Entropy...' : 'Generating randomness...'}
            </p>
          </div>
        </div>
      )}

      {showCountdown && <CountdownTimer />}

      {showResult && <ResultDisplay />}

      {showBetting && <BettingPanel />}

      <GameHistory />
    </Layout>
  )
}

function App() {
  const gameValue = useGameProvider()

  return (
    <GameContext.Provider value={gameValue}>
      <GameApp />
    </GameContext.Provider>
  )
}

export default App
