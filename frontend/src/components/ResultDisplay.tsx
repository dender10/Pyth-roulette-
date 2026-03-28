import { motion } from 'framer-motion'
import { useGameContext } from '../hooks/useGameState'
import { formatBtcPrice } from '../lib/priceUtils'

export function ResultDisplay() {
  const { state, playAgain } = useGameContext()

  if (state.phase !== 'RESULT') return null

  const won = state.result === 'win'
  const priceStr = state.lastPrice && state.lastExpo !== null
    ? formatBtcPrice(state.lastPrice, state.lastExpo)
    : '---'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4"
    >
      {/* Screen flash overlay */}
      <motion.div
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          background: won
            ? 'radial-gradient(circle, rgba(0,255,136,0.3), transparent)'
            : 'radial-gradient(circle, rgba(255,51,102,0.25), transparent)',
        }}
      />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 8, delay: 0.2 }}
        className={`font-display text-5xl sm:text-6xl font-black ${
          won ? 'text-neon-green' : 'text-neon-pink'
        }`}
        style={{
          textShadow: won
            ? '0 0 40px rgba(0,255,136,0.6), 0 0 80px rgba(0,255,136,0.3)'
            : '0 0 40px rgba(255,51,102,0.6), 0 0 80px rgba(255,51,102,0.3)',
        }}
      >
        {won ? 'WIN!' : 'LOSE'}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-text-dim text-sm flex flex-col items-center gap-1.5 bg-surface rounded-xl px-5 py-3 border border-surface-light/50"
      >
        <span>BTC: <span className="text-pyth font-bold">{priceStr}</span></span>
        <span>
          Last 2 digits:{' '}
          <span className="text-text font-bold text-base">
            {state.lastTwoDigits?.toString().padStart(2, '0')}
          </span>
          {' '}={' '}
          <span className={state.lastTwoDigits !== null && state.lastTwoDigits % 2 === 0
            ? 'text-neon-green font-bold' : 'text-neon-pink font-bold'
          }>
            {state.lastTwoDigits !== null && state.lastTwoDigits % 2 === 0 ? 'EVEN' : 'ODD'}
          </span>
        </span>
        {state.currentBet && (
          <span>
            You bet{' '}
            <span className={state.currentBet.type === 'even' ? 'text-neon-green' : 'text-neon-pink'}>
              {state.currentBet.type.toUpperCase()}
            </span>
            {' '}${state.currentBet.amount}
            {won
              ? <span className="text-neon-green font-bold"> → +${state.currentBet.amount}</span>
              : <span className="text-neon-pink font-bold"> → -${state.currentBet.amount}</span>
            }
          </span>
        )}
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={playAgain}
        className="
          px-8 py-3 rounded-xl font-display text-sm font-bold cursor-pointer
          bg-pyth/15 text-pyth border-2 border-pyth/40
          hover:bg-pyth/25 hover:shadow-[0_0_20px_rgba(123,47,212,0.3)]
          transition-all
        "
      >
        PLAY AGAIN
      </motion.button>
    </motion.div>
  )
}
