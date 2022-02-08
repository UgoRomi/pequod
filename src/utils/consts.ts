import Web3 from "web3";

export const WOT_STAKING_MIN_AMOUNT_1 = 100000000;
export const WOT_STAKING_MIN_AMOUNT_2 = 2000000000;
// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH_WEI = Web3.utils.toWei("0.01");
export const MIN_ETH = 0.01;
export enum EventType {
  BUY,
  SELL,
  STAKE,
}
