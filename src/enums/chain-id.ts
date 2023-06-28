export enum ChainId {
  ZKSYNC_ERA = 324,
  ZKSYNC_ERA_TESTNET = 280
}

export const ChainNames = new Map<number, string>([
  [ChainId.ZKSYNC_ERA, 'zksync-era'],
  [ChainId.ZKSYNC_ERA_TESTNET, 'zksync-era-testnet']
]);
