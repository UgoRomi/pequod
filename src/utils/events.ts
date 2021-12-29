import { useWeb3React } from '@web3-react/core';
import { useAppSelector } from '../store/hooks';
import { selectBnbUsdPrice } from '../store/pricesSlice';
import { selectUserSignedMessage } from '../store/userInfoSlice';
import { StakeRequest } from '../types/eventsTypes';
import { useApiCall } from './utils';

export function useStakeEvent() {
  const apiCall = useApiCall();
  const { account } = useWeb3React();
  const userSignature = useAppSelector(selectUserSignedMessage);
  const bnbUsdPrice = useAppSelector(selectBnbUsdPrice);

  const stake = async (
    stakeId: string,
    tokenAddress: string,
    tokenAmount: string,
    txHash: string,
    gasSpent: number
  ) => {
    const requestBody: StakeRequest = {
      wallet: account as string,
      signature: userSignature,
      stakeInfo: {
        stakeId,
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
