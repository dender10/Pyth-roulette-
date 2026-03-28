import { motion, AnimatePresence } from 'framer-motion'
import { useGameContext } from '../hooks/useGameState'
import { formatBtcPrice, extractLastTwoDigits } from '../lib/priceUtils'

export function PriceTicker() {
  const { priceData, priceConnected } = useGameContext()

  if (!priceConnected || !priceData) {
    return (
      <div className="bg-surface rounded-xl px-4 py-2.5 flex items-center gap-3">
        <span className="inline-block w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
        <span className="text-text-dim text-sm">Connecting to Pyth...</span>
      </div>
    )
  }

  const formatted = formatBtcPrice(priceData.price, priceData.expo)
  const lastTwo = extractLastTwoDigits(priceData.price, priceData.expo)
  const lastTwoStr = lastTwo.toString().padStart(2, '0')

  return (
    <div className="bg-surface rounded-xl px-4 py-2.5 flex items-center gap-3 border border-surface-light/50">
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-neon-green animate-pulse" />
        <span className="text-text-dim text-[10px] uppercase tracking-wider hidden sm:inline">BTC/USD</span>
      </div>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={priceData.price}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          className="font-mono text-sm sm:text-base text-pyth font-bold"
        >
          {formatted}
        </motion.span>
      </AnimatePresence>
      <div className="flex items-center gap-1 bg-bg rounded-lg px-2.5 py-1">
        <span className="text-text-dim text-[10px] hidden sm:inline">Last 2:</span>
        <motion.span
          key={lastTwoStr}
          initial={{ scale: 1.3, color: '#7B2FD4' }}
          animate={{ scale: 1, color: '#e2e8f0' }}
          className="font-mono text-sm sm:text-base font-bold"
        >
          {lastTwoStr}
        </motion.span>
      </div>
    </div>
  )
}
