import { ChevronUpIcon, ExclamationCircleIcon } from "@heroicons/react/outline";
import { LockClosedIcon } from "@heroicons/react/solid";
import { useEffect, useState } from "react";
import { AvailableFarmState } from "../store/farmsSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { RootState } from "../store/store";
import { updateUserFarm } from "../store/userInfoSlice";
import { useAllowance, useApprove, useWotStake } from "../utils/contractsUtils";
import { formatTokenAmount, secondsToDhms } from "../utils/utils";
import PercentagesGroup, { Percentages } from "./PercentagesGroup";
import { subMilliseconds } from "date-fns";
import Spinner from "./Spinner";
import { ReactComponent as TokenLogo } from "../images/wot-logo.svg";

export default function StakingCard({
  stakeId,
  userTokenBalance,
}: {
  stakeId: number;
  userTokenBalance: number;
}) {
  const [stakingFormIsOpen, setStakingFormIsOpen] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("0");
  const [allowed, setAllowed] = useState(false);
  const [percentageButtonActive, setPercentageButtonActive] =
    useState<number>(0);

  const [stakingInProgress, setStakingInProgress] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const getAllowance = useAllowance();
  const approve = useApprove();
  const stakeWot = useWotStake();
  const dispatch = useAppDispatch();
  const farmGeneralData = useAppSelector((state: RootState) =>
    state.farms.available.find((farm) => farm.id === stakeId)
  ) as AvailableFarmState;

  const userFarm = useAppSelector((state: RootState) =>
    state.userInfo.farms.find((farm) => farm.id === stakeId)
  );

  useEffect(() => {
    getAllowance(
      farmGeneralData.tokenAddress,
      farmGeneralData.farmContractAddress
    ).then((res) => {
      setAllowed(res > 0);
    });
  });

  const approveSpending = () => {
    setIsApproving(true);
    approve(farmGeneralData.tokenAddress, farmGeneralData.farmContractAddress)
      .then((res) => {
        setAllowed(res);
      })
      .finally(() => {
        setIsApproving(false);
      });
  };

  const stake = () => {
    setStakingInProgress(true);
    // TODO: Allow the user to stake fractions of a token
    stakeWot(
      farmGeneralData.farmContractAddress,
      Math.floor(parseFloat(stakeAmount)).toString(),
      farmGeneralData.id
    ).finally(() => {
      setStakingInProgress(false);
    });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!userFarm) return;
      dispatch(
        updateUserFarm({
          ...userFarm,
          unStakingTimeInSeconds: userFarm.unStakingTimeInSeconds - 1,
        })
      );
    }, 1000);
    return () => clearTimeout(timeout);
  });

  const percentageButtonClicked = (percentage: Percentages) => {
    switch (percentage) {
      case Percentages["25%"]:
        setStakeAmount((userTokenBalance * 0.25).toFixed(4));
        break;
      case Percentages["50%"]:
        setStakeAmount((userTokenBalance * 0.5).toFixed(4));
        break;
      case Percentages["75%"]:
        setStakeAmount((userTokenBalance * 0.75).toFixed(4));
        break;
      case Percentages["100%"]:
        setStakeAmount(userTokenBalance.toFixed(4));
        break;
    }
  };

  const updateStakeAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStakeAmount(event.target.value);
    const stakeAmount = parseFloat(event.target.value);
    setPercentageButtonActive(4 * (stakeAmount / userTokenBalance));
  };

  const formatUnStakingTime = (unStakingTimeInSeconds: number) => {
    const unStakingDate = new Date(unStakingTimeInSeconds * 1000);
    const timeToUnstake =
      subMilliseconds(unStakingDate, Date.now()).getTime() / 1000;
    return secondsToDhms(timeToUnstake);
  };

  return (
    <div className="relative h-full w-full rounded-md border-2 border-purple-400 bg-white p-2 shadow-md">
      <div className="flex items-center gap-4 lg:gap-7">
        <TokenLogo className="h-10 w-10" />
        <div>
          <p className="font-bold">{farmGeneralData.tokenSymbol}</p>
          <p className="text-sm opacity-75">APY - {farmGeneralData.apy}%</p>
          <p className="text-sm opacity-75">Lock-Up Period: 1 year</p>
        </div>
        {userFarm ? (
          <>
            <div className="hidden self-start lg:block">
              <p className="font-semibold">Earned</p>
              <p>{formatTokenAmount(userFarm.amountEarned)}</p>
              {userFarm.tokenUSDPrice !== Infinity && (
                <p>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(userFarm.amountEarned * userFarm.tokenUSDPrice)}
                </p>
              )}
            </div>
            <div className="hidden self-start lg:block">
              <p className="font-semibold">Total in staking</p>
              <p>{formatTokenAmount(userFarm.totalAmount)}</p>
              {userFarm.tokenUSDPrice !== Infinity && (
                <p>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(userFarm.totalAmount * userFarm.tokenUSDPrice)}
                </p>
              )}
            </div>
            <div className="hidden self-start lg:block">
              <p className="font-semibold">Unlocks in</p>
              <p>{formatUnStakingTime(userFarm.unStakingTimeInSeconds)}</p>
            </div>
            <button
              onClick={() => setStakingFormIsOpen(!stakingFormIsOpen)}
              className="ml-auto flex items-center justify-center gap-3 rounded-md py-2 px-4 font-bold capitalize text-purple-400"
            >
              <LockClosedIcon className="w-5 font-bold text-purple-400" />
              details
              <ChevronUpIcon
                className={`${
                  !stakingFormIsOpen ? "rotate-180 transform" : ""
                } h-5 w-5 text-purple-400`}
              />
            </button>
          </>
        ) : (
          <>
            {allowed ? (
              <button
                onClick={() => setStakingFormIsOpen(!stakingFormIsOpen)}
                className="ml-auto flex items-center justify-center gap-3 rounded-md py-2 px-4 font-bold capitalize text-purple-400"
              >
                Details
                <ChevronUpIcon
                  className={`${
                    !stakingFormIsOpen ? "rotate-180 transform" : ""
                  } h-5 w-5 text-purple-400`}
                />
              </button>
            ) : (
              <button
                disabled={isApproving}
                className="rounded-md bg-purple-400 py-2 px-4 font-bold text-white"
                onClick={approveSpending}
              >
                {isApproving ? (
                  <>
                    <Spinner className="h-5 text-white" />
                    Approving...
                  </>
                ) : (
                  "Approve spending"
                )}
              </button>
            )}
          </>
        )}
      </div>
      {stakingFormIsOpen && (
        <div className="my-3 flex flex-col">
          {userFarm && (
            <div className="grid grid-cols-1 gap-4 lg:hidden">
              <div className="flex flex-wrap gap-x-6">
                <p className="w-full font-semibold">Earned</p>
                <span>{formatTokenAmount(userFarm.amountEarned)}</span>
                {userFarm.tokenUSDPrice !== Infinity && (
                  <span>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(userFarm.amountEarned * userFarm.tokenUSDPrice)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-6">
                <p className="w-full font-semibold">Total in staking</p>
                <p>{formatTokenAmount(userFarm.totalAmount)}</p>
                {userFarm.tokenUSDPrice !== Infinity && (
                  <p>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(userFarm.totalAmount * userFarm.tokenUSDPrice)}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-x-6">
                <p className="w-full font-semibold">Unlocks in</p>
                <p>{formatUnStakingTime(userFarm.unStakingTimeInSeconds)}</p>
              </div>
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center justify-around gap-y-3 border-t-2 pt-2">
            {userFarm && (
              <span className="flex w-full items-center justify-center gap-3 text-xl font-bold text-purple-500">
                <ExclamationCircleIcon className="h-20 lg:h-10" />
                Adding more {userFarm?.tokenSymbol} to the staking pool will
                reset the lockup period
              </span>
            )}
            <div>
              <div className="md:w-max">
                <label
                  htmlFor="stakingAmount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Stake {farmGeneralData.tokenSymbol}
                </label>
                <input
                  type="text"
                  name="stakingAmount"
                  inputMode="decimal"
                  autoComplete="off"
                  autoCorrect="off"
                  pattern="^[0-9]*[.,]?[0-9]*$"
                  placeholder={farmGeneralData.minimumToStake.toString()}
                  minLength={1}
                  maxLength={79}
                  spellCheck="false"
                  className="focus:outline-none border-1 block w-full rounded-md bg-purple-100 px-2 py-1.5 shadow-sm focus:ring focus:ring-purple-400 disabled:cursor-default disabled:opacity-70 sm:text-sm"
                  value={stakeAmount}
                  onChange={updateStakeAmount}
                />
                <PercentagesGroup
                  darkModeClass="text-gray-700"
                  buttonClickCallback={percentageButtonClicked}
                  active={percentageButtonActive}
                  setActive={setPercentageButtonActive}
                />
              </div>
              {!userFarm && (
                <p className="mt-2 text-sm text-gray-500">
                  You need to stake at least{" "}
                  {formatTokenAmount(farmGeneralData.minimumToStake)}{" "}
                  {farmGeneralData.tokenSymbol}.
                </p>
              )}
            </div>

            <button
              disabled={
                !stakeAmount ||
                parseFloat(stakeAmount) === 0 ||
                stakingInProgress ||
                (parseFloat(stakeAmount) < farmGeneralData.minimumToStake &&
                  !userFarm?.totalAmount)
              }
              onClick={stake}
              className="flex h-10 rounded-md bg-purple-400 py-2 px-4 font-bold text-white disabled:cursor-default disabled:opacity-70"
            >
              {stakingInProgress ? (
                <>
                  <Spinner className="h-5 text-white" />
                  Staking...
                </>
              ) : (
                "Stake Now"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
