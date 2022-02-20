import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { MinusIcon, PlusIcon, SearchIcon } from "@heroicons/react/outline";
import { classNames, formatMoney, useApiCall } from "../utils/utils";
import { useAppSelector } from "../store/hooks";
import TradeSettingsDialog from "../components/TradeSettingsDialog";
import Web3 from "web3";
import Carousel from "react-multi-carousel";
import { PairDataTimeWindowEnum } from "../utils/chart";
import {
  useGetTokenPrice,
  useAllowance,
  useApprove,
  useSwap,
} from "../utils/contractsUtils";
import unknownTokenLogo from "../images/unknown-token.svg";

import {
  selectUserBnbAmount,
  selectUserTokens,
  UserToken,
} from "../store/userInfoSlice";
import PercentagesGroup, { Percentages } from "../components/PercentagesGroup";
import { RootState } from "../store/store";
import TradingPageChart from "../components/TradingPageChart";
import { MIN_ETH } from "../utils/consts";
import Spinner from "../components/Spinner";
import _ from "lodash";
import { selectTokensList } from "../store/miscSlice";
import { TokensListResponse } from "../utils/apiTypes";
import { useTakeProfitStopLossEvent } from "../utils/events";

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

export interface GraphData {
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
    items: 1,
    partialVisibilityGutter: 30,
  },
};

const emptyTokenDetails: TokenDetails = {
  name: "",
  address: "",
  symbol: "",
  BNBReserve: 0,
  decimals: 0,
  priceBNB: 0,
  tokenReserve: 0,
  allowance: 0,
  allowanceFetched: false,
};

