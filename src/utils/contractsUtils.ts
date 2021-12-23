import { useWeb3React } from '@web3-react/core';
import { JsonRpcProvider } from '@ethersproject/providers';
import {
  Fetcher,
  ChainId,
  WETH,
  Trade,
  TokenAmount,
  TradeType,
  Percent,
  Route,
} from '@pancakeswap/sdk';
import { toast } from 'react-toastify';
import BEP20_ABI from '../BEP20.json';
import PANCAKE_FACTORY_ABI from '../pancakeFactoryABI.json';
import PANCAKE_PAIR_ABI from '../pancakePairABI.json';
import PANCAKE_ROUTER_ABI from '../pancakeRouterABI.json';
import { MaxUint256 } from '@ethersproject/constants';

interface UnitMap {
  noether: string;
  wei: string;
  kwei: string;
  Kwei: string;
  babbage: string;
  femtoether: string;
  mwei: string;
  Mwei: string;
  lovelace: string;
  picoether: string;
  gwei: string;
  Gwei: string;
  shannon: string;
  nanoether: string;
  nano: string;
  szabo: string;
  microether: string;
  micro: string;
  finney: string;
  milliether: string;
  milli: string;
  ether: string;
  kether: string;
  grand: string;
  mether: string;
  gether: string;
  tether: string;
}

export async function getTokenPrice(
  token: string,
  web3: any,
  account: string | undefined
) {
  const BNBAddress = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
  const pancakeFactoryAddress = '0xca143ce32fe78f1f7019d7d551a6402fc5350c73';

  // Get token/BNB pair address
  const factoryContract = new web3.eth.Contract(
    PANCAKE_FACTORY_ABI,
    pancakeFactoryAddress,
    { from: account }
  );
  const pairAddress = await factoryContract.methods
    .getPair(BNBAddress, token)
    .call();

  //Get token price
  const pairContract = new web3.eth.Contract(PANCAKE_PAIR_ABI, pairAddress, {
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

// Get the current allowance for a given token
export async function useAllowance(tokenAddress: string, spender: string) {
  const { library, account, active } = useWeb3React();
  if (!tokenAddress || !spender || !active) return 0;
  const tokenContract = new library.eth.Contract(BEP20_ABI, tokenAddress, {
    from: account,
  });
  const allowance = await tokenContract.methods
    .allowance(account, spender)
    .call();
  return allowance;
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApprove(spender: string, tokenAddress: string) {
  const { library, account, active } = useWeb3React();

  if (!tokenAddress || !spender || !active) return undefined;

  const tokenContract = new library.eth.Contract(BEP20_ABI, tokenAddress, {
    from: account,
  });
  const approve = () => {
    tokenContract.methods.approve(spender, MaxUint256).send({ from: account });
  };
  return approve;
}

export function useSwap(
  tokenAddress: string,
  amount: string,
  slippage: number
) {
  const { library, account } = useWeb3React();

  const swapData = async (bnbInOrOut: 'in' | 'out') => {
    const provider = new JsonRpcProvider('https://bsc-dataseed.binance.org/');
    const token = await Fetcher.fetchTokenData(
      ChainId.MAINNET,
      tokenAddress,
      provider
    );
    const pair = await Fetcher.fetchPairData(
      token,
      WETH[token.chainId],
      provider
    );
    // Input must be WETH for buy and token for sell
    const input = bnbInOrOut === 'in' ? WETH[token.chainId] : token;
    const output = bnbInOrOut === 'in' ? token : WETH[token.chainId];
    const route = new Route([pair], input, output);

    // Get which unit to convert from
    const units = library.utils.unitMap as UnitMap;
    let unit = units.wei;
    for (const [key, value] of Object.entries(units)) {
      if (value.length === token.decimals + 1) unit = key;
    }

    const trade = new Trade(
      route,
      new TokenAmount(input, library.utils.toWei(amount, unit)),
      TradeType.EXACT_INPUT
    );

    // Slippage
    const slippageTolerance = new Percent((slippage * 100).toString(), '10000');
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now
    const value = trade.maximumAmountIn(slippageTolerance).raw;

    // get router ABI

    const routerContract = new library.eth.Contract(
      PANCAKE_ROUTER_ABI,
      process.env.REACT_APP_PANCAKE_ROUTER_ADDRESS,
      { from: account }
    );
    const nonce = await library.eth.getTransactionCount(account);
    const gasPrice = await library.eth.getGasPrice();
    return {
      amountOutMin,
      deadline,
      value,
      nonce,
      routerContract,
      token,
      gasPrice,
    };
  };

  const buy = async () => {
    const {
      amountOutMin,
      deadline,
      value,
      nonce,
      routerContract,
      token,
      gasPrice,
    } = await swapData('in');

    const path = [WETH[token.chainId].address, token.address];
    const data =
      routerContract.methods.swapExactETHForTokensSupportingFeeOnTransferTokens(
        library.utils.toHex(amountOutMin.toString()),
        path,
        account,
        library.utils.toHex(deadline)
      );

    const rawTransaction = {
      from: account,
      gasPrice: library.utils.toHex(gasPrice),
      gas: library.utils.toHex(580000),
      to: process.env.REACT_APP_PANCAKE_ROUTER_ADDRESS,
      value: library.utils.toHex(value.toString()),
      data: data.encodeABI(),
      nonce: library.utils.toHex(nonce),
    };

    library.eth.sendTransaction(rawTransaction, (err: any, hash: any) => {
      if (err) {
        console.error(err);
        toast.error('Error sending transaction');
        return;
      }
      toast.success(`Transaction sent\nHash: ${hash}`);
    });
  };

  const sell = async () => {
    const {
      amountOutMin,
      deadline,
      value,
      nonce,
      routerContract,
      token,
      gasPrice,
    } = await swapData('out');

    const path = [token.address, WETH[token.chainId].address];
    const data =
      routerContract.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(
        library.utils.toHex(value.toString()),
        library.utils.toHex(amountOutMin.toString()),
        path,
        account,
        library.utils.toHex(deadline)
      );

    const rawTransaction = {
      from: account,
      gasPrice: library.utils.toHex(gasPrice),
      gas: library.utils.toHex(580000),
      to: process.env.REACT_APP_PANCAKE_ROUTER_ADDRESS,
      data: data.encodeABI(),
      nonce: library.utils.toHex(nonce),
    };

    library.eth.sendTransaction(rawTransaction, (err: any, hash: any) => {
      if (err) {
        console.error(err);
        toast.error('Error sending transaction');
        return;
      }
      toast.success(`Transaction sent\nHash: ${hash}`);
    });
  };
  return { buyCallback: buy, sellCallback: sell };
}
