import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { SearchIcon } from "@heroicons/react/outline";
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
  const [slippage, setSlippage] = useState<number>(30);
  const [priceHistory, setPriceHistory] = useState<GraphData[]>([]);
  const [isFullSell, setIsFullSell] = useState<boolean>(false);
  const [orderInProgress, setOrderInProgress] = useState<boolean>(false);
  const [approvalInProgress, setApprovalInProgress] = useState<boolean>(false);
  const [selectedTokenInfo, setSelectedTokenInfo] =
    useState<TokenDetails>(emptyTokenDetails);
  const [timeWindow] = useState<PairDataTimeWindowEnum>(
    PairDataTimeWindowEnum.WEEK
  );
  const pequodApiCall = useApiCall();
  const getTokenPrice = useGetTokenPrice();
  const approve = useApprove();
  const checkSwapAllowance = useAllowance();
  const userBnbBalance = useAppSelector(selectUserBnbAmount);
  const userTokens = useAppSelector(selectUserTokens);
  const [topEarners, setTopEarners] = useState<UserToken[]>([]);
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

  return (
    <>
      <div className="flex flex-col gap-10">
        <h1 className="ml-4 text-3xl font-bold text-pequod-white">Trading</h1>
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
              <div className="grid grid-cols-cards grid-rows-2 gap-4">
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
                    className="rounded-md border border-pequod-white bg-pequod-gray px-3 py-1"
                  >
                    Trade now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Carousel>

        <div className="grid grid-cols-buy gap-y-8 xl:rounded-md xl:bg-pequod-dark xl:p-5">
          <div className="col-span-2 grid gap-y-2 xl:col-span-1 xl:gap-0">
            <div className="flex flex-1 flex-col">
              <span className="mb-4 text-xl text-pequod-white">
                Search token
              </span>
              <form className="justify-left flex w-full md:ml-0">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <div className="relative w-full text-pequod-white xl:pr-3">
                  <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center">
                    <SearchIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    id="search-field"
                    className="b-1 focus:outline-none block h-full w-full rounded-md border bg-transparent py-2 pl-10 pr-3 text-white placeholder-gray-400 focus:placeholder-gray-400 focus:ring focus:ring-pequod-purple sm:text-sm"
                    placeholder="0xe861...."
                    type="search"
                    name="search"
                    value={tokenSearch}
                    onChange={(e) => setTokenSearch(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />
                  {searchResults?.length > 0 && searchFocused && (
                    <div className="absolute z-10 mt-1 flex max-h-64 w-full flex-col gap-y-3 overflow-y-scroll rounded-md bg-pequod-white p-3 shadow-md">
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
                  "inline-flex w-full items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium leading-4 text-pequod-white hover:border-pequod-white"
                )}
                onClick={() => {
                  setCurrentlySelectedTab("buy");
                  updateFrom("0");
                  setAmountTo("0");
                }}
              >
                BUY
              </button>
              <div className="mx-4 border border-pequod-white"> </div>
              <button
                type="button"
                className={classNames(
                  currentlySelectedTab === "sell"
                    ? "border border-pequod-white font-bold"
                    : "",
                  "inline-flex w-full items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium leading-4 text-pequod-white hover:border-pequod-white"
                )}
                onClick={() => {
                  setCurrentlySelectedTab("sell");
                  updateFrom("0");
                  setAmountTo("0");
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
                  className="block text-sm font-medium text-pequod-white"
                >
                  Total{" "}
                  {currentlySelectedTab === "buy"
                    ? "(BNB)"
                    : selectedTokenInfo?.symbol
                    ? `(${selectedTokenInfo?.symbol})`
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
                  className="focus:outline-none block w-full rounded-md border border-pequod-white bg-transparent px-2 py-1.5 text-pequod-white focus:ring focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm"
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
                  className="block text-sm font-medium text-pequod-white"
                >
                  Total{" "}
                  {currentlySelectedTab === "buy"
                    ? selectedTokenInfo?.symbol
                      ? `(${selectedTokenInfo?.symbol})`
                      : ""
                    : "(BNB)"}
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
                  className="focus:outline-none block w-full rounded-md border border-pequod-white bg-transparent px-2 py-1.5 text-pequod-white focus:ring focus:ring-pequod-purple disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm"
                  disabled={!selectedTokenInfo.address}
                  value={formatAmount(amountTo)}
                  onChange={(e) => updateTo(e.target.value)}
                />
              </div>
            </div>
            {/* 3rd row */}
            <div className="mt-5 flex w-full justify-center">
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
                  className="b-2 flex w-full items-center justify-center rounded-md border py-2 px-4 text-pequod-white disabled:cursor-default disabled:opacity-50"
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
                  className="flex w-full items-center justify-center rounded-md bg-pequod-purple py-2 px-4 text-pequod-white disabled:cursor-default disabled:opacity-50"
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
                    `Approve ${selectedTokenInfo.symbol} swap`
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <TradeSettingsDialog slippage={slippage} setSlippage={setSlippage} />
    </>
  );
}
