import { useWeb3React } from '@web3-react/core';
import { useAppSelector } from '../store/hooks';
import { selectBnbUsdPrice } from '../store/pricesSlice';
import { selectUserSignedMessage } from '../store/userInfoSlice';
import { StakeEventRequest } from '../types/eventsTypes';
import { useApiCall } from './utils';

export function useStakeEvent() {
  const apiCall = useApiCall();
  const { account } = useWeb3React();
  const userSignature = useAppSelector(selectUserSignedMessage);
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
      signature: userSignature,
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
