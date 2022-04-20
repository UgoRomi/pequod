import {useWeb3React} from "@web3-react/core";
import {toast} from "react-toastify";
import BEP20_ABI from "../BEP20.json";
import LAUNCHPAD_ABI from "../launchpadABI.json";
import LAUNCHPAD_BNB_ABI from "../launchpadBnbABI.json";
import PANCAKE_FACTORY_ABI from "../pancakeFactoryABI.json";
import PANCAKE_PAIR_ABI from "../pancakePairABI.json";
import PANCAKE_ROUTER_ABI from "../pancakeRouterABI.json";
import MOBY_STAKING_ABI from "../mobyStakingABI.json";
import {MaxUint256} from "@ethersproject/constants";
import {useBuyEvent, useSellEvent, useStakeEvent} from "./events";
import {toBigNumber, useValidateSessionIfInvalid} from "./utils";

function useGetPairAddress() {
  const {library, account} = useWeb3React();

  const getPairAddress = async (tokenAddress: string) => {
    const factoryContract = new library.eth.Contract(
      PANCAKE_FACTORY_ABI,
      process.env.REACT_APP_PANCAKE_FACTORY_ADDRESS,
      {from: account}
    );
    const pairAddress = await factoryContract.methods
      .getPair(process.env.REACT_APP_BNB_ADDRESS, tokenAddress)
      .call();
    return pairAddress;
  };
  return getPairAddress;
}

export function useGetTokenPrice() {
  const {library, account} = useWeb3React();
  const getPairAddress = useGetPairAddress();

  const getTokenPrice = async (tokenAddress: string) => {
    const tokenContract = new library.eth.Contract(BEP20_ABI, tokenAddress, {
      from: account,
    });
    const decimals = tokenContract.methods.decimals().call();

    // Get token/BNB pair address
    const pairAddress = await getPairAddress(tokenAddress);

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
      (tokenAddress.toLowerCase() ===
      process.env.REACT_APP_WOT_V2_ADDRESS?.toLowerCase()
        ? process.env.REACT_APP_USDT_ADDRESS
        : process.env.REACT_APP_BNB_ADDRESS);
    const {_reserve0: reserve0, _reserve1: reserve1} =
      await pairContract.methods.getReserves().call();
    return {
      BNBReserve: isBNBToken0 ? reserve0 : reserve1,
      tokenReserve: isBNBToken0 ? reserve1 : reserve0,
      tokenDecimals: decimals,
    };
  };
  return getTokenPrice;
}

