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
  const pancakeFactoryAddress = '0xBCfCcbde45cE874adCB698cC183deBcF17952812';

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

  console.log(pairAddress);

  // //Get token price
  // const pairABI = (await axios.get('pancakePairABI.json')).data;
  // const pairContract = new library.eth.Contract(pairABI, pairAddress, {
  //   from: account,
  // });
  // const a = await pairContract.methods.getReserves().call();
  // console.log(a);
}
