export interface StakeEventRequest {
  wallet: string;
  stakeInfo: { stakeId: string };
  token: { address: string; amount: string };
  txInfo: {
    operationTxHash: string;
    gasSpentInCrypto: string;
    gasSpentInUsdt: string;
  };
}

export interface SellEventRequest {
  wallet: string;
  fullSell: boolean;
  token: {
    address: string;
    amount: string;
    valueReceivedInCrypto: string;
    valueReceivedInUsdt: string;
  };
  txInfo: {
    operationTxHash: string;
    gasSpentInCrypto: string;
    gasSpentInUsdt: string;
  };
}

export interface BuyEventRequest {
  wallet: string;
  token: {
    address: string;
    amount: string;
    valueSpentInCrypto: string;
    valueSpentInUsdt: string;
  };
  txInfo: {
    operationTxHash: string;
    gasSpentInCrypto: string;
    gasSpentInUsdt: string;
  };
}
