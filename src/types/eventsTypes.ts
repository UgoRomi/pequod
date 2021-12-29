export interface StakeRequest {
  wallet: string;
  signature: string;
  stakeInfo: { stakeId: string };
  token: { address: string; amount: string };
  txInfo: {
    operationTxHash: string;
    gasSpentInCrypto: string;
    gasSpentInUsdt: string;
  };
}
