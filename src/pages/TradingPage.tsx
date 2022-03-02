import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { MinusIcon, PlusIcon } from '@heroicons/react/outline';
import { classNames, formatMoney, useApiCall } from '../utils/utils';
import { useAppSelector } from '../store/hooks';
import TradeSettingsDialog from '../components/TradeSettingsDialog';
import Web3 from 'web3';
import Carousel from 'react-multi-carousel';
import { PairDataTimeWindowEnum } from '../utils/chart';
import {
  useGetTokenPrice,
  useAllowance,
  useApprove,
  useSwap,
} from '../utils/contractsUtils';
import unknownTokenLogo from '../images/unknown-token.svg';
import bnbLogo from '../images/bnblogo.png';

import {
  selectUserBnbAmount,
  selectUserTokens,
  UserToken,
} from '../store/userInfoSlice';
import PercentagesGroup, { Percentages } from '../components/PercentagesGroup';
import { RootState } from '../store/store';
import TradingPageChart from '../components/TradingPageChart';
import { MIN_ETH } from '../utils/consts';
import Spinner from '../components/Spinner';
import _ from 'lodash';
import { selectTokensList } from '../store/miscSlice';
import { TokensListResponse } from '../utils/apiTypes';
import { useTakeProfitStopLossEvent } from '../utils/events';
import { Switch } from '@headlessui/react';
import { selectBnbUsdPrice } from '../store/pricesSlice';
import NotificationTable from '../components/NotificationTable';
import { useWeb3React } from '@web3-react/core';

import searchIcon from '../images/search.png';
import swapArrows from '../images/swaparrow.png';
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
  logoUrl: string;
}

interface TokenInfoResponse {
  name: string;
  symbol: string;
  decimals: number;
  logoUrl: string;
}

interface PairPriceHistoryApiResponse {
  date: string;
  open: number;
  low: number;
  high: number;
  close: number;
  volume: number;
}
export interface NotificationState {
  uuid: string;
  description: string;
  type: string;
  createdAt: string;
}
export interface GraphData {
  time: Date;
  value: number;
}

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
    partialVisibilityGutter: 30,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    partialVisibilityGutter: 30,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    partialVisibilityGutter: 30,
  },
};

const emptyTokenDetails: TokenDetails = {
  name: '',
  address: '',
  symbol: '',
  BNBReserve: 0,
  decimals: 0,
  priceBNB: 0,
  tokenReserve: 0,
  allowance: 0,
  allowanceFetched: false,
  logoUrl: '',
};

