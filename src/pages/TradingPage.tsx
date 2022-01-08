import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CogIcon, SearchIcon, PlusIcon } from '@heroicons/react/outline';
import { classNames, useApiCall } from '../utils/utils';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { openTradeSettingsDialog } from '../store/tradeDialogSlice';
import TradeSettingsDialog from '../components/TradeSettingsDialog';
import PairChart from '../components/PairChart';
import Web3 from 'web3';
import Carousel from 'react-multi-carousel';
import { PairDataTimeWindowEnum } from '../utils/chart';
import {
  useGetTokenPrice,
  useAllowance,
  useApprove,
  useSwap,
} from '../utils/contractsUtils';
import wotLogo from '../images/wot-logo.svg';

import { selectUserWotAmount } from '../store/userInfoSlice';
import PercentagesGroup, { Percentages } from '../components/PercentagesGroup';

interface TokenSearchResult {
  name: string;
  address: string;
  symbol: string;
}

interface TokenDetails {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  tokenReserve: number;
  BNBReserve: number;
  priceBNB: number;
  allowance: number;
  allowanceFetched: boolean;
}

interface TokenInfoResponse {
  name: string;
  symbol: string;
  decimals: number;
}

interface PairPriceHistoryApiResponse {
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
interface AvailableStaking {
  active: boolean;
  address: string;
  apy: number;
  id: number;
  minimumToStake: number;
  periodInSeconds: number;
  timesToUnstake: number;
  token: any;
  stakeInfo: any;
}

export default function TradingPage() {
  const userTokenBalance = useAppSelector(selectUserWotAmount);
  const [tokenSearch, setTokenSearch] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchResults, setSearchResults] = useState<TokenSearchResult[]>([]);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [percentageButtonActive, setPercentageButtonActive] =
    useState<number>(0);
  const [, setStakeAmount] = useState('25');

  const [currentlySelectedTab, setCurrentlySelectedTab] = useState<
    'buy' | 'sell'
  >('buy');
  const [amountFrom, setAmountFrom] = useState<string>('0');
  const [amountTo, setAmountTo] = useState<string>('0');
  const [slippage, setSlippage] = useState<number>(1);
  const [hoverValue, setHoverValue] = useState<number | undefined>();
  const [hoverDate, setHoverDate] = useState<string | undefined>();
  const [priceHistory, setPriceHistory] = useState<GraphData[]>([]);
  const [staking, setStaking] = useState<AvailableStaking[]>([]);
  const [selectedTokenInfo, setSelectedTokenInfo] = useState<TokenDetails>({
    name: '',
    address: '',
    symbol: '',
    BNBReserve: 0,
    decimals: 0,
    priceBNB: 0,
    tokenReserve: 0,
    allowance: 0,
    allowanceFetched: false,
  });
  const [timeWindow, setTimeWindow] = useState<PairDataTimeWindowEnum>(
    PairDataTimeWindowEnum.DAY
  );
  const dispatch = useAppDispatch();
  const pequodApiCall = useApiCall();
  const getTokenPrice = useGetTokenPrice();
  const approve = useApprove();
  const checkSwapAllowance = useAllowance();

  useEffect(() => {
    // Wait for the allowance to be fetched
    if (!selectedTokenInfo.allowanceFetched) return;

    // If the contract is already allowed, don't do anything
    if (selectedTokenInfo.allowance !== 0) return;
  }, [selectedTokenInfo.allowanceFetched, selectedTokenInfo.allowance]);

  const { buyCallback, sellCallback } = useSwap(
    selectedTokenInfo.address,
    amountFrom.toString(),
    amountTo.toString(),
    slippage
  );

  const currentDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const updateFrom = (value: string) => {
    const valueNumeric = parseFloat(value);
    setAmountFrom(value.toString());
    if (!selectedTokenInfo?.priceBNB) return;
    if (currentlySelectedTab === 'buy') {
      setAmountTo((valueNumeric / selectedTokenInfo.priceBNB).toString());
    } else {
      setAmountTo((valueNumeric * selectedTokenInfo.priceBNB).toString());
    }
  };

