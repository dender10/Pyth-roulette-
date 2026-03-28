import { useCallback, useState } from 'react'
import { keccak256, toHex } from 'viem'
import { optimismSepolia } from 'viem/chains'
import { publicClient, walletClient, account, hasWallet } from '../config/chain'
import { ENTROPY_ADDRESS, DEFAULT_PROVIDER, FORTUNA_URL, entropyAbi } from '../config/entropy'

interface EntropyResult {
  randomNumber: string
  waitSeconds: number
}

export function useEntropy() {
  const [isRequesting, setIsRequesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestRandomness = useCallback(async (): Promise<EntropyResult> => {
    if (!hasWallet || !walletClient || !account) {
      // Demo fallback: simulate entropy with random wait time
      console.warn('No wallet configured — using demo randomness')
      const fakeRandom = crypto.getRandomValues(new Uint8Array(32))
      const waitSeconds = 3 + (fakeRandom[0] % 28)
      const randomNumber = toHex(fakeRandom, { size: 32 })
      await new Promise(r => setTimeout(r, 1500)) // Simulate network delay
      return { randomNumber, waitSeconds }
    }

    setIsRequesting(true)
    setError(null)

    try {
      // 1. Get fee
      const fee = await publicClient.readContract({
        address: ENTROPY_ADDRESS,
        abi: entropyAbi,
        functionName: 'getFee',
        args: [DEFAULT_PROVIDER],
      })

      // 2. Generate user random number + commitment
      const randomBytes = crypto.getRandomValues(new Uint8Array(32))
      const userRandom = toHex(randomBytes, { size: 32 })
      const userCommitment = keccak256(userRandom)

      // 3. Request randomness (service wallet auto-signs)
      const { result: sequenceNumber } = await publicClient.simulateContract({
        account,
        address: ENTROPY_ADDRESS,
        abi: entropyAbi,
        functionName: 'request',
        args: [DEFAULT_PROVIDER, userCommitment, true],
        value: fee,
      })

      const hash = await walletClient.writeContract({
        account,
        chain: optimismSepolia,
        address: ENTROPY_ADDRESS,
        abi: entropyAbi,
        functionName: 'request',
        args: [DEFAULT_PROVIDER, userCommitment, true],
        value: fee,
      })

      await publicClient.waitForTransactionReceipt({ hash })

      // 4. Poll Fortuna API for provider revelation
      let providerRevelation: `0x${string}` | null = null
      for (let i = 0; i < 30; i++) {
        try {
          const resp = await fetch(`${FORTUNA_URL}/${sequenceNumber}`)
          if (resp.ok) {
            const data = await resp.json()
            const raw = data.value?.data as string
            providerRevelation = raw?.startsWith('0x') ? raw as `0x${string}` : `0x${raw}` as `0x${string}`
            if (providerRevelation) break
          }
        } catch {
          // retry
        }
        await new Promise(r => setTimeout(r, 1000))
      }

      if (!providerRevelation) {
        throw new Error('Timed out waiting for Fortuna provider revelation')
      }

      // 5. Reveal
      const { result: randomNumber } = await publicClient.simulateContract({
        account,
        address: ENTROPY_ADDRESS,
        abi: entropyAbi,
        functionName: 'reveal',
        args: [DEFAULT_PROVIDER, sequenceNumber, userRandom as `0x${string}`, providerRevelation],
      })

      const revealHash = await walletClient.writeContract({
        account,
        chain: optimismSepolia,
        address: ENTROPY_ADDRESS,
        abi: entropyAbi,
        functionName: 'reveal',
        args: [DEFAULT_PROVIDER, sequenceNumber, userRandom as `0x${string}`, providerRevelation],
      })

      await publicClient.waitForTransactionReceipt({ hash: revealHash })

      // 6. Map to wait time (3-30 seconds)
      const waitSeconds = 3 + Number(BigInt(randomNumber) % 28n)

      return { randomNumber, waitSeconds }
    } catch (err) {
      console.error('Entropy error:', err)
      const message = err instanceof Error ? err.message : 'Entropy request failed'
      setError(message)
      throw err
    } finally {
      setIsRequesting(false)
    }
  }, [])

  return { requestRandomness, isRequesting, error }
}