export default function TradingPage() {
  const tokensList = useAppSelector(selectTokensList);
  const [tokenSearch, setTokenSearch] = useState<string>(
    process.env.REACT_APP_WOT_ADDRESS as string
  );
  const [searchResults, setSearchResults] = useState<TokensListResponse[]>([]);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [showAutoSwap, setShowAutoSwap] = useState(false);
  const [percentageButtonActive, setPercentageButtonActive] =
    useState<number>(0);

  const [currentlySelectedTab, setCurrentlySelectedTab] = useState<
    'buy' | 'sell'
  >('buy');
  const [amountFrom, setAmountFrom] = useState<string>('0');
  const [amountTo, setAmountTo] = useState<string>('0');
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [takeProfit, setTakeProfit] = useState<number>(0);
  const [slippage, setSlippage] = useState<number>(30);
  const [priceHistory, setPriceHistory] = useState<GraphData[]>([]);
  const [userNotifications, setUserNotifications] = useState<[]>([]);
  const [isFullSell, setIsFullSell] = useState<boolean>(false);
  const [orderInProgress, setOrderInProgress] = useState<boolean>(false);
  const [approvalInProgress, setApprovalInProgress] = useState<boolean>(false);
  const [tpslApprovalInProgress, setTpslApprovalInProgress] =
    useState<boolean>(false);
  const [selectedTokenInfo, setSelectedTokenInfo] =
    useState<TokenDetails>(emptyTokenDetails);
  const [timeWindow, setTimeWindow] = useState<PairDataTimeWindowEnum>(
    PairDataTimeWindowEnum.WEEK
  );
  const pequodApiCall = useApiCall();
  const { account } = useWeb3React();
  const getTokenPrice = useGetTokenPrice();
  const approve = useApprove();
  const checkSwapAllowance = useAllowance();
  const setTakeProfitStopLoss = useTakeProfitStopLossEvent();
  const userBnbBalance = useAppSelector(selectUserBnbAmount);
  const userTokens = useAppSelector(selectUserTokens);
  const [topEarners, setTopEarners] = useState<UserToken[]>([]);
  const [tpslAllowance, setTpslAllowance] = useState<boolean>(false);
  const [settingTpsl, setSettingTpsl] = useState<boolean>(false);
  const bnbUsdPrice = useAppSelector(selectBnbUsdPrice);

  const maxBnbAmount = userBnbBalance - MIN_ETH;
  const userSelectedTokenBalance: number = useAppSelector(
    (state: RootState) =>
      state.userInfo?.tokens?.find(
        (token) =>
          token.address.toUpperCase() ===
          selectedTokenInfo.address.toUpperCase()
      )?.amount || 0
  );
  const fromTokenBalance =
    currentlySelectedTab === 'buy' ? maxBnbAmount : userSelectedTokenBalance;
  const [profitInUsd, setProfitInUsd] = useState<number>(0);
  const [profitInBnb, setProfitInBnb] = useState<number>(0);
  const [lossInUsd, setLossInUsd] = useState<number>(0);
  const [lossInBnb, setLossInBnb] = useState<number>(0);

  useEffect(() => {
    setTopEarners(
      userTokens
        .filter((token) => !!token.earningPercentage)
        .sort((a, b) => {
          return (
            (b.earningPercentage || -Infinity) -
            (a.earningPercentage || -Infinity)
          );
        })
    );
  }, [userTokens]);

  const { buyCallback, sellCallback } = useSwap(
    selectedTokenInfo.address,
    amountFrom.toString(),
    amountTo.toString(),
    slippage
  );

  const updateFrom = (
    value: string,
    fullSell = false,
    percentageButton: number | null = null,
    updateTo = true
  ) => {
    // replace comma with dot
    const newValue = value.replace(',', '.');
    const valueNumeric = parseFloat(newValue);
    setAmountFrom(newValue);
    setIsFullSell(fullSell);
    setPercentageButtonActive(
      percentageButton === null
        ? 100 / (fromTokenBalance / valueNumeric)
        : percentageButton
    );
    if (!selectedTokenInfo?.priceBNB || !updateTo) return;
    if (currentlySelectedTab === 'buy') {
      setAmountTo((valueNumeric / selectedTokenInfo.priceBNB).toString());
    } else {
      setAmountTo((valueNumeric * selectedTokenInfo.priceBNB).toString());
    }
  };

  const updateProfit = (tp: number) => {
    const profitInBnb = parseFloat(
      ((parseFloat(amountFrom) * tp) / 100).toFixed(2)
    );
    const profitInUsd = parseFloat((profitInBnb * bnbUsdPrice).toFixed(2));
    setProfitInBnb(profitInBnb);
    setProfitInUsd(profitInUsd);
  };
  const updateLoss = (sl: number) => {
    const lossInBnb = parseFloat(
      ((parseFloat(amountFrom) * sl) / 100).toFixed(2)
    );
    const lossInUsd = parseFloat((lossInBnb * bnbUsdPrice).toFixed(2));
    setLossInBnb(lossInBnb);
    setLossInUsd(lossInUsd);
  };

  const updateTo = (value: string) => {
    // replace comma with dot
    const newValue = value.replace(',', '.');
    const valueNumeric = parseFloat(newValue);

    setAmountTo(newValue.toString());
    if (!selectedTokenInfo?.priceBNB) return;
    if (currentlySelectedTab === 'buy') {
      updateFrom(
        (valueNumeric * selectedTokenInfo.priceBNB).toString(),
        false,
        null,
        false
      );
    } else {
      updateFrom(
        (valueNumeric / selectedTokenInfo.priceBNB).toString(),
        false,
        null,
        false
      );
    }
  };

  useEffect(() => {
    updateLoss(stopLoss);
    updateProfit(takeProfit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountFrom, stopLoss, takeProfit]);

  const formatAmount = (amount: string): string => {
    if (amount.toString().indexOf('e') === -1) return amount;

    return parseFloat(amount).toFixed(15);
  };

  const swap = async () => {
    if (
      !selectedTokenInfo ||
      !selectedTokenInfo.address ||
      !amountFrom ||
      !amountTo
    )
      return;
    if (currentlySelectedTab === 'buy') {
      await buyCallback();
    } else {
      await sellCallback(isFullSell);
    }
  };

  const autoSwap = async () => {
    await setTakeProfitStopLoss(
      selectedTokenInfo.address,
      userTokens
        .find(
          (token) =>
            token.address.toUpperCase() ===
            selectedTokenInfo.address.toUpperCase()
        )
        ?.amount.toString() || '0',
      takeProfit.toString(),
      stopLoss.toString()
    );
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
          const { name, symbol, decimals, logoUrl } = response;
          setSelectedTokenInfo(
            (selectedTokenInfo) =>
              ({
                ...selectedTokenInfo,
                logoUrl,
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
    if (!selectedTokenInfo.address || selectedTokenInfo.allowanceFetched)
      return;
    checkSwapAllowance(
      selectedTokenInfo.address,
      process.env.REACT_APP_PANCAKE_ROUTER_ADDRESS as string
    ).then((allowance: number) => {
      setSelectedTokenInfo((selectedTokenInfo) => ({
        ...selectedTokenInfo,
        allowance,
        allowanceFetched: true,
      }));
    });
    checkSwapAllowance(
      selectedTokenInfo.address,
      process.env.REACT_APP_TPSL_ADDRESS as string
    ).then((allowance: number) => {
      setTpslAllowance(allowance > 0);
    });
  }, [
    checkSwapAllowance,
    selectedTokenInfo.allowance,
    selectedTokenInfo.address,
    selectedTokenInfo.allowanceFetched,
  ]);

  useEffect(() => {
    const search = async () => {
      if (!tokenSearch) {
        setSelectedTokenInfo(emptyTokenDetails);
        resetForm();
        setPriceHistory([]);
        return;
      }

      // If the searched term is an address just search it
      if (Web3.utils.isAddress(tokenSearch)) {
        getTokenInfo(tokenSearch);
        const { BNBReserve, tokenReserve } = await getTokenPrice(tokenSearch);
        setSelectedTokenInfo((selectedTokenInfo) => ({
          ...selectedTokenInfo,
          BNBReserve,
          tokenReserve,
        }));
        return;
      }

      // Otherwise search for the token, matching by symbol first
      setTimeout(() => {
        let tokens = tokensList.filter((token) =>
          token.symbol.toUpperCase().includes(tokenSearch.toUpperCase())
        );
        tokens = [
          ...tokens,
          ...tokensList.filter((token) =>
            token.name.toUpperCase().includes(tokenSearch.toUpperCase())
          ),
        ];
        tokens = _.uniq(tokens);
        setSearchResults(tokens);
      }, 500);
    };

    search();
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

  // Get notifications
  useEffect(() => {
    pequodApiCall(
      `/users/${account}/${process.env.REACT_APP_CHAIN_ID}/notifications/list/ALL`,
      {}
    ).then((res) => {
      if (!res?.data) {
        return;
      }
      setUserNotifications(res.data);
    });
    // TODO: Fix dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const percentageButtonClicked = async (percentage: Percentages) => {
    let newAmount;
    switch (percentage) {
      case Percentages['25%']:
        newAmount = fromTokenBalance * 0.25 < 0 ? 0 : fromTokenBalance * 0.25;
        updateFrom(formatAmount(newAmount.toString()), false, 25);
        break;
      case Percentages['50%']:
        newAmount = fromTokenBalance * 0.5 < 0 ? 0 : fromTokenBalance * 0.5;
        updateFrom(formatAmount(newAmount.toString()), false, 50);
        break;
      case Percentages['75%']:
        newAmount = fromTokenBalance * 0.75 < 0 ? 0 : fromTokenBalance * 0.75;
        updateFrom(formatAmount(newAmount.toString()), false, 75);
        break;
      case Percentages['100%']:
        newAmount = fromTokenBalance < 0 ? 0 : fromTokenBalance;
        // We check if the currently selected tab is sell because we want to set "isFullSell" to true only when the user is selling
        updateFrom(
          formatAmount(newAmount.toString()),
          currentlySelectedTab === 'sell',
          100
        );
        break;
    }
  };

  const resetForm = () => {
    updateFrom('0');
    setAmountTo('0');
    setTakeProfit(0);
    setStopLoss(0);
    setShowAutoSwap(false);
  };

  const setDefaultTokenLogo = (
    ev: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = ev.target as HTMLInputElement;
    target.src = unknownTokenLogo;
  };

  useEffect(() => {
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentlySelectedTab, selectedTokenInfo.address]);

  return (
    <>
      <div className="flex flex-col gap-10">
        <div>
          <h1 className="mt-6 ml-4 text-xl font-bold text-pequod-white">
            Swap
          </h1>
          <Carousel
            itemClass="mx-4 mt-4"
            responsive={responsive}
            slidesToSlide={1}
            swipeable
            draggable
            infinite
          >
            {topEarners.map((token, i) => (
              <div
                key={i}
                className={classNames(
                  token.earningPercentage && token.earningPercentage > 0
                    ? 'from-green-800'
                    : 'from-red-800',
                  'border-white-400 h-full rounded-40  border bg-gradient-to-b p-8 text-white shadow-md'
                )}
              >
                <div className="grid grid-cols-cards grid-rows-2 gap-4">
                  <img
                    onError={setDefaultTokenLogo}
                    src={token.logoUrl ?? unknownTokenLogo}
                    alt={token.symbol}
                    className="row-span-2 h-10"
                  />
                  <div>
                    <p>
                      <span>{token.name} </span>
                      <span className="font-bold">{token.symbol}</span>
                    </p>
                    <p className="text-sm opacity-75">{token.symbol}/USDT</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p>{formatMoney(token.totalInDollars)}</p>
                      <p>{token.earningPercentage}%</p>
                    </div>
                    <button
                      onClick={() => {
                        setTokenSearch(token.address);
                        setTakeProfit(token.takeProfit || 0);
                        setStopLoss(token.stopLoss || 0);
                        if (token.takeProfit || token.stopLoss)
                          setShowAutoSwap(true);
                      }}
                      className="h-40 rounded-md border border-pequod-white bg-pequod-gray px-4 py-1"
                    >
                      Trade now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
        <div className="grid grid-cols-buy gap-y-8 xl:rounded-md xl:bg-pequod-dark xl:p-5">
          <div className="col-span-2 grid gap-y-2 xl:col-span-1 xl:gap-0">
            <div className="flex flex-1 flex-col">
              <span className="mb-8 text-xl text-pequod-white">
                Search token
              </span>
              <form className="justify-left flex w-full flex-row md:ml-0">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <div className="relative flex h-50 w-full flex-row text-pequod-white xl:pr-12">
                  <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center">
                    <img
                      src={searchIcon}
                      alt=""
                      className="ml-2 mr-2 h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="search-field"
                    className="b-1 focus:outline-none mr-4 block h-50 w-4/5 rounded-15 border appearance-none bg-transparent hover:bg-transparent focus:bg-transparent py-2 pl-12 pr-3 text-white placeholder-gray-400 focus:placeholder-gray-400 focus:ring focus:ring-pequod-purple sm:text-sm"
                    placeholder="0xe861...."
                    type="search"
                    name="search"
                    value={tokenSearch}
                    onChange={(e) => setTokenSearch(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />
                  {searchResults?.length > 0 && searchFocused && (
                    <div className="absolute z-10 mt-14 flex max-h-64 w-4/5 flex-col gap-y-3 overflow-y-scroll rounded-md bg-pequod-gray p-3 shadow-md">
                      {searchResults.map((token) => (
                        <div
                          className="cursor-pointer"
                          onPointerDown={() => setTokenSearch(token.address)}
                          key={token.address}
                        >
                          <span className="text-md p-1 font-semibold text-white ">
                            {token.name} - ${token.symbol}
                          </span>
                          <span className="block overflow-hidden text-sm text-white opacity-75">
                            {token.address}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    className="b-1 focus:outline-none block h-50 w-1/5 rounded-15 border bg-transparent py-2 text-white placeholder-gray-400 focus:placeholder-gray-400 focus:ring focus:ring-pequod-purple disabled:cursor-default sm:text-sm"
                    disabled={true}
                    onClick={() => {}}
                  >
                    {selectedTokenInfo?.symbol
                      ? `${selectedTokenInfo?.symbol}`
                      : '-'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          <TradingPageChart
            selectedTokenSymbol={selectedTokenInfo?.symbol}
            currentlySelectedTimeWindow={timeWindow}
            setTimeWindow={setTimeWindow}
            priceHistory={priceHistory}
            className="col-span-2 block xl:col-span-1 xl:hidden"
          />
          <div className="col-span-2 flex h-50 items-end self-end xl:col-span-1 xl:px-12">
            <div className="flex w-full items-center justify-center">
              <button
                type="button"
                className="inline-flex h-50 w-full items-center justify-center rounded-15 border border-pequod-pink border-transparent px-2 py-2 text-sm font-medium leading-4 text-pequod-white"
              >
                <img
                  src={
                    currentlySelectedTab === 'buy'
                      ? bnbLogo
                      : selectedTokenInfo?.logoUrl
                  }
                  onError={setDefaultTokenLogo}
                  width={20}
                  alt="temp"
                />
                &nbsp;
                <span className="max-w-full overflow-hidden text-ellipsis">
                  {currentlySelectedTab === 'buy'
                    ? `BNB`
                    : selectedTokenInfo?.symbol
                    ? `${selectedTokenInfo?.symbol}`
                    : '-'}
                </span>
              </button>
              <button
                type="button"
                className="mx-4 inline-flex h-35 w-55 min-w-55 items-center justify-center rounded-10 border border-pequod-white border-transparent text-sm font-medium leading-4 text-pequod-pink"
                onClick={() => {
                  setCurrentlySelectedTab(
                    currentlySelectedTab === 'buy' ? 'sell' : 'buy'
                  );
                  resetForm();
                }}
              >
                <img src={swapArrows} alt="" className="text-sm" />
              </button>
              <button
                type="button"
                className="inline-flex h-50 w-full flex-row items-center justify-center rounded-15 border border-pequod-white border-transparent px-2 py-2 text-sm font-medium leading-4 text-pequod-white"
              >
                <img
                  onError={setDefaultTokenLogo}
                  src={
                    currentlySelectedTab === 'sell'
                      ? bnbLogo
                      : selectedTokenInfo?.logoUrl
                  }
                  width={20}
                  alt="token"
                />
                &nbsp;
                <span className="max-w-full overflow-hidden text-ellipsis">
                  {currentlySelectedTab === 'sell'
                    ? `BNB`
                    : selectedTokenInfo?.symbol
                    ? `${selectedTokenInfo?.symbol}`
                    : '-'}
                </span>
              </button>
            </div>
          </div>
          <TradingPageChart
            selectedTokenSymbol={selectedTokenInfo?.symbol}
            currentlySelectedTimeWindow={timeWindow}
            setTimeWindow={setTimeWindow}
            className="col-span-2 hidden xl:col-span-1 xl:block"
            priceHistory={priceHistory}
          />
          <div className="h-100 col-span-2 flex flex-col items-start justify-center gap-4 xl:col-span-1 xl:px-12">
            {/* 1st row */}
            <div className="mx-auto w-full">
              <div className="flex justify-between">
                <label
                  htmlFor="amountFrom"
                  className="block text-xs text-pequod-pink"
                >
                  {currentlySelectedTab === 'buy' ? (
                    `(≈ ${(parseFloat(amountFrom) * bnbUsdPrice).toFixed(
                      2
                    )} USD)`
                  ) : selectedTokenInfo?.symbol ? (
                    <>
                      <span className="text-pequod-white">Amount</span> (
                      {selectedTokenInfo?.symbol})
                    </>
                  ) : (
                    ''
                  )}
                </label>
                <div className="font-regular float-right text-xs text-pequod-white opacity-50">
                  Balance:{' '}
                  {currentlySelectedTab === 'buy'
                    ? userBnbBalance.toFixed(3)
                    : userSelectedTokenBalance.toFixed(6)}
                </div>
              </div>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type="text"
                  name="amountFrom"
                  id="amountFrom"
                  inputMode="decimal"
                  autoComplete="off"
                  autoCorrect="off"
                  pattern="^[0-9]*[.,]?[0-9]*$"
                  placeholder="0.0"
                  minLength={1}
                  maxLength={79}
                  spellCheck="false"
                  className="focus:outline-none block h-40 w-full rounded-10 border border-pequod-white bg-transparent px-2 py-1.5 text-pequod-white focus:ring focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm"
                  disabled={!selectedTokenInfo.address}
                  value={formatAmount(amountFrom)}
                  onChange={(e) => {
                    updateFrom(e.target.value);
                    updateProfit(takeProfit);
                    updateLoss(takeProfit);
                  }}
                />

                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white opacity-75">
                  {currentlySelectedTab === 'buy'
                    ? `(BNB)`
                    : selectedTokenInfo?.symbol
                    ? `(${selectedTokenInfo?.symbol})`
                    : ''}
                </div>
              </div>
              <PercentagesGroup
                darkModeClass="text-gray-700"
                buttonClickCallback={percentageButtonClicked}
                active={percentageButtonActive}
                setActive={setPercentageButtonActive}
                disabled={!selectedTokenInfo.address}
              />
            </div>
            {/* 2nd row */}
            <div className="mx-auto w-full">
              <div className="flex justify-between">
                <label
                  htmlFor="amountTo"
                  className="flex flex-row whitespace-nowrap text-xs text-pequod-white"
                >
                  <p className="ml-1 text-pequod-pink">
                    {currentlySelectedTab === 'sell' ? (
                      `(≈ ${(parseFloat(amountFrom) * bnbUsdPrice).toFixed(
                        2
                      )} USD)`
                    ) : selectedTokenInfo?.symbol ? (
                      <>
                        <span className="text-pequod-white">
                          Amount received
                        </span>{' '}
                        ({selectedTokenInfo?.symbol})
                      </>
                    ) : (
                      ''
                    )}
                  </p>
                </label>

                <div className="float-right text-xs text-pequod-white opacity-50">
                  Balance:{' '}
                  {currentlySelectedTab === 'sell'
                    ? userBnbBalance.toFixed(3)
                    : userSelectedTokenBalance.toFixed(6)}
                </div>
              </div>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type="text"
                  name="amountTo"
                  id="amountTo"
                  inputMode="decimal"
                  autoComplete="off"
                  autoCorrect="off"
                  pattern="^[0-9]*[.,]?[0-9]*$"
                  placeholder="0.0"
                  minLength={1}
                  maxLength={79}
                  spellCheck="false"
                  className="focus:outline-none block h-40 w-full rounded-10 border border-pequod-white bg-transparent px-2 py-1.5 text-pequod-white focus:ring focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm"
                  disabled={!selectedTokenInfo.address}
                  value={formatAmount(amountTo)}
                  onChange={(e) => {
                    updateTo(e.target.value);
                  }}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white opacity-75">
                  {currentlySelectedTab === 'sell'
                    ? `(BNB)`
                    : selectedTokenInfo?.symbol
                    ? `(${selectedTokenInfo?.symbol})`
                    : ''}
                </div>
              </div>
            </div>
            <div className="flex w-full justify-center">
              {currentlySelectedTab === 'buy' ||
              selectedTokenInfo.allowance > 0 ? (
                <button
                  onClick={() => {
                    setOrderInProgress(true);
                    swap().then(() => setOrderInProgress(false));
                  }}
                  className={
                    'b-2 flex w-full items-center justify-center rounded-10 border-2 border-pequod-pink py-2 px-4 text-pequod-white disabled:cursor-default disabled:opacity-50'
                  }
                  disabled={
                    !selectedTokenInfo ||
                    !selectedTokenInfo.address ||
                    !amountFrom ||
                    !amountTo
                  }
                >
                  {orderInProgress ? (
                    <>
                      <Spinner className="h-5 text-pequod-white" />
                      <span>Swapping...</span>
                    </>
                  ) : (
                    'SWAP'
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setApprovalInProgress(true);
                    approve(
                      selectedTokenInfo.address,
                      process.env.REACT_APP_PANCAKE_ROUTER_ADDRESS as string
                    ).finally(() => {
                      setApprovalInProgress(false);
                    });
                  }}
                  className="b-2 flex w-full items-center justify-center rounded-10 border-2 border-pequod-pink py-2 px-4 text-pequod-white disabled:cursor-default disabled:opacity-50"
                  disabled={
                    approve === undefined || !selectedTokenInfo.allowanceFetched
                  }
                >
                  {approvalInProgress ? (
                    <>
                      <Spinner className="h-5 text-pequod-white" />
                      <span>Approval in progress...</span>
                    </>
                  ) : (
                    `APPROVE ${selectedTokenInfo.symbol} SWAP`
                  )}
                </button>
              )}
            </div>
            {/* 3rd row */}
            <div className="flex w-full flex-row justify-between border-t pt-3">
              <label
                htmlFor="autoSwap"
                className="block text-sm font-medium text-white opacity-75"
              >
                AUTO SWAP IF
              </label>
              <div className="flex flex-row items-center">
                <Switch
                  disabled={currentlySelectedTab === 'sell' ? true : false}
                  checked={showAutoSwap}
                  onChange={setShowAutoSwap}
                  className={classNames(
                    showAutoSwap ? 'bg-pequod-purple' : 'bg-gray-900',
                    'focus:outline-none relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-offset-2 disabled:cursor-default disabled:opacity-75'
                  )}
                >
                  <span className="sr-only">Auto Swap</span>
                  <span
                    aria-hidden="true"
                    className={classNames(
                      showAutoSwap ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    )}
                  />
                </Switch>
                <label
                  htmlFor="autoSwap"
                  className={classNames(
                    showAutoSwap ? 'text-pequod-pink' : 'text-pequod-white',
                    'font-regular ml-4 block text-sm opacity-75'
                  )}
                >
                  PEQUOD SWAP
                </label>
              </div>
            </div>
            <div
              className={classNames(
                showAutoSwap ? '' : 'invisible',
                'flex gap-x-10'
              )}
            >
              <div>
                <label
                  htmlFor="takeProfit"
                  className="block text-sm text-pequod-green"
                >
                  Gain (%)
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setTakeProfit(takeProfit <= 0 ? 0 : takeProfit - 1);
                      updateProfit(takeProfit <= 0 ? 0 : takeProfit - 1);
                    }}
                    disabled={!selectedTokenInfo.address}
                    className="focus:outline-none relative inline-flex h-40 items-center space-x-2 rounded-l-md border border-pequod-white bg-transparent p-2 text-sm font-medium text-pequod-white focus:border-pequod-purple focus:ring-1 focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    <MinusIcon
                      className="h-4 w-4 text-pequod-white"
                      aria-hidden="true"
                    />
                  </button>
                  <div className="relative flex flex-grow items-stretch focus-within:z-10">
                    <input
                      type="number"
                      name="takeProfit"
                      id="takeProfit"
                      min="0"
                      value={takeProfit}
                      disabled={!selectedTokenInfo.address}
                      onChange={(e) => {
                        setTakeProfit(Number(e.target.value));
                      }}
                      className="block w-full border-t border-b border-pequod-white bg-transparent text-center text-pequod-white focus:border-pequod-purple focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm"
                      placeholder="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTakeProfit(takeProfit + 1);
                      updateProfit(takeProfit + 1);
                    }}
                    disabled={!selectedTokenInfo.address}
                    className="focus:outline-none relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-pequod-white bg-transparent p-2 text-sm font-medium text-pequod-white focus:border-pequod-purple focus:ring-1 focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    <PlusIcon
                      className="h-4 w-4 text-pequod-white"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                {takeProfit > 0 ? (
                  <label className="mt-2 block text-sm font-medium text-white">
                    Profit: {profitInUsd} $ / {profitInBnb} BNB
                  </label>
                ) : (
                  <label className="mt-2 block text-sm font-medium text-white">
                    &nbsp;
                  </label>
                )}
              </div>
              <div>
                <label
                  htmlFor="stopLoss"
                  className="block text-sm font-medium text-pequod-red"
                >
                  Loss (%)
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setStopLoss(stopLoss <= 0 ? 0 : stopLoss - 1);
                      updateLoss(stopLoss <= 0 ? 0 : stopLoss - 1);
                    }}
                    disabled={!selectedTokenInfo.address}
                    className="focus:outline-none relative inline-flex h-40 items-center space-x-2 rounded-l-md border border-pequod-white bg-transparent p-2 text-sm font-medium text-pequod-white focus:border-pequod-purple focus:ring-1 focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    <MinusIcon
                      className="h-4 w-4 text-pequod-white"
                      aria-hidden="true"
                    />
                  </button>
                  <div className="relative flex flex-grow items-stretch focus-within:z-10">
                    <input
                      type="number"
                      name="stopLoss"
                      id="stopLoss"
                      min="0"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(Number(e.target.value))}
                      disabled={!selectedTokenInfo.address}
                      className="block w-full border-t border-b border-pequod-white bg-transparent text-center text-pequod-white focus:border-pequod-purple focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm"
                      placeholder="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStopLoss(stopLoss + 1);
                      updateLoss(stopLoss + 1);
                    }}
                    disabled={!selectedTokenInfo.address}
                    className="focus:outline-none relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-pequod-white bg-transparent p-2 text-sm font-medium text-pequod-white focus:border-pequod-purple focus:ring-1 focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    <PlusIcon
                      className="h-4 w-4 text-pequod-white"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                {stopLoss > 0 ? (
                  <label className="mt-2 block text-sm font-light text-white">
                    Loss: {lossInUsd} $ / {lossInBnb} BNB
                  </label>
                ) : (
                  <></>
                )}
              </div>
            </div>
            {/* 4th row */}
            <div
              className={classNames(
                showAutoSwap ? '' : 'invisible',
                'mt-5 grid w-full gap-x-5'
              )}
            >
              <div className="flex w-full justify-center">
                {tpslAllowance ? (
                  <button
                    onClick={() => {
                      setSettingTpsl(true);
                      autoSwap().then(() => setSettingTpsl(false));
                    }}
                    className="b-2 flex w-full items-center justify-center rounded-10 border-2 border-pequod-pink py-2  px-4 text-pequod-white disabled:cursor-default disabled:opacity-50"
                  >
                    {settingTpsl ? (
                      <>
                        <Spinner className="h-5 text-pequod-white" />
                        <span>Swapping...</span>
                      </>
                    ) : (
                      `PEQUOD SWAP`
                    )}
                  </button>
                ) : (
                  <button
                    disabled={!selectedTokenInfo.address}
                    onClick={() => {
                      setTpslApprovalInProgress(true);
                      approve(
                        selectedTokenInfo.address,
                        process.env.REACT_APP_TPSL_ADDRESS as string
                      )
                        .then(() => setTpslAllowance(true))
                        .finally(() => {
                          setTpslApprovalInProgress(false);
                        });
                    }}
                    className="b-2 flex w-full items-center justify-center rounded-10 border-2 border-pequod-pink py-2  px-4 text-pequod-white disabled:cursor-default disabled:opacity-50"
                  >
                    {tpslApprovalInProgress ? (
                      <>
                        <Spinner className="h-5 text-pequod-white" />
                        <span>Approving...</span>
                      </>
                    ) : (
                      ' Approve TP/SL'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        <h1 className="ml-4 text-xl text-pequod-white">Notifications</h1>
        <NotificationTable
          notifications={userNotifications}
        ></NotificationTable>
      </div>
      <TradeSettingsDialog slippage={slippage} setSlippage={setSlippage} />
    </>
  );
}