export default function TradingPage() {
  const tokensList = useAppSelector(selectTokensList);
  const [tokenSearch, setTokenSearch] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchResults, setSearchResults] = useState<TokensListResponse[]>([]);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [percentageButtonActive, setPercentageButtonActive] =
    useState<number>(0);

  const [currentlySelectedTab, setCurrentlySelectedTab] = useState<
    "buy" | "sell"
  >("buy");
  const [amountFrom, setAmountFrom] = useState<string>("0");
  const [amountTo, setAmountTo] = useState<string>("0");
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [takeProfit, setTakeProfit] = useState<number>(0);
  const [slippage, setSlippage] = useState<number>(30);
  const [priceHistory, setPriceHistory] = useState<GraphData[]>([]);
  const [isFullSell, setIsFullSell] = useState<boolean>(false);
  const [orderInProgress, setOrderInProgress] = useState<boolean>(false);
  const [approvalInProgress, setApprovalInProgress] = useState<boolean>(false);
  const [tpslApprovalInProgress, setTpslApprovalInProgress] =
    useState<boolean>(false);
  const [selectedTokenInfo, setSelectedTokenInfo] =
    useState<TokenDetails>(emptyTokenDetails);
  const [timeWindow] = useState<PairDataTimeWindowEnum>(
    PairDataTimeWindowEnum.WEEK
  );
  const pequodApiCall = useApiCall();
  const getTokenPrice = useGetTokenPrice();
  const approve = useApprove();
  const checkSwapAllowance = useAllowance();
  const setTakeProfitStopLoss = useTakeProfitStopLossEvent();
  const userBnbBalance = useAppSelector(selectUserBnbAmount);
  const userTokens = useAppSelector(selectUserTokens);
  const [topEarners, setTopEarners] = useState<UserToken[]>([]);
  const [tpslAllowance, setTpslAllowance] = useState<boolean>(false);
  const [settingTpsl, setSettingTpsl] = useState<boolean>(false);
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
    currentlySelectedTab === "buy" ? maxBnbAmount : userSelectedTokenBalance;

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
    percentageButton: number | null = null
  ) => {
    const valueNumeric = parseFloat(value);
    setAmountFrom(value.toString());
    setIsFullSell(fullSell);
    setPercentageButtonActive(
      percentageButton === null
        ? 100 / (fromTokenBalance / valueNumeric)
        : percentageButton
    );
    if (!selectedTokenInfo?.priceBNB) return;
    if (currentlySelectedTab === "buy") {
      setAmountTo((valueNumeric / selectedTokenInfo.priceBNB).toString());
    } else {
      setAmountTo((valueNumeric * selectedTokenInfo.priceBNB).toString());
    }
  };

  const updateTo = (value: string) => {
    const valueNumeric = parseFloat(value);

    setAmountTo(value.toString());
    if (!selectedTokenInfo?.priceBNB) return;
    if (currentlySelectedTab === "buy") {
      updateFrom((valueNumeric * selectedTokenInfo.priceBNB).toString());
    } else {
      setAmountTo((valueNumeric / selectedTokenInfo.priceBNB).toString());
    }
  };

  const formatAmount = (amount: string): string => {
    if (amount.toString().indexOf("e") === -1) return amount;

    return parseFloat(amount).toFixed(15);
  };

  const getTokenInfo = useCallback(
    (tokenAddress: string) => {
      pequodApiCall(
        `tokens/info/${tokenAddress}/${process.env.REACT_APP_CHAIN_ID}`,
        { method: "GET" }
      )
        .then((res) => {
          if (!res?.data) {
            toast.error("Error retrieving token info, please retry");
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
          toast.error("Error retrieving token info, please retry");
        });
    },
    [pequodApiCall]
  );

  // Get price history from our API
  useEffect(() => {
    if (!selectedTokenInfo.address) return;
    pequodApiCall(
      `/tokens/price/history/${timeWindow}/${selectedTokenInfo.address}/${process.env.REACT_APP_CHAIN_ID}/bnb`,
      { method: "GET" }
    )
      .then((res) => {
        if (!res?.data) {
          toast.error("Error retrieving token price history, please retry");
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
          "Error retrieving token details from our API, please retry"
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

  const percentageButtonClicked = async (percentage: Percentages) => {
    switch (percentage) {
      case Percentages["25%"]:
        updateFrom(
          formatAmount((fromTokenBalance * 0.25).toString()),
          false,
          25
        );
        break;
      case Percentages["50%"]:
        updateFrom(
          formatAmount((fromTokenBalance * 0.5).toString()),
          false,
          50
        );
        break;
      case Percentages["75%"]:
        updateFrom(
          formatAmount((fromTokenBalance * 0.75).toString()),
          false,
          75
        );
        break;
      case Percentages["100%"]:
        // We check if the currently selected tab is sell because we want to set "isFullSell" to true only when the user is selling
        updateFrom(
          formatAmount(fromTokenBalance.toString()),
          currentlySelectedTab === "sell",
          100
        );
        break;
    }
  };

  const resetForm = () => {
    updateFrom("0");
    setAmountTo("0");
    setTakeProfit(0);
    setStopLoss(0);
  };

  return (
    <>
      <div className="flex flex-col gap-10">
        <h1 className="text-pequod-white ml-4 text-3xl font-bold">Trading</h1>
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
                  ? "from-green-800"
                  : "from-red-800",
                "border-white-400 h-full rounded-md border bg-gradient-to-b p-4 text-white shadow-md"
              )}
            >
              <div className="grid-cols-cards grid grid-rows-2 gap-4">
                <img
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
                    onClick={() => setTokenSearch(token.address)}
                    className="border-pequod-white bg-pequod-gray rounded-md border px-3 py-1"
                  >
                    Trade now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Carousel>

        <div className="grid-cols-buy xl:bg-pequod-dark grid gap-y-8 xl:rounded-md xl:p-5">
          <div className="col-span-2 grid gap-y-2 xl:col-span-1 xl:gap-0">
            <div className="flex flex-1 flex-col">
              <span className="text-pequod-white mb-4 text-xl">
                Search token
              </span>
              <form className="justify-left flex w-full md:ml-0">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <div className="text-pequod-white relative w-full xl:pr-3">
                  <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center">
                    <SearchIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    id="search-field"
                    className="b-1 focus:ring-pequod-purple block h-full w-full rounded-md border bg-transparent py-2 pl-10 pr-3 text-white placeholder-gray-400 focus:placeholder-gray-400 focus:outline-none focus:ring sm:text-sm"
                    placeholder="0xe861...."
                    type="search"
                    name="search"
                    value={tokenSearch}
                    onChange={(e) => setTokenSearch(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />
                  {searchResults?.length > 0 && searchFocused && (
                    <div className="bg-pequod-white absolute z-10 mt-1 flex max-h-64 w-full flex-col gap-y-3 overflow-y-scroll rounded-md p-3 shadow-md">
                      {searchResults.map((token) => (
                        <div
                          className="cursor-pointer"
                          onPointerDown={() => setTokenSearch(token.address)}
                          key={token.address}
                        >
                          <span className="text-md p-1 font-semibold text-gray-800 ">
                            {token.name} - ${token.symbol}
                          </span>
                          <span className="block overflow-hidden text-sm text-gray-600">
                            {token.address}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
          <TradingPageChart
            priceHistory={priceHistory}
            className="col-span-2 block xl:col-span-1 xl:hidden"
          />
          <div className="col-span-2 flex items-end xl:col-span-1 xl:px-16">
            <div className="flex w-full justify-center">
              <button
                type="button"
                className={classNames(
                  currentlySelectedTab === "buy"
                    ? "border-pequod-white font-bold"
                    : "",
                  "text-pequod-white hover:border-pequod-white inline-flex w-full items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium leading-4"
                )}
                onClick={() => {
                  setCurrentlySelectedTab("buy");
                  resetForm();
                }}
              >
                BUY
              </button>
              <div className="border-pequod-white mx-4 border"> </div>
              <button
                type="button"
                className={classNames(
                  currentlySelectedTab === "sell"
                    ? "border-pequod-white border font-bold"
                    : "",
                  "text-pequod-white hover:border-pequod-white inline-flex w-full items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium leading-4"
                )}
                onClick={() => {
                  setCurrentlySelectedTab("sell");
                  resetForm();
                }}
              >
                SELL
              </button>
            </div>
          </div>
          <TradingPageChart
            priceHistory={priceHistory}
            className="col-span-2 hidden xl:col-span-1 xl:block"
          />

          <div className="h-100 col-span-2 flex flex-col items-start justify-center gap-4 xl:col-span-1 xl:px-16">
            {/* 1st row */}
            <div className="mx-auto w-full">
              <div className="flex justify-between">
                <label
                  htmlFor="amountFrom"
                  className="text-pequod-white block text-sm font-medium"
                >
                  Total{" "}
                  {currentlySelectedTab === "buy"
                    ? `(BNB) Balance: ${userBnbBalance.toFixed(3)}`
                    : selectedTokenInfo?.symbol
                    ? `(${
                        selectedTokenInfo?.symbol
                      }) Balance: ${userSelectedTokenBalance.toFixed(6)}`
                    : ""}
                </label>
              </div>
              <div className="mt-1">
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
                  className="border-pequod-white text-pequod-white focus:ring-pequod-purple block w-full rounded-md border bg-transparent px-2 py-1.5 focus:outline-none focus:ring disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm"
                  disabled={!selectedTokenInfo.address}
                  value={formatAmount(amountFrom)}
                  onChange={(e) => updateFrom(e.target.value)}
                />
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
                  className="text-pequod-white block text-sm font-medium"
                >
                  Total{" "}
                  {currentlySelectedTab === "buy"
                    ? selectedTokenInfo?.symbol
                      ? `(${
                          selectedTokenInfo?.symbol
                        }) Balance: ${userSelectedTokenBalance.toFixed(6)}`
                      : ""
                    : `(BNB) Balance: ${userBnbBalance.toFixed(3)}`}
                </label>
              </div>
              <div className="mt-1">
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
                  className="border-pequod-white text-pequod-white focus:ring-pequod-purple block w-full rounded-md border bg-transparent px-2 py-1.5 focus:outline-none focus:ring disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm"
                  disabled={!selectedTokenInfo.address}
                  value={formatAmount(amountTo)}
                  onChange={(e) => updateTo(e.target.value)}
                />
              </div>
            </div>
            {/* 3rd row */}
            <div className="flex gap-x-10">
              <div>
                <label
                  htmlFor="takeProfit"
                  className="block text-sm font-medium text-green-600"
                >
                  Take Profit (%)
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() =>
                      setTakeProfit(takeProfit <= 0 ? 0 : takeProfit - 1)
                    }
                    disabled={!selectedTokenInfo.address}
                    className="border-pequod-white text-pequod-white focus:border-pequod-purple focus:ring-pequod-purple relative inline-flex items-center space-x-2 rounded-l-md border bg-transparent p-2 text-sm font-medium focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    <MinusIcon
                      className="text-pequod-white h-4 w-4"
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
                      onChange={(e) => setTakeProfit(Number(e.target.value))}
                      className="focus:border-pequod-purple focus:ring-pequod-purple border-pequod-white text-pequod-white block w-full border-t border-b bg-transparent px-5 disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm"
                      placeholder="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setTakeProfit(takeProfit + 1)}
                    disabled={!selectedTokenInfo.address}
                    className="focus:border-pequod-purple focus:ring-pequod-purple border-pequod-white text-pequod-white relative -ml-px inline-flex items-center space-x-2 rounded-r-md border bg-transparent p-2 text-sm font-medium focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    <PlusIcon
                      className="text-pequod-white h-4 w-4"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
              <div>
                <label
                  htmlFor="stopLoss"
                  className="block text-sm font-medium text-red-600"
                >
                  Stop Loss (%)
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() =>
                      setStopLoss(stopLoss <= 0 ? 0 : stopLoss - 1)
                    }
                    disabled={!selectedTokenInfo.address}
                    className="border-pequod-white text-pequod-white focus:border-pequod-purple focus:ring-pequod-purple relative inline-flex items-center space-x-2 rounded-l-md border bg-transparent p-2 text-sm font-medium focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    <MinusIcon
                      className="text-pequod-white h-4 w-4"
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
                      className="focus:border-pequod-purple focus:ring-pequod-purple border-pequod-white text-pequod-white block w-full border-t border-b bg-transparent px-5 disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm"
                      placeholder="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setStopLoss(stopLoss + 1)}
                    disabled={!selectedTokenInfo.address}
                    className="border-pequod-white text-pequod-white focus:border-pequod-purple focus:ring-pequod-purple relative -ml-px inline-flex items-center space-x-2 rounded-r-md border bg-transparent p-2 text-sm font-medium focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    <PlusIcon
                      className="text-pequod-white h-4 w-4"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            </div>
            {/* 4th row */}
            <div className="mt-5 grid w-full grid-cols-2 gap-x-5">
              <div className="flex w-full justify-center">
                {currentlySelectedTab === "buy" ||
                selectedTokenInfo.allowance > 0 ? (
                  <button
                    onClick={() => {
                      setOrderInProgress(true);
                      if (currentlySelectedTab === "buy") {
                        buyCallback().finally(() => {
                          setOrderInProgress(false);
                        });
                      } else {
                        sellCallback(isFullSell).finally(() => {
                          setOrderInProgress(false);
                        });
                      }
                    }}
                    className="b-2 text-pequod-white flex w-full items-center justify-center rounded-md border py-2 px-4 disabled:cursor-default disabled:opacity-50"
                    disabled={
                      !selectedTokenInfo ||
                      !selectedTokenInfo.address ||
                      !amountFrom ||
                      !amountTo
                    }
                  >
                    {orderInProgress ? (
                      <>
                        <Spinner className="text-pequod-white h-5" />
                        <span>Order in progress...</span>
                      </>
                    ) : (
                      "Place Order"
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
                    className="bg-pequod-purple text-pequod-white flex w-full items-center justify-center rounded-md py-2 px-4 disabled:cursor-default disabled:opacity-50"
                    disabled={
                      approve === undefined ||
                      !selectedTokenInfo.allowanceFetched
                    }
                  >
                    {approvalInProgress ? (
                      <>
                        <Spinner className="text-pequod-white h-5" />
                        <span>Approval in progress...</span>
                      </>
                    ) : (
                      `Approve ${selectedTokenInfo.symbol} swap`
                    )}
                  </button>
                )}
              </div>
              <div className="flex w-full justify-center">
                {tpslAllowance ? (
                  <button
                    onClick={() => {
                      setSettingTpsl(true);
                      setTakeProfitStopLoss(
                        selectedTokenInfo.address,
                        userTokens
                          .find(
                            (token) =>
                              token.address.toUpperCase() ===
                              selectedTokenInfo.address.toUpperCase()
                          )
                          ?.amount.toString() || "0",
                        takeProfit.toString(),
                        stopLoss.toString()
                      ).finally(() => setSettingTpsl(false));
                    }}
                    className="b-2 text-pequod-white flex w-full items-center justify-center rounded-md border py-2 px-4 disabled:cursor-default disabled:opacity-50"
                  >
                    {settingTpsl ? (
                      <>
                        <Spinner className="text-pequod-white h-5" />
                        <span>Setting TP/SL...</span>
                      </>
                    ) : (
                      `${settingTpsl.toString()}`
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
                    className="b-2 text-pequod-white flex w-full items-center justify-center rounded-md border py-2 px-4 disabled:cursor-default disabled:opacity-50"
                  >
                    {tpslApprovalInProgress ? (
                      <>
                        <Spinner className="text-pequod-white h-5" />
                        <span>Approval in progress...</span>
                      </>
                    ) : (
                      " Approve TP/SL"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <TradeSettingsDialog slippage={slippage} setSlippage={setSlippage} />
    </>
  );
}
