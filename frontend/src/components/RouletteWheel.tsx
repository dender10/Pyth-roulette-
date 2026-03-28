import { motion, AnimatePresence } from 'framer-motion'
import { useGameContext } from '../hooks/useGameState'
import { extractLastTwoDigits } from '../lib/priceUtils'

function generateConicGradient(): string {
  const segments: string[] = []
  const count = 50
  const sliceDeg = 360 / count
  for (let i = 0; i < count; i++) {
    const color = i % 2 === 0 ? '#7B2FD4' : '#ffffff'
    const start = i * sliceDeg
    const colorEnd = start + sliceDeg * 0.35
    const gapEnd = start + sliceDeg
    segments.push(`${color} ${start}deg, ${color} ${colorEnd}deg, #1a1035 ${colorEnd}deg, #1a1035 ${gapEnd}deg`)
  }
  return `conic-gradient(from 0deg, ${segments.join(', ')})`
}

const WHEEL_GRADIENT = generateConicGradient()

export function RouletteWheel() {
  const { state, priceData } = useGameContext()
  const isSpinning = state.phase === 'REQUESTING' || state.phase === 'WAITING'
  const isRevealing = state.phase === 'REVEALING'
  const hasResult = state.phase === 'RESULT'
  const isActive = isSpinning || isRevealing

  return (
    <div
      className="flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ height: isActive ? '300px' : '220px' }}
    >
    <motion.div
      animate={{ scale: isActive ? 1.3 : 1 }}
      transition={{ type: 'spring', stiffness: 80, damping: 20 }}
      className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center"
    >
      {/* Glow effect */}
      <div
        className="absolute inset-[-8px] rounded-full blur-xl opacity-40 transition-all duration-700 ease-in-out"
        style={{
          background: isSpinning
            ? 'radial-gradient(circle, rgba(123,47,212,0.5), rgba(123,47,212,0.2), transparent)'
            : hasResult && state.result === 'win'
              ? 'radial-gradient(circle, rgba(0,255,136,0.5), transparent)'
              : hasResult && state.result === 'lose'
                ? 'radial-gradient(circle, rgba(255,51,102,0.4), transparent)'
                : 'radial-gradient(circle, rgba(123,47,212,0.2), transparent)',
        }}
      />

      {/* Outer ring */}
      <motion.div
        animate={{
          rotate: isSpinning ? [0, 360] : isRevealing ? [0, 720] : 0,
        }}
        transition={
          isSpinning
            ? { duration: 2, repeat: Infinity, ease: 'linear' }
            : isRevealing
              ? { duration: 3, ease: [0.22, 1, 0.36, 1] }
              : { duration: 0.5, ease: 'easeOut' }
        }
        className="absolute inset-0 rounded-full"
        style={{
          background: WHEEL_GRADIENT,
          boxShadow: isSpinning
            ? '0 0 30px rgba(123,47,212,0.4), inset 0 0 30px rgba(0,0,0,0.5)'
            : '0 0 15px rgba(123,47,212,0.15), inset 0 0 20px rgba(0,0,0,0.4)',
        }}
      />

      {/* Pointer notch at top */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-pyth rotate-45 z-20 shadow-[0_0_8px_rgba(123,47,212,0.6)]" />

      {/* Inner circle */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-bg border-2 border-surface-light flex items-center justify-center z-10 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
        <AnimatePresence mode="wait">
          {hasResult && state.lastTwoDigits !== null ? (
            <motion.div
              key="result"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              className="flex flex-col items-center"
            >
              <span className="font-display text-3xl sm:text-4xl font-black text-pyth">
                {state.lastTwoDigits.toString().padStart(2, '0')}
              </span>
              <span className={`text-xs font-bold uppercase ${
                state.lastTwoDigits % 2 === 0 ? 'text-neon-green' : 'text-neon-pink'
              }`}>
                {state.lastTwoDigits % 2 === 0 ? 'EVEN' : 'ODD'}
              </span>
            </motion.div>
          ) : isActive && priceData ? (
            <motion.div
              key="live-digits"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex flex-col items-center"
            >
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={extractLastTwoDigits(priceData.price, priceData.expo)}
                  initial={{ scale: 1.3, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="font-display text-3xl sm:text-4xl font-black text-text"
                >
                  {extractLastTwoDigits(priceData.price, priceData.expo).toString().padStart(2, '0')}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.img
              key="logo"
              src="/pyth-logo.jpg"
              alt="Pyth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full"
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
    </div>
  )
}
