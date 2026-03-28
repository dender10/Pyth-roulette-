import { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react'
import type { GameState, GamePhase, BetType, GameRound } from '../types/game'
import { usePlayMoney } from './usePlayMoney'
import { useBtcPrice } from './useBtcPrice'
import { useEntropy } from './useEntropy'
import { extractLastTwoDigits, isOdd } from '../lib/priceUtils'

type GameAction =
  | { type: 'PLACE_BET'; betType: BetType; amount: number }
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'SET_WAIT'; waitSeconds: number }
  | { type: 'TICK_COUNTDOWN' }
  | { type: 'REVEAL'; price: string; expo: number; lastTwoDigits: number; result: 'win' | 'lose' }
  | { type: 'ADD_HISTORY'; round: GameRound }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESET_ROUND' }

const initialState: GameState = {
  phase: 'BETTING',
  balance: 1000,
  currentBet: null,
  waitSeconds: null,
  countdownRemaining: null,
  lastPrice: null,
  lastExpo: null,
  lastTwoDigits: null,
  result: null,
  history: [],
  error: null,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'PLACE_BET':
      return {
        ...state,
        currentBet: { type: action.betType, amount: action.amount },
        phase: 'REQUESTING',
        error: null,
      }
    case 'SET_PHASE':
      return { ...state, phase: action.phase }
    case 'SET_WAIT':
      return {
        ...state,
        waitSeconds: action.waitSeconds,
        countdownRemaining: action.waitSeconds,
        phase: 'WAITING',
      }
    case 'TICK_COUNTDOWN':
      return {
        ...state,
        countdownRemaining: state.countdownRemaining !== null
          ? Math.max(0, state.countdownRemaining - 1)
          : null,
      }
    case 'REVEAL':
      return {
        ...state,
        phase: 'RESULT',
        lastPrice: action.price,
        lastExpo: action.expo,
        lastTwoDigits: action.lastTwoDigits,
        result: action.result,
      }
    case 'ADD_HISTORY':
      return {
        ...state,
        history: [action.round, ...state.history].slice(0, 20),
      }
    case 'SET_ERROR':
      return { ...state, error: action.error, phase: 'BETTING' }
    case 'RESET_ROUND':
      return {
        ...state,
        phase: 'BETTING',
        currentBet: null,
        waitSeconds: null,
        countdownRemaining: null,
        lastTwoDigits: null,
        result: null,
        error: null,
      }
    default:
      return state
  }
}

interface GameContextValue {
  state: GameState
  priceData: ReturnType<typeof useBtcPrice>['priceData']
  priceConnected: boolean
  placeBet: (betType: BetType, amount: number) => void
  playAgain: () => void
  resetBalance: () => void
  balance: number
}

export const GameContext = createContext<GameContextValue | null>(null)

export function useGameContext() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGameContext must be used within GameProvider')
  return ctx
}

export function useGameProvider(): GameContextValue {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const { balance, deduct, add, reset: resetBalance } = usePlayMoney()
  const { priceData, connected: priceConnected, fetchCurrentPrice } = useBtcPrice()
  const { requestRandomness } = useEntropy()
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  const placeBet = useCallback(async (betType: BetType, amount: number) => {
    if (balance < amount) {
      dispatch({ type: 'SET_ERROR', error: 'Insufficient balance' })
      return
    }

    deduct(amount)
    dispatch({ type: 'PLACE_BET', betType, amount })

    try {
      // Request entropy
      const { waitSeconds } = await requestRandomness()
      dispatch({ type: 'SET_WAIT', waitSeconds })

      // Start countdown
      let remaining = waitSeconds
      countdownRef.current = setInterval(() => {
        remaining--
        dispatch({ type: 'TICK_COUNTDOWN' })

        if (remaining <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          countdownRef.current = null

          // Reveal phase
          dispatch({ type: 'SET_PHASE', phase: 'REVEALING' })

          fetchCurrentPrice().then(data => {
            const lastTwoDigits = extractLastTwoDigits(data.price, data.expo)
            const digitIsOdd = isOdd(lastTwoDigits)
            const won = (betType === 'odd' && digitIsOdd) || (betType === 'even' && !digitIsOdd)

            if (won) add(amount * 2)

            dispatch({
              type: 'REVEAL',
              price: data.price,
              expo: data.expo,
              lastTwoDigits,
              result: won ? 'win' : 'lose',
            })

            dispatch({
              type: 'ADD_HISTORY',
              round: {
                id: Date.now(),
                bet: betType,
                amount,
                lastTwoDigits,
                result: won ? 'win' : 'lose',
                price: data.price,
                timestamp: Date.now(),
              },
            })
          }).catch(() => {
            // Fallback: use last known price from SSE
            if (priceData) {
              const lastTwoDigits = extractLastTwoDigits(priceData.price, priceData.expo)
              const digitIsOdd = isOdd(lastTwoDigits)
              const won = (betType === 'odd' && digitIsOdd) || (betType === 'even' && !digitIsOdd)
              if (won) add(amount * 2)
              dispatch({
                type: 'REVEAL',
                price: priceData.price,
                expo: priceData.expo,
                lastTwoDigits,
                result: won ? 'win' : 'lose',
              })
              dispatch({
                type: 'ADD_HISTORY',
                round: {
                  id: Date.now(),
                  bet: betType,
                  amount,
                  lastTwoDigits,
                  result: won ? 'win' : 'lose',
                  price: priceData.price,
                  timestamp: Date.now(),
                },
              })
            }
          })
        }
      }, 1000)
    } catch {
      // Refund on entropy failure
      add(amount)
      dispatch({ type: 'SET_ERROR', error: 'Failed to generate randomness. Try again.' })
    }
  }, [balance, deduct, add, requestRandomness, fetchCurrentPrice, priceData])

  const playAgain = useCallback(() => {
    dispatch({ type: 'RESET_ROUND' })
  }, [])

  return {
    state,
    priceData,
    priceConnected,
    placeBet,
    playAgain,
    resetBalance,
    balance,
  }
}
