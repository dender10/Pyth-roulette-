export function extractLastTwoDigits(priceStr: string, expo: number): number {
  const raw = BigInt(priceStr)
  const absExpo = Math.abs(expo)
  const divisor = 10n ** BigInt(absExpo)
  const whole = raw / divisor
  return Math.abs(Number(whole % 100n))
}

export function formatBtcPrice(priceStr: string, expo: number): string {
  const raw = BigInt(priceStr)
  const absExpo = Math.abs(expo)
  const divisor = 10n ** BigInt(absExpo)
  const whole = raw / divisor
  return `$${whole.toLocaleString()}`
}

export function isOdd(n: number): boolean {
  return n % 2 !== 0
}
