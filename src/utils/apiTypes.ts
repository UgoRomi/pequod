export interface UserInfoResponse {
  wallet: string;
  logged: boolean;
  features: string[];
  tokens: [
    {
      name: string;
      symbol: string;
      address: string;
      decimals: number;
      amount: number;
      price: number;
      totalPrice: number;
    }
  ];
  farms: [
    {
      id: string;
      address: string;
      token: {
        name: string;
        symbol: string;
        address: string;
      };
      amount: number;
      price: number;
      totalPrice: number;
      farmAPY: number;
      platforms: [
        {
          name: string;
          url: string;
        }
      ];
      risk: string;
      initialAmount: number;
      totalEarning: number;
      stakingMinSeconds: number;
      unStackingAmount: number;
      unStackingTime: number;
    }
  ];
}
