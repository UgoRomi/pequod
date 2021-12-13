import axios from 'axios';

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function getLocale() {
  if (navigator.languages !== undefined) return navigator.languages[0];
  return navigator.language;
}

export async function getTokenPrice(
  token: string,
  library: any,
  account: string | null | undefined
) {
  const BNBAddress = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
  const pancakeFactoryAddress = '0xca143ce32fe78f1f7019d7d551a6402fc5350c73';

  // Get token/BNB pair address
  const factoryABI = (await axios.get('pancakeFactoryABI.json')).data;
  const factoryContract = new library.eth.Contract(
    factoryABI,
    pancakeFactoryAddress,
    { from: account }
  );
  const pairAddress = await factoryContract.methods
    .getPair(BNBAddress, token)
    .call();

  //Get token price
  const pairABI = (await axios.get('pancakePairABI.json')).data;
  const pairContract = new library.eth.Contract(pairABI, pairAddress, {
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
