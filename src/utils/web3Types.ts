export interface GetTransactionResponse {
  hash: string;
  nonce: number;
  blockHash: string;
  blockNumber: number;
  transactionIndex: number;
  from: string;
  to: string;
  value: string;
  gas: number;
  gasPrice: string;
  input: string;
}

export enum PresaleStatuses {
  "NOT_STARTED_YET",
  "WHITELIST_IN_PROGRESS",
  "PUBLIC_IN_PROGRESS",
  "HARD_CAP_REACHED",
  "CLOSED",
  "CLAIMABLE",
}