// Get the current allowance for a given token
export function useAllowance() {
  const {library, account, active} = useWeb3React();

  const checkAllowance = async (tokenAddress: string, spender: string) => {
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
export function useApprove() {
  const {library, account, active} = useWeb3React();

  const approve = async (
    tokenAddress: string,
    spender: string
  ): Promise<boolean> => {
    if (!tokenAddress || !spender || !active) return false;

    const tokenContract = new library.eth.Contract(BEP20_ABI, tokenAddress, {
      from: account,
    });
    await tokenContract.methods
      .approve(spender, MaxUint256)
      .send({from: account});
    return true;
  };
  return approve;
}

function useGasPrice() {
  const {library} = useWeb3React();

  const getGasPrice = async (): Promise<number> => {
    const gasPrice = await library.eth.getGasPrice();
    return parseInt(gasPrice);
  };

  return getGasPrice;
}

export function useSwap(
  tokenAddress: string,
  amountFrom: string,
  amountTo: string,
  slippage: number
) {
  const {library, account} = useWeb3React();
  const getGasPrice = useGasPrice();
  const sellEvent = useSellEvent();
  const buyEvent = useBuyEvent();

  const swapData = async () => {
    const routerContract = new library.eth.Contract(
      PANCAKE_ROUTER_ABI,
      process.env.REACT_APP_PANCAKE_ROUTER_ADDRESS,
      {from: account}
    );

    // 1. Calculate the minimum amount out
    const minimumAmountOut =
      parseFloat(amountTo) - (parseFloat(amountTo) * slippage) / 100;
    // 2. Get deadline
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    // 3. Get the token to swap to/from
    const tokenContract = new library.eth.Contract(BEP20_ABI, tokenAddress, {
      from: account,
    });
    const tokenDecimals = parseInt(
      await tokenContract.methods.decimals().call()
    );

    const gasPrice = await getGasPrice();
    return {
      minimumAmountOut,
      deadline,
      amountFrom,
      routerContract,
      tokenAddress,
      gasPrice,
      tokenDecimals,
    };
  };

  const buy = async (): Promise<{success: boolean; txHash: string}> => {
    const {
      minimumAmountOut,
      deadline,
      amountFrom,
      routerContract,
      tokenAddress,
      gasPrice,
      tokenDecimals,
    } = await swapData();
    try {
      const path =
        tokenAddress.toLowerCase() ===
        process.env.REACT_APP_WOT_V2_ADDRESS?.toLowerCase()
          ? [
              process.env.REACT_APP_BNB_ADDRESS,
              process.env.REACT_APP_USDT_ADDRESS,
              tokenAddress,
            ]
          : [process.env.REACT_APP_BNB_ADDRESS, tokenAddress];

      const result = await routerContract.methods
        .swapExactETHForTokensSupportingFeeOnTransferTokens(
          toBigNumber(minimumAmountOut, tokenDecimals),
          path,
          account,
          deadline
        )
        .send({
          from: account,
          gasPrice,
          value: library.utils.toWei(amountFrom),
        });
      toast.success(`Swap successful!`);
      const gasUsed = library.utils.fromWei(
        (result.gasUsed * gasPrice).toString()
      );
      buyEvent(
        tokenAddress,
        minimumAmountOut.toString(),
        parseFloat(amountFrom),
        result.transactionHash,
        gasUsed
      );
      return {success: true, txHash: result.transactionHash};
    } catch (error) {
      toast.error(`There was an error in the transaction\nPlease retry`);
      console.error(error);
      return {success: false, txHash: ""};
    }
  };

  const sell = async (
    fullSell: boolean
  ): Promise<{success: boolean; txHash: string}> => {
    const {
      minimumAmountOut,
      deadline,
      amountFrom,
      routerContract,
      tokenAddress,
      gasPrice,
      tokenDecimals,
    } = await swapData();
    try {
      const path =
        tokenAddress.toLowerCase() ===
        process.env.REACT_APP_WOT_V2_ADDRESS?.toLowerCase()
          ? [
              tokenAddress,
              process.env.REACT_APP_USDT_ADDRESS,
              process.env.REACT_APP_BNB_ADDRESS,
            ]
          : [tokenAddress, process.env.REACT_APP_BNB_ADDRESS];
      console.log(path);
      const result = await routerContract.methods
        .swapExactTokensForETHSupportingFeeOnTransferTokens(
          toBigNumber(parseFloat(amountFrom), tokenDecimals),
          toBigNumber(minimumAmountOut, 18),
          path,
          account,
          deadline
        )
        .send({from: account, gasPrice});
      toast.success(`Swap successful!`);
      const gasUsed = library.utils.fromWei(
        (result.gasUsed * gasPrice).toString()
      );
      sellEvent(
        tokenAddress,
        minimumAmountOut.toString(),
        parseFloat(amountFrom),
        result.transactionHash,
        gasUsed,
        fullSell
      );
      return {success: true, txHash: result.transactionHash};
    } catch (error) {
      toast.error(`There was an error in the transaction\nPlease retry`);
      console.error(error);
      return {success: false, txHash: ""};
    }
  };
  return {buyCallback: buy, sellCallback: sell};
}

export function useWotStake() {
  const {library, account} = useWeb3React();
  const getGasPrice = useGasPrice();
  const stakeEvent = useStakeEvent();
  const validateSessionIfInvalid = useValidateSessionIfInvalid();

  const stake = async (
    stakingContractAddress: string,
    amount: string,
    stakeId: number
  ): Promise<{success: boolean; txHash: string}> => {
    const valid = await validateSessionIfInvalid();
    if (!valid) return {success: false, txHash: ""};
    const routerContract = new library.eth.Contract(
      MOBY_STAKING_ABI,
      stakingContractAddress,
      {from: account}
    );
    const gasPrice = await getGasPrice();
    try {
      const result = await routerContract.methods
        .deposit(amount)
        .send({from: account, gasPrice});
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
      return {success: true, txHash: result.transactionHash};
    } catch (error) {
      toast.error(
        `There was an error staking your ${process.env.REACT_APP_WOT_SYMBOL}\nPlease retry`
      );
      console.error(error);
      return {success: false, txHash: ""};
    }
  };
  return stake;
}

export function useLaunchpad(launchpadAddress: string) {
  const {library, account} = useWeb3React();
  const ABI =
    launchpadAddress === process.env.REACT_APP_LAUNCHPAD_ADDRESS
      ? LAUNCHPAD_ABI
      : LAUNCHPAD_BNB_ABI;

  const launchpadContract = new library.eth.Contract(ABI, launchpadAddress, {
    from: account,
  });
  const canClaim = async (): Promise<boolean> => {
    return await launchpadContract.methods.canClaim().call({from: account});
  };

  const claim = async (): Promise<{success: boolean; txHash?: string}> => {
    try {
      const result = await launchpadContract.methods
        ?.claim()
        .send({from: account});
      return {success: true, txHash: result.transactionHash};
    } catch (error) {
      toast.error(`There was error an claiming your tokens\nPlease retry`);
      console.error(error);
      return {success: false, txHash: ""};
    }
  };

  const amountOfTokenThatWillReceive = async (): Promise<number> => {
    try {
      const result = await launchpadContract.methods
        ?.amountOfTokenThatWillReceive()
        .call({from: account});
      return result;
    } catch (error) {
      toast.error(
        `There was an error checking how much you will receive\nPlease retry`
      );
      console.error(error);
      return 0;
    }
  };

  const getPresaleStatus = async (): Promise<{
    hardCap: number;
    softCap: number;
    currentRaised: number;
  }> => {
    try {
      const hardCap = library.utils.fromWei(
        await launchpadContract.methods?.hardCap().call({from: account})
      );
      const softCap = library.utils.fromWei(
        await launchpadContract.methods?.softCap().call({from: account})
      );
      const currentRaised = library.utils.fromWei(
        await launchpadContract.methods
          ?.totalContributed()
          .call({from: account})
      );
      return {hardCap, softCap, currentRaised};
    } catch (error) {
      toast.error(
        `There was an error checking the presale status\nPlease retry`
      );
      console.error(error);
      return {hardCap: 0, softCap: 0, currentRaised: 0};
    }
  };

  return {canClaim, claim, amountOfTokenThatWillReceive, getPresaleStatus};
}