  const updateTo = (value: string) => {
    const valueNumeric = parseFloat(value);

    setAmountTo(value.toString());
    if (!selectedTokenInfo?.priceBNB) return;
    if (currentlySelectedTab === 'buy') {
      setAmountFrom((valueNumeric * selectedTokenInfo.priceBNB).toString());
    } else {
      setAmountTo((valueNumeric / selectedTokenInfo.priceBNB).toString());
    }
  };

  const formatAmount = (amount: string): string => {
    if (amount.toString().indexOf('e') === -1) return amount;

    return parseFloat(amount).toFixed(15);
  };

  const formatPrice = (price: number): string => {
    const minimum = 0.000001;
    if (price < minimum) return `<${minimum.toString()}`;
    return price.toString();
  };

  const getTokenInfo = useCallback(
    (tokenAddress: string) => {
      pequodApiCall(
        `tokens/info/${tokenAddress}/${process.env.REACT_APP_CHAIN_ID}`,
        { method: 'GET' }
      )
        .then((res) => {
          if (!res?.data) {
            toast.error('Error retrieving token info, please retry');
            return;
          }
          const { data: response }: { data: TokenInfoResponse } = res;
          const { name, symbol, decimals } = response;
          setSelectedTokenInfo(
            (selectedTokenInfo) =>
              ({
                ...selectedTokenInfo,
                name,
                symbol,
                decimals: decimals,
                address: tokenAddress,
              } as TokenDetails)
          );
        })
        .catch((err) => {
          console.error(err);
          toast.error('Error retrieving token info, please retry');
        });
    },
    [pequodApiCall]
  );

