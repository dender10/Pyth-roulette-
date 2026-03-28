import { motion } from 'framer-motion'
import { useGameContext } from '../hooks/useGameState'

export function GameHistory() {
  const { state } = useGameContext()

  if (state.history.length === 0) return null

  return (
    <div className="w-full max-w-md">
      <h3 className="font-display text-xs text-text-dim uppercase tracking-wider mb-2">
        Recent Rounds
      </h3>
      <div className="flex flex-col gap-1">
        {state.history.slice(0, 8).map((round, i) => (
          <motion.div
            key={round.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between bg-surface rounded-lg px-3 py-1.5 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className={`font-bold ${
                round.lastTwoDigits % 2 === 0 ? 'text-neon-green' : 'text-neon-pink'
              }`}>
                {round.lastTwoDigits.toString().padStart(2, '0')}
              </span>
              <span className="text-text-dim">
                bet {round.bet.toUpperCase()}
              </span>
            </div>
            <span className={`font-bold ${
              round.result === 'win' ? 'text-neon-green' : 'text-neon-pink'
            }`}>
              {round.result === 'win' ? `+$${round.amount}` : `-$${round.amount}`}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
