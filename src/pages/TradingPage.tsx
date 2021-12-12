import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Carousel from 'react-multi-carousel';
import {
  CogIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
} from '@heroicons/react/outline';
import { classNames } from '../utils/utils';
import PercentagesGroup from '../components/PercentagesGroup';
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
import { useAppDispatch } from '../store/hooks';
import { openTradeSettingsDialog } from '../store/tradeDialogSlice';
import TradeSettingsDialog from '../components/TradeSettingsDialog';
import PairChart from '../components/PairChart';
import Web3 from 'web3';
interface AvailableStaking {
  tokenName: string;
  tokenImage: string;
  tokenSymbol: string;
  totalAmountInStaking: number;
  userAmountInStaking: number;
  APYPercentage: number;
  totalEarned: number;
  totalBalance: number;
  tokenPriceUSD: number;
}

interface TokenSearchResult {
  name: string;
  address: string;
  symbol: string;
}

interface TokenDetails {
  name: string;
  symbol: string;
  price: string;
  priceBNB: string;
  address: string;
}

interface PancakeApiResponse {
  updated_at: number;
  data: {
    name: string;
    symbol: string;
    price: string;
    price_BNB: string;
  };
}

interface PequodPairPriceHistoryApiResponse {
  date: string;
  open: number;
  low: number;
  high: number;
  close: number;
  volume: number;
}

interface GraphData {
  time: Date;
  value: number;
}

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 4,
    partialVisibilityGutter: 30,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    partialVisibilityGutter: 30,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1.5,
    partialVisibilityGutter: 30,
  },
};

