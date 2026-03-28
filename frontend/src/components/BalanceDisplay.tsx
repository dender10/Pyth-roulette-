import { motion, AnimatePresence } from 'framer-motion'
import { useGameContext } from '../hooks/useGameState'

export function BalanceDisplay() {
  const { balance, resetBalance } = useGameContext()

  return (
    <div className="flex items-center gap-3">
      <div className="bg-surface rounded-lg px-4 py-2 flex items-center gap-2">
        <span className="text-text-dim text-sm">Balance</span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={balance}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="font-display text-lg font-bold text-pyth"
          >
            ${balance.toLocaleString()}
          </motion.span>
        </AnimatePresence>
      </div>
      {balance <= 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={resetBalance}
          className="bg-neon-pink/20 text-neon-pink border border-neon-pink/40 rounded-lg px-3 py-2 text-sm font-bold cursor-pointer hover:bg-neon-pink/30 transition-colors"
        >
          Reset $1,000
        </motion.button>
      )}
    </div>
  )
}
