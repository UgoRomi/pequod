import { AxiosInstance } from 'axios';
import { toast } from 'react-toastify';
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
  const valid = await validateSessionIfInvalid(
    account,
    web3,
    pequodApiInstance
  );
  if (!valid) {
    toast.error('Please sign the message before proceeding');
    return;
  }
  return pequodApiInstance(url, options);
}

export async function validateSessionIfInvalid(
  account: string,
  web3: Web3,
  pequodApiInstance: AxiosInstance
): Promise<boolean> {
  const { data: userData }: { data: UserInfoResponse } =
    await pequodApiInstance.get(`/users/${account}/info`);

  // If it's not logged get the message to sign and send it back signed
  if (userData.logged) return true;
  const { data: messageToSign }: { data: string } = await pequodApiInstance.get(
    `/users/signMessage/${account}`
  );
  const signedMessage = await web3.eth.personal.sign(
    messageToSign,
    account,
    ''
  );
  if (!signedMessage) return false;
  await pequodApiInstance.get(
    `/users/signedMessage/${account}/${signedMessage}`
  );
  return true;
}
