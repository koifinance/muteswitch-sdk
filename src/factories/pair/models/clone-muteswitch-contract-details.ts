export interface CloneMuteSwitchContractDetailsV2 {
  routerAddress: string;
  factoryAddress: string;
  pairAddress: string;
}

export interface CloneMuteSwitchContractDetailsV3 {
  routerAddress: string;
  factoryAddress: string;
  quoterAddress: string;
}

export interface CloneMuteSwitchContractDetails {
  v2Override?: CloneMuteSwitchContractDetailsV2 | undefined;
  v3Override?: CloneMuteSwitchContractDetailsV3 | undefined;
}
