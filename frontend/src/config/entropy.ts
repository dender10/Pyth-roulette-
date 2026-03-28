export const ENTROPY_ADDRESS = '0x4821932D0CDd71225A6d914706A621e0389D7061' as const
export const DEFAULT_PROVIDER = '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344' as const
export const FORTUNA_URL = 'https://fortuna-staging.dourolabs.app/v1/chains/optimism-sepolia/revelations'

export const entropyAbi = [
  {
    name: 'request',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'provider', type: 'address' },
      { name: 'userCommitment', type: 'bytes32' },
      { name: 'useBlockHash', type: 'bool' },
    ],
    outputs: [{ name: 'sequenceNumber', type: 'uint64' }],
  },
  {
    name: 'reveal',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'provider', type: 'address' },
      { name: 'sequenceNumber', type: 'uint64' },
      { name: 'userRevelation', type: 'bytes32' },
      { name: 'providerRevelation', type: 'bytes32' },
    ],
    outputs: [{ name: 'randomNumber', type: 'bytes32' }],
  },
  {
    name: 'getFee',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'provider', type: 'address' }],
    outputs: [{ name: 'feeAmount', type: 'uint128' }],
  },
] as const