  useEffect(() => {
    pequodApiCall(`/farms/${process.env.REACT_APP_CHAIN_ID}/available`, {
      method: 'GET',
    })
      .then((res) => {
        setStaking(res?.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          'There was an error retrieving available staking options\nPlease try reloading this page'
        );
      });
    // TODO: Resolve dependency cycle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get price history from our API
  useEffect(() => {
    if (!selectedTokenInfo.address) return;
    pequodApiCall(
      `/tokens/price/history/${timeWindow}/${selectedTokenInfo.address}/${process.env.REACT_APP_CHAIN_ID}/bnb`,
      { method: 'GET' }
    )
      .then((res) => {
        if (!res?.data) {
          toast.error('Error retrieving token price history, please retry');
          return;
        }
        const { data: response }: { data: PairPriceHistoryApiResponse[] } = res;
        const priceHistory: GraphData[] = response.map((item) => ({
          time: new Date(item.date),
          value: item.close,
        }));
        setPriceHistory(priceHistory);
        setSelectedTokenInfo(
          (selectedTokenInfo) =>
            ({
              ...selectedTokenInfo,
              priceBNB: priceHistory[priceHistory.length - 1].value,
            } as TokenDetails)
        );
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          'Error retrieving token details from our API, please retry'
        );
      });
    // TODO: Resolve dependency cycle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTokenInfo.address, timeWindow]);

  // Get the allowance for the selected token towards the pancake router
  useEffect(() => {
    checkSwapAllowance(
      selectedTokenInfo.address,
      process.env.REACT_APP_PANCAKE_ROUTER_ADDRESS as string
    ).then((allowance: number) => {
      if (allowance === selectedTokenInfo.allowance) return;
      setSelectedTokenInfo((selectedTokenInfo) => ({
        ...selectedTokenInfo,
        allowance,
      }));
    });
  }, [
    checkSwapAllowance,
    selectedTokenInfo.allowance,
    selectedTokenInfo.address,
  ]);

  useEffect(() => {
    if (
      !Web3.utils.isAddress(tokenSearch) ||
      tokenSearch.toUpperCase() ===
        (process.env.REACT_APP_BNB_ADDRESS as string).toUpperCase()
    )
      return;
    setAmountFrom('0');
    setAmountTo('0');

    const searchTokens = setTimeout(async () => {
      getTokenInfo(tokenSearch);
      const { BNBReserve, tokenReserve } = await getTokenPrice(tokenSearch);

      setSelectedTokenInfo((selectedTokenInfo) => ({
        ...selectedTokenInfo,
        BNBReserve,
        tokenReserve,
      }));
    }, 200);

    return () => clearTimeout(searchTokens);
    //TODO: fix this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenSearch]);

  // Update price when decimals, BNBReserve, or tokenReserve change
  useEffect(() => {
    const priceBNB =
      selectedTokenInfo.BNBReserve /
      Math.pow(10, 18) /
      (selectedTokenInfo.tokenReserve /
        Math.pow(10, selectedTokenInfo.decimals));
    if (!priceBNB) return;
    setSelectedTokenInfo((selectedTokenInfo) => ({
      ...selectedTokenInfo,
      priceBNB,
    }));
  }, [
    selectedTokenInfo.decimals,
    selectedTokenInfo.BNBReserve,
    selectedTokenInfo.tokenReserve,
  ]);

  const openDialog = () => {
    dispatch(openTradeSettingsDialog());
  };

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

  const percentageButtonClicked = (percentage: Percentages) => {
    switch (percentage) {
      case Percentages['25%']:
        setStakeAmount((userTokenBalance * 0.25).toFixed(4));
        break;
      case Percentages['50%']:
        setStakeAmount((userTokenBalance * 0.5).toFixed(4));
        break;
      case Percentages['75%']:
        setStakeAmount((userTokenBalance * 0.75).toFixed(4));
        break;
      case Percentages['100%']:
        setStakeAmount(userTokenBalance.toFixed(4));
        break;
    }
  };

  return (
    <>
      <div>
        <span className='text-white text-xl ml-4'>Trading</span>
        <Carousel
          itemClass='mx-4 mt-4'
          responsive={responsive}
          slidesToSlide={1}
          swipeable
          draggable
          infinite
        >
          {staking.map((token, i) => (
            <div
              key={i}
              className='rounded-md border border-white-400 bg-gradient-to-r from-pequod-gray via-pequod-gray to-transparent text-white shadow-md px-4 py-2 h-full'
            >
              <div className='flex items-center gap-4'>
                <img
                  src={token.token.image ? token.token.image : wotLogo}
                  alt={token.token.name}
                  className='h-10'
                />
                <div>
                  <p className='font-bold'>{token.token.symbol}</p>
                  <span className='text-sm opacity-75'>APY - {token.apy}%</span>
                </div>
              </div>
              <div className='flex items-center justify-between mt-4'>
                {token.stakeInfo && token.stakeInfo.userAmountInStaking ? (
                  token.stakeInfo.userAmountInStaking
                ) : false ? (
                  <>
                    <div className='text-xs w-2/3 flex justify-evenly'>
                      <div>
                        <p className='font-semibold'>Earned</p>
                        <p>{token.stakeInfo.totalEarned}</p>
                        <p>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(
                            token.stakeInfo.totalEarned *
                              token.token.tokenPriceUSD
                          )}
                        </p>
                      </div>
                      <div className='border-r' aria-hidden></div>
                      <div>
                        <p className='font-semibold'>Balance</p>
                        <p>{token.stakeInfo.totalBalance}</p>
                        <p>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(
                            token.stakeInfo.totalBalance *
                              token.token.tokenPriceUSD
                          )}
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
                      <p>
                        {token.stakeInfo && token.stakeInfo.totalAmountInStaking
                          ? token.stakeInfo.totalAmountInStaking
                          : 0}
                      </p>
                    </div>
                    <button className='border bg-pequod-dark text-white py-2 px-4 rounded-md'>
                      Stake now
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </Carousel>

        <div className='flex flex-col gap-11'>
          <div className='grid grid-rows-buy grid-cols-2 gap-y-8 xl:bg-white xl:dark:bg-pequod-dark xl:p-5 xl:rounded-md'>
            <div className='col-span-2 gap-2 xl:gap-0 grid grid-cols-buy'>
              <div className='flex-1 flex flex-col'>
                <span className='text-white text-xl mb-4'>Search token</span>
                <form className='w-full flex justify-left md:ml-0'>
                  <label htmlFor='search-field' className='sr-only'>
                    Search
                  </label>
                  <div className='relative w-full text-gray-400 focus-within:text-gray-600 max-w-xl'>
                    <div className='absolute inset-y-0 left-2 flex items-center pointer-events-none'>
                      <SearchIcon className='h-5 w-5' aria-hidden='true' />
                    </div>
                    <input
                      id='search-field'
                      className='block w-full h-full pl-10 pr-3 py-2 border b-1 bg-transparent text-white focus:outline-none focus:ring focus:ring-purple-400 placeholder-gray-400 focus:placeholder-gray-400 sm:text-sm rounded-md'
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
                            onClick={() => getTokenInfo(token.address)}
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
            <div className='col-span-2 xl:col-span-1 xl:border-r xl:pr-3 text-gray-700 dark:text-gray-200'>
              {selectedTokenInfo.symbol && (
                <>
                  <p className='flex flex-col xl:flex-row xl:justify-between'>
                    <span className='text-xl font-medium'>
                      {selectedTokenInfo.symbol}/BNB{' '}
                      {formatPrice(hoverValue || selectedTokenInfo.priceBNB)}
                    </span>
                    <span className='my-4 md:my-0'>
                      <span className='relative z-0 inline-flex shadow-sm rounded-md'>
                        <button
                          type='button'
                          onClick={() =>
                            setTimeWindow(PairDataTimeWindowEnum.DAY)
                          }
                          className={classNames(
                            timeWindow === PairDataTimeWindowEnum.DAY
                              ? 'border-purple-400 bg-purple-200 z-10'
                              : 'border-gray-300 bg-white',
                            'relative inline-flex items-center px-4 py-2 rounded-l-md border text-sm font-medium text-gray-700 hover:opacity-80 focus:z-10 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
                          )}
                        >
                          1D
                        </button>
                        <button
                          onClick={() =>
                            setTimeWindow(PairDataTimeWindowEnum.WEEK)
                          }
                          type='button'
                          className={classNames(
                            timeWindow === PairDataTimeWindowEnum.WEEK
                              ? 'border-purple-400 bg-purple-200 z-10'
                              : 'border-gray-300 bg-white',
                            '-ml-px relative inline-flex items-center px-4 py-2 border text-sm font-medium text-gray-700 hover:opacity-80 focus:z-10 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
                          )}
                        >
                          1W
                        </button>
                        <button
                          type='button'
                          onClick={() =>
                            setTimeWindow(PairDataTimeWindowEnum.MONTH)
                          }
                          className={classNames(
                            timeWindow === PairDataTimeWindowEnum.MONTH
                              ? 'border-purple-400 bg-purple-200 z-10'
                              : 'border-gray-300 bg-white',
                            '-ml-px relative inline-flex items-center px-4 py-2 border text-sm font-medium text-gray-700 hover:opacity-80 focus:z-10 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
                          )}
                        >
                          1M
                        </button>
                        <button
                          type='button'
                          onClick={() =>
                            setTimeWindow(PairDataTimeWindowEnum.YEAR)
                          }
                          className={classNames(
                            timeWindow === PairDataTimeWindowEnum.YEAR
                              ? 'border-purple-400 bg-purple-200 z-10'
                              : 'border-gray-300 bg-white',
                            '-ml-px relative inline-flex items-center px-4 py-2 rounded-r-md border text-sm font-medium text-gray-700 hover:opacity-80 focus:z-10 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
                          )}
                        >
                          1Y
                        </button>
                      </span>
                    </span>
                  </p>
                  <p>{hoverDate || currentDate}</p>
                </>
              )}
              {priceHistory && (
                <div style={{ height: '90%', width: '100%' }}>
                  <PairChart
                    data={priceHistory}
                    setHoverValue={setHoverValue}
                    setHoverDate={setHoverDate}
                    isChangePositive={true}
                  />
                </div>
              )}
            </div>
            <div className='flex h-100 justify-center items-start col-span-1'>
              <div className='grid grid-cols-2 gap-4 px-5 xl:px-28'>
                {/* 1st row */}
                <div className='flex justify-center'>
                  <button
                    type='button'
                    className={classNames(
                      currentlySelectedTab === 'buy'
                        ? 'border border-pequod-white text-white font-bold'
                        : 'text-white',
                      'w-28 justify-center inline-flex items-center px-4 py-2 text-sm leading-4 font-medium rounded-md dark:hover:text-purple-100 hover:bg-white-200 dark:hover:bg-white-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white-500'
                    )}
                    onClick={() => {
                      setCurrentlySelectedTab('buy');
                      setAmountFrom('0');
                      setAmountTo('0');
                    }}
                  >
                    BUY
                  </button>
                </div>
                <div className='flex justify-center'>
                  <button
                    type='button'
                    className={classNames(
                      currentlySelectedTab === 'sell'
                        ? 'border border-pequod-white text-white font-bold'
                        : 'text-white',
                      'w-28 justify-center inline-flex items-center px-4 py-2 text-sm leading-4 font-medium rounded-md dark:hover:text-purple-100 hover:bg-white-500 dark:hover:bg-white-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white-500'
                    )}
                    onClick={() => {
                      setCurrentlySelectedTab('sell');
                      setAmountFrom('0');
                      setAmountTo('0');
                    }}
                  >
                    SELL
                  </button>
                </div>
                {/* 2nd row */}
                <div className='col-span-2 w-full mx-auto'>
                  <div className='flex justify-between'>
                    <label
                      htmlFor='amountFrom'
                      className='block text-sm font-medium text-gray-700 dark:text-gray-200'
                    >
                      Total{' '}
                      {currentlySelectedTab === 'buy'
                        ? '(BNB)'
                        : selectedTokenInfo?.symbol
                        ? `(${selectedTokenInfo?.symbol})`
                        : ''}
                    </label>
                  </div>
                  <div className='mt-1'>
                    <input
                      type='text'
                      name='amountFrom'
                      id='amountFrom'
                      inputMode='decimal'
                      autoComplete='off'
                      autoCorrect='off'
                      pattern='^[0-9]*[.,]?[0-9]*$'
                      placeholder='0.0'
                      minLength={1}
                      maxLength={79}
                      spellCheck='false'
                      className='shadow-sm focus:outline-none focus:ring focus:ring-purple-400 block w-full sm:text-sm bg-purple-100 border-1 rounded-md px-2 py-1.5 disabled:opacity-80 disabled:cursor-not-allowed'
                      disabled={!selectedTokenInfo.address}
                      value={formatAmount(amountFrom)}
                      onChange={(e) => updateFrom(e.target.value)}
                    />
                  </div>
                  <PercentagesGroup
                    darkModeClass='text-gray-700'
                    buttonClickCallback={percentageButtonClicked}
                    active={percentageButtonActive}
                    setActive={setPercentageButtonActive}
                  />
                </div>
                {/* 3rd row */}
                <div className='col-span-2 w-full mx-auto'>
                  <div className='flex justify-between'>
                    <label
                      htmlFor='amountTo'
                      className='block text-sm font-medium text-gray-700 dark:text-gray-200'
                    >
                      Total{' '}
                      {currentlySelectedTab === 'buy'
                        ? selectedTokenInfo?.symbol
                          ? `(${selectedTokenInfo?.symbol})`
                          : ''
                        : '(BNB)'}
                    </label>
                  </div>
                  <div className='mt-1'>
                    <input
                      type='text'
                      name='amountTo'
                      id='amountTo'
                      inputMode='decimal'
                      autoComplete='off'
                      autoCorrect='off'
                      pattern='^[0-9]*[.,]?[0-9]*$'
                      placeholder='0.0'
                      minLength={1}
                      maxLength={79}
                      spellCheck='false'
                      className='shadow-sm focus:outline-none focus:ring focus:ring-purple-400 block w-full sm:text-sm bg-purple-100 border-1 rounded-md px-2 py-1.5 disabled:opacity-80 disabled:cursor-not-allowed'
                      disabled={!selectedTokenInfo.address}
                      value={formatAmount(amountTo)}
                      onChange={(e) => updateTo(e.target.value)}
                    />
                  </div>
                </div>
                {/* 4th row */}
                <div className='col-span-2 mt-5 flex justify-center'>
                  {currentlySelectedTab === 'buy' ||
                  selectedTokenInfo.allowance > 0 ? (
                    <button
                      onClick={() => {
                        if (currentlySelectedTab === 'buy') {
                          buyCallback();
                        } else {
                          sellCallback();
                        }
                      }}
                      className='border b-2 w-full text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-default'
                      disabled={
                        !selectedTokenInfo ||
                        !selectedTokenInfo.address ||
                        !amountFrom ||
                        !amountTo
                      }
                    >
                      Place Order
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        approve(
                          selectedTokenInfo.address,
                          process.env.REACT_APP_PANCAKE_ROUTER_ADDRESS as string
                        )
                      }
                      className='bg-purple-400 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-default'
                      disabled={approve === undefined}
                    >
                      Approve {selectedTokenInfo.symbol} swap
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TradeSettingsDialog slippage={slippage} setSlippage={setSlippage} />
    </>
  );
}
