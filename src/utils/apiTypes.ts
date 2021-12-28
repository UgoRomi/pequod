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
    }[];
  };
}
