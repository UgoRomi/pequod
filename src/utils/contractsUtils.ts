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
import MOBY_STAKING_ABI from '../mobyStakingABI.json';
import { MaxUint256 } from '@ethersproject/constants';
import { useAppDispatch } from '../store/hooks';
import { addTransaction } from '../store/transactionsSlice';
import { EventType } from './consts';
import { useStakeEvent } from './events';
import { useValidateSessionIfInvalid } from './utils';

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

export function useGetTokenPrice() {
  const { library, account } = useWeb3React();

  const getTokenPrice = async (token: string) => {
    // Get token/BNB pair address
    const factoryContract = new library.eth.Contract(
      PANCAKE_FACTORY_ABI,
      process.env.REACT_APP_PANCAKE_FACTORY_ADDRESS,
      { from: account }
    );
    const pairAddress = await factoryContract.methods
      .getPair(process.env.REACT_APP_BNB_ADDRESS, token)
      .call();

    //Get token price
    const pairContract = new library.eth.Contract(
      PANCAKE_PAIR_ABI,
      pairAddress,
      {
        from: account,
      }
    );
    // I have to check if BNB is the token 0 because it changes for every pair
    const isBNBToken0 =
      (await pairContract.methods.token0().call()) ===
      process.env.REACT_APP_BNB_ADDRESS;
    const { _reserve0: reserve0, _reserve1: reserve1 } =
      await pairContract.methods.getReserves().call();
    return {
      BNBReserve: isBNBToken0 ? reserve0 : reserve1,
      tokenReserve: isBNBToken0 ? reserve1 : reserve0,
    };
  };
  return getTokenPrice;
}

// Get the current allowance for a given token
export function useAllowance(tokenAddress: string, spender: string) {
  const { library, account, active } = useWeb3React();

  const checkAllowance = async () => {
    if (!tokenAddress || !spender || !active) return 0;
    const tokenContract = new library.eth.Contract(BEP20_ABI, tokenAddress, {
      from: account,
    });
    const allowance: string = await tokenContract.methods
      .allowance(account, spender)
      .call();
    return parseFloat(allowance);
  };

  return checkAllowance;
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApprove(tokenAddress: string, spender: string) {
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

function useGasPrice() {
  const { library } = useWeb3React();

  const getGasPrice = async () => {
    const gasPrice = await library.eth.getGasPrice();
    return gasPrice;
  };

  return getGasPrice;
}

export function useSwap(
  tokenAddress: string,
  amount: string,
  slippage: number
) {
  const { library, account } = useWeb3React();
  const getGasPrice = useGasPrice();
  const dispatch = useAppDispatch();

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

    const tradeAmount =
      bnbInOrOut === 'out'
        ? new TokenAmount(input, library.utils.toWei(amount, unit))
        : new TokenAmount(input, library.utils.toWei(amount));

    const trade = new Trade(route, tradeAmount, TradeType.EXACT_INPUT);

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
    const gasPrice = await getGasPrice();
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

    library.eth.sendTransaction(rawTransaction, (err: any, hash: string) => {
      if (err) {
        console.error(err);
        toast.error('Error sending transaction');
        return;
      }
      dispatch(
        addTransaction({
          txHash: hash,
          type: EventType.BUY,
          addedTimestamp: Date.now(),
        })
      );
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
      gas: library.utils.toHex(1000000),
      to: process.env.REACT_APP_PANCAKE_ROUTER_ADDRESS,
      data: data.encodeABI(),
      nonce: library.utils.toHex(nonce),
    };

    library.eth.sendTransaction(rawTransaction, (err: any, hash: string) => {
      if (err) {
        console.error(err);
        toast.error('Error sending transaction');
        return;
      }
      dispatch(
        addTransaction({
          txHash: hash,
          type: EventType.SELL,
          addedTimestamp: Date.now(),
        })
      );
    });
  };
  return { buyCallback: buy, sellCallback: sell };
}

export function useWotStake() {
  const { library, account } = useWeb3React();
  const getGasPrice = useGasPrice();
  const stakeEvent = useStakeEvent();
  const validateSessionIfInvalid = useValidateSessionIfInvalid();

  const stake = async (
    stakingContractAddress: string,
    amount: string,
    stakeId: string
  ): Promise<{ success: boolean; txHash: string }> => {
    const valid = await validateSessionIfInvalid();
    if (!valid) return { success: false, txHash: '' };
    const routerContract = new library.eth.Contract(
      MOBY_STAKING_ABI,
      stakingContractAddress,
      { from: account }
    );
    const gasPrice = await getGasPrice();
    try {
      const result = await routerContract.methods
        .deposit(amount)
        .send({ from: account, gasPrice });
      toast.success(`${amount} ${process.env.REACT_APP_WOT_SYMBOL} Staked`);
      const gasUsed = library.utils.fromWei(
        (result.gasUsed * gasPrice).toString()
      );

      stakeEvent(
        stakeId,
        process.env.REACT_APP_WOT_ADDRESS as string,
        amount,
        result.transactionHash,
        gasUsed
      );
      return { success: true, txHash: result.transactionHash };
    } catch (e) {
      toast.error(
        `There was an error staking your ${process.env.REACT_APP_WOT_SYMBOL}\nPlease retry`
      );
      console.error(e);
      return { success: false, txHash: '' };
    }
    // No need to use
  };
  return stake;
}
