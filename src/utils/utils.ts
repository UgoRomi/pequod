import { AxiosInstance } from 'axios';
import Web3 from 'web3';
import { UserInfoResponse } from './apiTypes';

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function getLocale() {
  if (navigator.languages !== undefined) return navigator.languages[0];
  return navigator.language;
}

// Wrapper around axios to always do the checks before every request
export async function apiCall(
  url: string,
  options: any,
  account: string,
  web3: Web3,
  pequodApiInstance: AxiosInstance
) {
  await validateSessionIfInvalid(account, web3, pequodApiInstance);
  return pequodApiInstance(url, options);
}

export async function validateSessionIfInvalid(
  account: string,
  web3: Web3,
  pequodApiInstance: AxiosInstance
) {
  const { data: userData }: { data: UserInfoResponse } =
    await pequodApiInstance.get(`/users/${account}/info`);

  // If it's not logged get the message to sign and send it back signed
  if (userData.logged) return;
  const { data: messageToSign }: { data: string } = await pequodApiInstance.get(
    `/users/signMessage/${account}`
  );
  const signedMessage = await web3.eth.sign(messageToSign, account);
  await pequodApiInstance.get(
    `/users/signedMessage/${account}/${signedMessage}`
  );
}
