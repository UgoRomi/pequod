import {useWeb3React} from '@web3-react/core';
import {AxiosRequestConfig} from 'axios';
import {toast} from 'react-toastify';
import {selectPequodApiInstance} from '../store/axiosInstancesSlice';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
  addUserFarms,
  FarmState,
  selectUserSignedMessage,
  setSignedMessage,
  setUserTokens,
  UserToken,
} from '../store/userInfoSlice';
import {UserInfoResponse} from './apiTypes';
import {v4 as uuidV4} from 'uuid';
import Web3 from 'web3';
import {setBnbUsdPrice} from '../store/pricesSlice';

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function getLocale() {
  if (navigator.languages !== undefined) return navigator.languages[0];
  return navigator.language;
}

export function useEventCall() {
  const validateSessionIfInvalid = useValidateSessionIfInvalid();
  const apiCall = useApiCall();

  const eventCall = async (url: string, options: AxiosRequestConfig) => {
    const valid = await validateSessionIfInvalid();
    if (!valid) return;
    return apiCall(url, options);
  };
  return eventCall;
}

export function useApiCall() {
  const pequodApiInstance = useAppSelector(selectPequodApiInstance);
  const userSignedMessage = useAppSelector(selectUserSignedMessage);

  const apiCall = (url: string, options: AxiosRequestConfig) => {
    const newOptions: AxiosRequestConfig = {
      ...options,
      data: {
        ...options.data,
        signature: userSignedMessage,
        chainId: process.env.REACT_APP_CHAIN_ID,
        uuid: uuidV4(),
      },
    };
    return pequodApiInstance(url, newOptions);
  };

  return apiCall;
}

export function useValidateSessionIfInvalid() {
  const getUserInfo = useUserInfo();
  const signMessage = useSignMessage();
  const userSignedMessage = useAppSelector(selectUserSignedMessage);
  const getMessageToSign = useGetMessageToSign();
  const updateSignedMessage = useUpdateSignedMessage();

  const validateSessionIfInvalid = async () => {
    const userData = await getUserInfo();
    if (userData?.logged && !!userSignedMessage) return true;
    const messageToSign = await getMessageToSign();
    const signedMessage = await signMessage(messageToSign);
    if (!signedMessage) return false;
    await updateSignedMessage(signedMessage);
    return true;
  };

  return validateSessionIfInvalid;
}

export function useUserInfo() {
  const {account, active} = useWeb3React();
  const pequodApiInstance = useAppSelector(selectPequodApiInstance);
  const dispatch = useAppDispatch();

  const getUserInfo = async () => {
    // Check if the user is logged in
    if (!active) return;
    const {data: userData}: {data: UserInfoResponse} =
      await pequodApiInstance.get(
        `/users/${account}/${process.env.REACT_APP_CHAIN_ID}/info`
      );
    if (!userData.logged) {
      dispatch(setSignedMessage(''));
      return;
    }
    const userFarms = userData?.pequodFarms?.map((farm): FarmState => {
      return {
        id: parseInt(farm.id),
        tokenAddress: farm.token.address,
        tokenUSDPrice: parseFloat(farm.token.priceInUsd),
        amountEarned: farm.totalEarningInToken,
        farmPercentageAPY: farm.farmPercentageAPY,
        totalAmount: parseFloat(farm.amount),
        unStakingTimeInSeconds: parseInt(farm.unStakingTimeInSeconds),
        tokenSymbol: farm.token.symbol,
        farmContractAddress: farm.address,
        secondsInStaking: farm.secondsInStaking,
        initialAmountInUsdt: farm.initialAmountInUsdt,
        totalEarningInToken: farm.totalEarningInToken,
        totalEarningInUsdt: farm.totalEarningInUsdt,
        initialAmountInToken: farm.initialAmountInToken,
        token: farm.token,
      };
    });
    if (userFarms) dispatch(addUserFarms(userFarms));

    const userTokens: UserToken[] =
      userData?.personalWallet?.tokens.map((token) => ({
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        amount: token.amount,
        totalInDollars: parseFloat(token.currentTotalPriceInUsdt),
        earningPercentage: token.earningPercentageInUsdt,
        takeProfit: token.takeProfit,
        logoUrl: token.logoUrl,
        stopLoss: token.stopLoss,
      })) || [];
    dispatch(setUserTokens(userTokens));

    const bnbUsdPrice =
      userData?.personalWallet?.tokens?.find(
        (token) =>
          token.address.toUpperCase() ===
          process.env.REACT_APP_BNB_ADDRESS?.toUpperCase()
      )?.currentPrice || 0;
    if (bnbUsdPrice) dispatch(setBnbUsdPrice(bnbUsdPrice));

    return userData;
  };

  return getUserInfo;
}

export function useSignMessage() {
  const {library, account} = useWeb3React();

  const sign = async (messageToSign: string) => {
    const signedMessage = await library.eth.personal.sign(
      messageToSign,
      account,
      ''
    );
    if (!signedMessage) {
      toast.error('Please sign the message before proceeding');
      return;
    }
    return signedMessage;
  };

  return sign;
}

export function useGetMessageToSign() {
  const {account} = useWeb3React();
  const pequodApi = useAppSelector(selectPequodApiInstance);

  const getMessageToSign = async () => {
    const {data: messageToSign}: {data: string} = await pequodApi.get(
      `/users/signMessage/${account}`
    );
    return messageToSign;
  };

  return getMessageToSign;
}

export function useUpdateSignedMessage() {
  const {account} = useWeb3React();
  const pequodApi = useAppSelector(selectPequodApiInstance);
  const dispatch = useAppDispatch();

  const updateSignedMessage = async (signedMessage: string) => {
    dispatch(setSignedMessage(signedMessage));
    await pequodApi.get(
      `/users/signedMessage/${account}/${process.env.REACT_APP_CHAIN_ID}/${signedMessage}`
    );
  };

  return updateSignedMessage;
}

export function secondsToDhms(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor((seconds % 3600) % 60);

  return `${d}d ${h}h ${m}m ${s}s`;
}

export function formatTokenAmount(amount: number) {
  return new Intl.NumberFormat('en-US', {}).format(amount);
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function toBigNumber(amount: number, decimals: number): string {
  switch (decimals) {
    case 0:
      return Web3.utils.toWei(amount.toFixed(0), 'noether');
    case 1:
      return Web3.utils.toWei(amount.toFixed(1), 'wei');
    case 3:
      return Web3.utils.toWei(amount.toFixed(3), 'kwei');
    case 6:
      return Web3.utils.toWei(amount.toFixed(6), 'mwei');
    case 9:
      return Web3.utils.toWei(amount.toFixed(9), 'gwei');
    case 12:
      return Web3.utils.toWei(amount.toFixed(12), 'szabo');
    case 15:
      return Web3.utils.toWei(amount.toFixed(15), 'finney');
    case 18:
      return Web3.utils.toWei(amount.toFixed(18), 'ether');
    case 21:
      return Web3.utils.toWei(amount.toFixed(21), 'grand');
    case 24:
      return Web3.utils.toWei(amount.toFixed(24), 'mether');
    case 27:
      return Web3.utils.toWei(amount.toFixed(27), 'gether');
    case 30:
      return Web3.utils.toWei(amount.toFixed(30), 'tether');
    default:
      return Web3.utils
        .toBN(Math.floor(amount))
        .mul(Web3.utils.toBN(Math.pow(10, decimals)))
        .toString();
  }
}
