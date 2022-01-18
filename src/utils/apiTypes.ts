export interface UserInfoResponse {
  wallet: string;
  logged: boolean;
  features: string[];
  personalWallet: {
    tokens: {
      name: string;
      symbol: string;
      address: string;
      decimals: number;
      amount: number;
      currentPrice: number;
      currentPriceInCrypto: number;
      currentTotalPrice: string;
      currentTotalPriceInCrypto: string;
      earningInCrypto?: number;
      earningInUsdt?: number;
      earningPercentageInCrypto?: number;
      earningPercentageInUsdt?: number;
    }[];
  };
  pequodFarms: {
    id: string;
    address: string;
    token: {
      name: string;
      symbol: string;
      address: string;
      decimals: string;
      priceInUsd: string;
      priceInCrypto: string;
    };
    amount: string;
    farmPercentageAPY: number;
    platforms: [
      {
        name: string;
        url: string;
      }
    ];
    risk: string;
    initialAmountInToken: string;
    initialAmountInUsdt: string;
    earnedAMountAmount: string;
    totalEarningInToken: number;
    totalEarningInUsdt: null;
    unStackingAmount: number;
    secondsInStaking: number;
    unStakingTimeInSeconds: string;
  }[];
}

export interface AvailableFarmResponse {
  id: number;
  address: string;
  apy: number;
  active: boolean;
  periodInSeconds: number;
  timesToUnstake: number;
  minimumToStake: number;
  token: {
    address: string;
    symbol: string;
  };
}
