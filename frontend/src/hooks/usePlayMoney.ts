import { useState, useCallback } from 'react'

const STORAGE_KEY = 'pyth-roulette-balance'
const INITIAL_BALANCE = 1000

function loadBalance(): number {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) {
    const parsed = Number(stored)
    if (!isNaN(parsed)) return parsed
  }
  return INITIAL_BALANCE
}

export function usePlayMoney() {
  const [balance, setBalance] = useState(loadBalance)

  const deduct = useCallback((amount: number) => {
    setBalance(prev => {
      const next = prev - amount
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }, [])

  const add = useCallback((amount: number) => {
    setBalance(prev => {
      const next = prev + amount
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }, [])

  const reset = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, String(INITIAL_BALANCE))
    setBalance(INITIAL_BALANCE)
  }, [])

  return { balance, deduct, add, reset }
}
