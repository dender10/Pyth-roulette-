import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameContext } from '../hooks/useGameState'

const BET_AMOUNTS = [25, 50, 100, 500]

export function BettingPanel() {
  const { state, placeBet, balance } = useGameContext()
  const [selectedAmount, setSelectedAmount] = useState(50)
  const disabled = state.phase !== 'BETTING' || balance <= 0

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {/* How it works - brief explanation */}
      <p className="text-text-dim text-[11px] text-center leading-relaxed max-w-xs">
        Bet on the last 2 digits of BTC's price being <span className="text-neon-pink">ODD</span> or <span className="text-neon-green">EVEN</span>.
        Pyth Entropy picks a random countdown. When it hits 0, Pyth Price Feeds reveal the result.
      </p>

      {/* Bet amount selector */}
      <div className="flex gap-2">
        {BET_AMOUNTS.map(amount => (
          <button
            key={amount}
            onClick={() => setSelectedAmount(amount)}
            disabled={disabled || amount > balance}
            className={`
              px-3 sm:px-4 py-2 rounded-lg font-mono text-sm font-bold transition-all cursor-pointer
              ${selectedAmount === amount
                ? 'bg-pyth/20 text-pyth border-2 border-pyth/60 shadow-[0_0_12px_rgba(123,47,212,0.25)]'
                : 'bg-surface text-text-dim border-2 border-transparent hover:border-surface-light'
              }
              disabled:opacity-30 disabled:cursor-not-allowed
            `}
          >
            ${amount}
          </button>
        ))}
      </div>

      {/* Odd / Even buttons */}
      <div className="flex gap-4 w-full justify-center">
        <motion.button
          whileHover={disabled ? {} : { scale: 1.05 }}
          whileTap={disabled ? {} : { scale: 0.95 }}
          onClick={() => placeBet('odd', selectedAmount)}
          disabled={disabled}
          className="
            flex-1 max-w-[160px] py-4 rounded-xl font-display text-xl font-bold cursor-pointer
            bg-neon-pink/10 text-neon-pink border-2 border-neon-pink/30
            hover:bg-neon-pink/20 hover:shadow-[0_0_24px_rgba(255,51,102,0.3)]
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none
            transition-all
          "
        >
          ODD
        </motion.button>

        <motion.button
          whileHover={disabled ? {} : { scale: 1.05 }}
          whileTap={disabled ? {} : { scale: 0.95 }}
          onClick={() => placeBet('even', selectedAmount)}
          disabled={disabled}
          className="
            flex-1 max-w-[160px] py-4 rounded-xl font-display text-xl font-bold cursor-pointer
            bg-neon-green/10 text-neon-green border-2 border-neon-green/30
            hover:bg-neon-green/20 hover:shadow-[0_0_24px_rgba(0,255,136,0.3)]
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none
            transition-all
          "
        >
          EVEN
        </motion.button>
      </div>

      {state.error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-neon-pink text-sm text-center"
        >
          {state.error}
        </motion.p>
      )}
    </div>
  )
}
