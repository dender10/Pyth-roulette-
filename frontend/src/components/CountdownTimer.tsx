import { motion } from 'framer-motion'
import { useGameContext } from '../hooks/useGameState'

export function CountdownTimer() {
  const { state } = useGameContext()

  if (state.phase !== 'WAITING' || state.countdownRemaining === null) return null

  const total = state.waitSeconds ?? 1
  const remaining = state.countdownRemaining
  const progress = 1 - remaining / total
  const circumference = 2 * Math.PI * 54

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-text-dim text-sm uppercase tracking-wider">
        Pyth Entropy countdown
      </p>
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Progress ring */}
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r="54"
            fill="none" stroke="#2a1d4e" strokeWidth="6"
          />
          <motion.circle
            cx="60" cy="60" r="54"
            fill="none" stroke="#7B2FD4" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - progress) }}
            transition={{ duration: 0.5, ease: 'linear' }}
            style={{ filter: 'drop-shadow(0 0 6px rgba(123,47,212,0.6))' }}
          />
        </svg>
        {/* Number */}
        <motion.span
          key={remaining}
          initial={{ scale: 1.4, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-display text-4xl font-black text-text"
        >
          {remaining}
        </motion.span>
      </div>
      <p className="text-text-dim text-xs">
        Checking BTC price when timer hits 0
      </p>
    </div>
  )
}
