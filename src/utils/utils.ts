import { useWeb3React } from '@web3-react/core';
import { AxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import { selectPequodApiInstance } from '../store/axiosInstancesSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectUserSignedMessage,
  setSignedMessage,
} from '../store/userInfoSlice';
import { UserInfoResponse } from './apiTypes';

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function getLocale() {
  if (navigator.languages !== undefined) return navigator.languages[0];
  return navigator.language;
}

export function useApiCall() {
  const validateSessionIfInvalid = useValidateSessionIfInvalid();
  const pequodApiInstance = useAppSelector(selectPequodApiInstance);
  const userSignedMessage = useAppSelector(selectUserSignedMessage);

  const apiCall = async (url: string, options: AxiosRequestConfig) => {
    const valid = await validateSessionIfInvalid();
    if (!valid) return;
    const newOptions: AxiosRequestConfig = {
      ...options,
      data: {
        ...options.data,
        signature: userSignedMessage,
        chainID: process.env.REACT_APP_CHAIN_ID,
      },
    };
    return pequodApiInstance(url, newOptions);
  };

  return apiCall;
}

export function useValidateSessionIfInvalid() {
  //const getUserInfo = useUserInfo();
  const signMessage = useSignMessage();
  const userSignedMessage = useAppSelector(selectUserSignedMessage);
  const getMessageToSign = useGetMessageToSign();
  const updateSignedMessage = useUpdateSignedMessage();

  const validateSessionIfInvalid = async () => {
    //const userData = await getUserInfo();
    //if (userData.logged && !!userSignedMessage) return true;
    if (userSignedMessage) return true;
    const messageToSign = await getMessageToSign();
    const signedMessage = await signMessage(messageToSign);
    if (!signedMessage) return false;
    await updateSignedMessage(signedMessage);
    return true;
  };

  return validateSessionIfInvalid;
}

export function useUserInfo() {
  const { account } = useWeb3React();
  const pequodApiInstance = useAppSelector(selectPequodApiInstance);
  const getUserInfo = async () => {
    // Check if the user is logged in
    const { data: userData }: { data: UserInfoResponse } =
      await pequodApiInstance.get(`/users/${account}/info`);
    return userData;
  };

  return getUserInfo;
}

export function useSignMessage() {
  const { library, account } = useWeb3React();

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
  const { account } = useWeb3React();
  const pequodApi = useAppSelector(selectPequodApiInstance);

  const getMessageToSign = async () => {
    const { data: messageToSign }: { data: string } = await pequodApi.get(
      `/users/signMessage/${account}`
    );
    return messageToSign;
  };

  return getMessageToSign;
}

export function useUpdateSignedMessage() {
  const { account } = useWeb3React();
  const pequodApi = useAppSelector(selectPequodApiInstance);
  const dispatch = useAppDispatch();

  const updateSignedMessage = async (signedMessage: string) => {
    dispatch(setSignedMessage(signedMessage));
    await pequodApi.get(`/users/signedMessage/${account}/${signedMessage}`);
  };

  return updateSignedMessage;
}
