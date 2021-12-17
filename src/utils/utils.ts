import axios, { AxiosInstance } from 'axios';
import Web3 from 'web3';
import { UserInfoResponse } from './apiTypes';

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function getLocale() {
  if (navigator.languages !== undefined) return navigator.languages[0];
  return navigator.language;
}

export async function getTokenPrice(
  token: string,
  web3: any,
  account: string | null | undefined
) {
  const BNBAddress = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
  const pancakeFactoryAddress = '0xca143ce32fe78f1f7019d7d551a6402fc5350c73';

  // Get token/BNB pair address
  const factoryABI = (await axios.get('pancakeFactoryABI.json')).data;
  const factoryContract = new web3.eth.Contract(
    factoryABI,
    pancakeFactoryAddress,
    { from: account }
  );
  const pairAddress = await factoryContract.methods
    .getPair(BNBAddress, token)
    .call();

  //Get token price
  const pairABI = (await axios.get('pancakePairABI.json')).data;
  const pairContract = new web3.eth.Contract(pairABI, pairAddress, {
    from: account,
  });
  // I have to check if BNB is the token 0 because it changes for every pair
  const isBNBToken0 =
    (await pairContract.methods.token0().call()) === BNBAddress;
  const { _reserve0: reserve0, _reserve1: reserve1 } =
    await pairContract.methods.getReserves().call();
  return {
    BNBReserve: isBNBToken0 ? reserve0 : reserve1,
    tokenReserve: isBNBToken0 ? reserve1 : reserve0,
  };
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
