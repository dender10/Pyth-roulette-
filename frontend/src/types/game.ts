export type BetType = 'odd' | 'even'

export type GamePhase =
  | 'BETTING'
  | 'REQUESTING'
  | 'WAITING'
  | 'REVEALING'
  | 'RESULT'

export interface CurrentBet {
  type: BetType
  amount: number
}

export interface GameRound {
  id: number
  bet: BetType
  amount: number
  lastTwoDigits: number
  result: 'win' | 'lose'
  price: string
  timestamp: number
}

export interface GameState {
  phase: GamePhase
  balance: number
  currentBet: CurrentBet | null
  waitSeconds: number | null
  countdownRemaining: number | null
  lastPrice: string | null
  lastExpo: number | null
  lastTwoDigits: number | null
  result: 'win' | 'lose' | null
  history: GameRound[]
  error: string | null
}