export default function TradingPage() {
  const [staking, setStaking] = useState<AvailableStaking[]>([]);
  const [tokenSearch, setTokenSearch] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchResults, setSearchResults] = useState<TokenSearchResult[]>([]);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [currentlySelectedTab, setCurrentlySelectedTab] = useState<
    'buy' | 'sell'
  >('buy');
  const [amountFrom, setAmountFrom] = useState<number>(0);
  const [amountTo, setAmountTo] = useState<number>(0);
  const [slippage, setSlippage] = useState<number>(1);
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [takeProfit, setTakeProfit] = useState<number>(0);
  const [hoverValue, setHoverValue] = useState<number | undefined>();
  const [hoverDate, setHoverDate] = useState<string | undefined>();
  const [priceHistory, setPriceHistory] = useState<GraphData[]>([]);
  const [selectedTokenInfo, setSelectedTokenInfo] =
    useState<TokenDetails | null>(null);
  const dispatch = useAppDispatch();
  const { library, account } = useWeb3React();
  const currentDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const updateFrom = (value: number) => {
    setAmountFrom(value);
    if (!selectedTokenInfo) return;
    setAmountTo(value / parseFloat(selectedTokenInfo.priceBNB));
  };

  const updateTo = (value: number) => {
    setAmountTo(value);
    if (!selectedTokenInfo) return;
    setAmountFrom(value * parseFloat(selectedTokenInfo.priceBNB));
  };

  const formatAmount = (amount: number): string => {
    if (amount.toString().indexOf('e') === -1) return amount.toString();

    return amount.toFixed(15);
  };

  const formatPrice = (price: number): string => {
    const minimum = 0.000001;
    if (price < minimum) return `<${minimum.toString()}`;
    return price.toString();
  };

  useEffect(() => {
    axios
      .get('http://localhost:3001/staking')
      .then((res) => {
        setStaking(res.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          'There was an error retrieving available staking options\nPlease try reloading this page'
        );
      });
  }, []);

  // TODO: Uncomment when our search API is ready
  // useEffect(() => {
  //   if (!tokenSearch) {
  //     setSearchResults([]);
  //     return;
  //   }
  //   const searchTokens = setTimeout(() => {
  //     axios
  //       .get(`http://localhost:3001/tokens/${tokenSearch}`)
  //       .then((res) => {
  //         setSearchResults(res.data);
  //       })
  //       .catch((err) => {
  //         console.error(err);
  //         toast.error('Error retrieving tokens, please retry');
  //       });
  //   }, 200);

  //   return () => clearTimeout(searchTokens);
  // }, [tokenSearch]);

  useEffect(() => {
    if (!Web3.utils.isAddress(tokenSearch)) return;

    const searchTokens = setTimeout(() => {
      handleTokenSearch(tokenSearch);
    }, 200);

    return () => clearTimeout(searchTokens);
  }, [tokenSearch]);

  const handleTokenSearch = (tokenAddress: string) => {
    // Get token info from pancake API
    axios
      .get(`https://api.pancakeswap.info/api/v2/tokens/${tokenAddress}`)
      .then((res) => {
        const { data: response }: { data: PancakeApiResponse } = res;
        const { price_BNB: priceBNB, name, symbol, price } = response.data;
        setSelectedTokenInfo({
          name,
          symbol,
          price,
          priceBNB,
          address: tokenAddress,
        });
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          'Error retrieving token details from pancakeSwap, please retry'
        );
      });

    // Get price history from our API
    axios
      .get(
        `https://pequod-node-develop.herokuapp.com/tokens/price/history/${tokenAddress}/bnb`
      )
      .then((res) => {
        const {
          data: response,
        }: { data: PequodPairPriceHistoryApiResponse[] } = res;
        const priceHistory: GraphData[] = response.map((item) => ({
          time: new Date(item.date),
          value: item.close,
        }));
        setPriceHistory(priceHistory);
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          'Error retrieving token details from our API, please retry'
        );
      });
  };

  const swap = async () => {
    const provider = new JsonRpcProvider('https://bsc-dataseed.binance.org/');
    const token = await Fetcher.fetchTokenData(
      ChainId.MAINNET,
      selectedTokenInfo!.address,
      provider
    );
    const pair = await Fetcher.fetchPairData(
      token,
      WETH[token.chainId],
      provider
    );
    const route = new Route([pair], WETH[token.chainId]);
    const trade = new Trade(
      route,
      new TokenAmount(
        WETH[token.chainId],
        library.utils.toWei(amountFrom.toString())
      ),
      TradeType.EXACT_INPUT
    );

    // Slippage
    const slippageTolerance = new Percent((slippage * 100).toString(), '10000');
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;
    const path = [WETH[token.chainId].address, token.address];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const value = trade.inputAmount.raw;

    // get router ABI
    const routerABI = (await axios.get('pancakeRouterABI.json')).data;

    const routerContract = new library.eth.Contract(
      routerABI,
      '0x10ed43c718714eb63d5aa57b78b54704e256024e', // pancake router address
      { from: account }
    );
    const data = routerContract.methods.swapExactETHForTokens(
      library.utils.toHex(amountOutMin.toString()),
      path,
      account,
      library.utils.toHex(deadline)
    );
    const nonce = await library.eth.getTransactionCount(account);
    const rawTransaction = {
      from: account,
      gasPrice: library.utils.toHex(5000000000),
      gas: library.utils.toHex(290000),
      to: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // pancake router address
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

  const openDialog = () => {
    dispatch(openTradeSettingsDialog());
  };

  return (
    <>
      <div>
        <div className='flex flex-col gap-11'>
          <Carousel
            itemClass='mx-4'
            responsive={responsive}
            slidesToSlide={1}
            swipeable
            draggable
            infinite
          >
            {staking.map((token, i) => (
              <div
                key={i}
                className='rounded-md border-2 border-purple-400 bg-white shadow-md p-2 h-full'
              >
                <div className='flex items-center gap-4'>
                  <img
                    src={token.tokenImage}
                    alt={token.tokenName}
                    className='h-10'
                  />
                  <div>
                    <p className='font-bold'>{token.tokenSymbol}</p>
                    <span className='text-sm opacity-75'>
                      APY - {token.APYPercentage}%
                    </span>
                  </div>
                </div>
                <div className='flex items-center justify-between mt-4'>
                  {token.userAmountInStaking > 0 ? (
                    <>
                      <div className='text-xs w-2/3 flex justify-evenly'>
                        <div>
                          <p className='font-semibold'>Earned</p>
                          <p>{token.totalEarned}</p>
                          <p>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(token.totalEarned * token.tokenPriceUSD)}
                          </p>
                        </div>
                        <div className='border-r' aria-hidden></div>
                        <div>
                          <p className='font-semibold'>Balance</p>
                          <p>{token.totalBalance}</p>
                          <p>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(token.totalBalance * token.tokenPriceUSD)}
                          </p>
                        </div>
                      </div>
                      <div className='flex w-1/3 justify-center h-full'>
                        <button className='bg-purple-400 text-white font-bold py-2 px-4 rounded-md'>
                          <PlusIcon className='w-5' />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='text-sm'>
                        <p className='font-semibold'>Total staking</p>
                        <p>{token.totalAmountInStaking}</p>
                      </div>
                      <button className='bg-purple-400 text-white font-bold py-2 px-4 rounded-md'>
                        Stake now
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </Carousel>
          <div className='grid grid-rows-buy grid-cols-2 gap-y-8 lg:bg-white lg:p-5 lg:border-2 lg:border-purple-400 lg:rounded-md'>
            <div className='col-span-2 gap-2 lg:gap-0 grid grid-cols-buy'>
              <div className='flex-1 flex flex-col'>
                <p className='font-bold m-auto mb-3 text-md text-gray-800'>
                  Search token
                </p>
                <form className='w-full flex justify-center md:ml-0'>
                  <label htmlFor='search-field' className='sr-only'>
                    Search
                  </label>
                  <div className='relative w-full text-gray-400 focus-within:text-gray-600 max-w-xl'>
                    <div className='absolute inset-y-0 left-2 flex items-center pointer-events-none'>
                      <SearchIcon className='h-5 w-5' aria-hidden='true' />
                    </div>
                    <input
                      id='search-field'
                      className='block w-full h-full pl-10 pr-3 py-2 bg-white lg:bg-purple-50 text-gray-600 focus:outline-none focus:ring focus:ring-purple-400 placeholder-gray-400 focus:placeholder-gray-400 sm:text-sm rounded-md'
                      placeholder='0xe861....'
                      type='search'
                      name='search'
                      value={tokenSearch}
                      onChange={(e) => setTokenSearch(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                    />
                    {searchResults?.length > 0 && searchFocused && (
                      <div className='z-10 mt-1 p-3 w-full shadow-md rounded-md absolute bg-white'>
                        {searchResults.map((token, i) => (
                          <div
                            className='cursor-pointer'
                            onClick={() => handleTokenSearch(token.address)}
                            key={token.address}
                          >
                            <span className='p-1 text-md text-gray-800 font-semibold'>
                              {token.name} - ${token.symbol}
                            </span>
                            <span className='block text-sm text-gray-600 overflow-hidden'>
                              {token.address}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </form>
              </div>
              <div className='flex justify-center items-end'>
                <button
                  type='button'
                  onClick={openDialog}
                  className='inline-flex items-center p-3 border border-transparent rounded-md max-h-12 shadow-sm text-white bg-purple-400 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                >
                  <CogIcon className='h-6 w-6' aria-hidden='true' />
                </button>
              </div>
            </div>
            <div className='col-span-2 lg:col-span-1 lg:border-r'>
              {selectedTokenInfo && (
                <span>
                  {selectedTokenInfo.symbol}/BNB{' '}
                  {formatPrice(
                    hoverValue || parseFloat(selectedTokenInfo.priceBNB)
                  )}
                </span>
              )}
              <span>{hoverDate || currentDate}</span>
              <div style={{ height: '90%', width: '100%' }}>
                <PairChart
                  data={priceHistory}
                  setHoverValue={setHoverValue}
                  setHoverDate={setHoverDate}
                  isChangePositive={true}
                />
              </div>{' '}
            </div>
            <div className='col-span-2 lg:col-span-1 grid grid-cols-2 gap-y-4 lg:border-l px-5 lg:px-28'>
              {/* 1st row */}
              <div className='flex justify-center border-r'>
                <button
                  type='button'
                  className={classNames(
                    currentlySelectedTab === 'buy'
                      ? 'bg-purple-100 border-transparent'
                      : 'bg-white border-purple-200',
                    'border-2 w-28 justify-center inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-md text-purple-700  hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                  )}
                  onClick={() => setCurrentlySelectedTab('buy')}
                >
                  Buy
                </button>
              </div>
              <div className='flex justify-center border-l'>
                <button
                  type='button'
                  className={classNames(
                    currentlySelectedTab === 'sell'
                      ? 'bg-purple-100 border-transparent'
                      : 'bg-white border-purple-200',
                    'border-2 w-28 justify-center inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-md text-purple-700  hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                  )}
                  onClick={() => setCurrentlySelectedTab('sell')}
                >
                  Sell
                </button>
              </div>
              {/* 2nd row */}
              <div className='col-span-2 w-full mx-auto'>
                <div className='flex justify-between'>
                  <label
                    htmlFor='amountFrom'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Total{' '}
                    {currentlySelectedTab === 'buy'
                      ? '(BNB)'
                      : `(${selectedTokenInfo?.symbol})`}
                  </label>
                </div>
                <div className='mt-1'>
                  <input
                    type='number'
                    name='amountFrom'
                    id='amountFrom'
                    min='0'
                    className='shadow-sm focus:outline-none focus:ring focus:ring-purple-400 block w-full sm:text-sm bg-purple-100 border-1 rounded-md px-2 py-1.5'
                    placeholder='0.0'
                    value={formatAmount(amountFrom)}
                    onChange={(e) => updateFrom(Number(e.target.value))}
                  />
                </div>
                <PercentagesGroup></PercentagesGroup>
              </div>
              {/* 3rd row */}
              <div className='col-span-2 w-full mx-auto'>
                <div className='flex justify-between'>
                  <label
                    htmlFor='amountTo'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Total{' '}
                    {currentlySelectedTab === 'buy'
                      ? `(${selectedTokenInfo?.symbol})`
                      : '(BNB)'}
                  </label>
                </div>
                <div className='mt-1'>
                  <input
                    type='number'
                    name='amountTo'
                    min='0'
                    id='amountTo'
                    className='shadow-sm focus:outline-none focus:ring focus:ring-purple-400 block w-full sm:text-sm bg-purple-100 border-1 rounded-md px-2 py-1.5'
                    placeholder='0.0'
                    value={formatAmount(amountTo)}
                    onChange={(e) => updateTo(Number(e.target.value))}
                  />
                </div>
              </div>
              {/* 4th row */}
              <div className='mr-5'>
                <label
                  htmlFor='takeProfit'
                  className='block text-sm font-medium text-gray-700'
                >
                  Take Profit (%)
                </label>
                <div className='mt-1 flex rounded-md shadow-sm'>
                  <button
                    type='button'
                    onClick={() =>
                      setTakeProfit(takeProfit <= 0 ? 0 : takeProfit - 1)
                    }
                    className='relative inline-flex items-center space-x-2 p-2 border border-gray-300 text-sm font-medium rounded-l-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
                  >
                    <MinusIcon
                      className='h-4 w-4 text-gray-500'
                      aria-hidden='true'
                    />
                  </button>
                  <div className='relative flex items-stretch flex-grow focus-within:z-10'>
                    <input
                      type='number'
                      name='takeProfit'
                      id='takeProfit'
                      min='0'
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(Number(e.target.value))}
                      className='focus:ring-purple-500 focus:border-purple-500 block w-full px-5 sm:text-sm border-gray-300'
                      placeholder='0'
                    />
                  </div>
                  <button
                    type='button'
                    onClick={() => setTakeProfit(takeProfit + 1)}
                    className='-ml-px relative inline-flex items-center space-x-2 p-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
                  >
                    <PlusIcon
                      className='h-4 w-4 text-gray-500'
                      aria-hidden='true'
                    />
                  </button>
                </div>
              </div>
              <div className='ml-5'>
                <label
                  htmlFor='stopLoss'
                  className='block text-sm font-medium text-gray-700'
                >
                  Stop Loss (%)
                </label>
                <div className='mt-1 flex rounded-md shadow-sm'>
                  <button
                    type='button'
                    onClick={() =>
                      setStopLoss(stopLoss <= 0 ? 0 : stopLoss - 1)
                    }
                    className='relative inline-flex items-center space-x-2 p-2 border border-gray-300 text-sm font-medium rounded-l-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
                  >
                    <MinusIcon
                      className='h-4 w-4 text-gray-500'
                      aria-hidden='true'
                    />
                  </button>
                  <div className='relative flex items-stretch flex-grow focus-within:z-10'>
                    <input
                      type='number'
                      name='stopLoss'
                      id='stopLoss'
                      min='0'
                      value={stopLoss}
                      onChange={(e) => setStopLoss(Number(e.target.value))}
                      className='focus:ring-purple-500 focus:border-purple-500 block w-full px-5 sm:text-sm border-gray-300'
                      placeholder='0'
                    />
                  </div>
                  <button
                    type='button'
                    onClick={() => setStopLoss(stopLoss + 1)}
                    className='-ml-px relative inline-flex items-center space-x-2 p-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
                  >
                    <PlusIcon
                      className='h-4 w-4 text-gray-500'
                      aria-hidden='true'
                    />
                  </button>
                </div>
              </div>
              {/* 5th row */}
              <div className='col-span-2 mt-5 flex justify-center'>
                <button
                  onClick={swap}
                  className='bg-purple-400 text-white py-2 px-4 rounded-md'
                >
                  Place order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TradeSettingsDialog slippage={slippage} setSlippage={setSlippage} />
    </>
  );
}
