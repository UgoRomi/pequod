import { useWeb3React } from '@web3-react/core';
import { useAppSelector } from '../store/hooks';
import { selectBnbUsdPrice } from '../store/pricesSlice';
import {
  BuyEventRequest,
  SellEventRequest,
  StakeEventRequest,
} from '../types/eventsTypes';
import { useApiCall } from './utils';

export function useStakeEvent() {
  const apiCall = useApiCall();
  const { account } = useWeb3React();
  const bnbUsdPrice = useAppSelector(selectBnbUsdPrice);

  const stake = async (
    stakeId: number,
    tokenAddress: string,
    tokenAmount: string,
    txHash: string,
    gasSpent: number
  ) => {
    const requestBody: StakeEventRequest = {
      wallet: account as string,
      stakeInfo: {
        stakeId: stakeId.toString(),
      },
      token: {
        address: tokenAddress,
        amount: tokenAmount,
      },
      txInfo: {
        operationTxHash: txHash,
        gasSpentInCrypto: gasSpent.toString(),
        gasSpentInUsdt: (gasSpent * bnbUsdPrice).toString(),
      },
    };
    apiCall(`/events/stake`, {
      method: 'POST',
      data: requestBody,
    });
  };
  return stake;
}

export function useBuyEvent() {
  const apiCall = useApiCall();
  const { account } = useWeb3React();
  const bnbUsdPrice = useAppSelector(selectBnbUsdPrice);

  const buy = async (
    tokenAddress: string,
    tokenAmount: string,
    bnbSpent: number,
    txHash: string,
    gasSpent: number
  ) => {
    const requestBody: BuyEventRequest = {
      wallet: account as string,
      token: {
        address: tokenAddress,
        amount: tokenAmount,
        valueSpentInCrypto: bnbSpent.toString(),
        valueSpentInUsdt: (bnbSpent * bnbUsdPrice).toString(),
      },
      txInfo: {
        operationTxHash: txHash,
        gasSpentInCrypto: gasSpent.toString(),
        gasSpentInUsdt: (gasSpent * bnbUsdPrice).toString(),
      },
    };
    apiCall(`/events/purchase`, {
      method: 'POST',
      data: requestBody,
    });
  };
  return buy;
}

export function useSellEvent() {
  const apiCall = useApiCall();
  const { account } = useWeb3React();
  const bnbUsdPrice = useAppSelector(selectBnbUsdPrice);

  const sell = async (
    tokenAddress: string,
    tokenAmount: string,
    bnbSpent: number,
    txHash: string,
    gasSpent: number
  ) => {
    const requestBody: SellEventRequest = {
      wallet: account as string,
      token: {
        address: tokenAddress,
        amount: tokenAmount,
        valueReceivedInCrypto: bnbSpent.toString(),
        valueReceivedInUsdt: (bnbSpent * bnbUsdPrice).toString(),
      },
      txInfo: {
        operationTxHash: txHash,
        gasSpentInCrypto: gasSpent.toString(),
        gasSpentInUsdt: (gasSpent * bnbUsdPrice).toString(),
      },
    };
    apiCall(`/events/sell`, {
      method: 'POST',
      data: requestBody,
    });
  };
  return sell;
}
