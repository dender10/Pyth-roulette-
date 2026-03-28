import { createWalletClient, createPublicClient, http, type Account } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { optimismSepolia } from 'viem/chains'

const RPC_URL = 'https://optimism-sepolia-rpc.publicnode.com'

export const publicClient = createPublicClient({
  chain: optimismSepolia,
  transport: http(RPC_URL),
})

let _account: Account | null = null
let _walletClient: ReturnType<typeof createWalletClient> | null = null

try {
  const pk = import.meta.env.VITE_PRIVATE_KEY
  if (pk && pk !== '0xYOUR_TESTNET_PRIVATE_KEY_HERE' && pk.startsWith('0x') && pk.length === 66) {
    _account = privateKeyToAccount(pk as `0x${string}`)
    _walletClient = createWalletClient({
      account: _account,
      chain: optimismSepolia,
      transport: http(RPC_URL),
    })
  }
} catch {
  console.warn('Invalid VITE_PRIVATE_KEY — Entropy features disabled. Price feeds still work.')
}

export const account = _account
export const walletClient = _walletClient
export const hasWallet = _account !== null
