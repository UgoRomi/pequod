import { useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import Spinner from "../components/Spinner";
import {
  addAvailableFarms,
  AvailableFarmState,
  selectAvailableFarms,
} from "../store/farmsSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectUserWotAmount } from "../store/userInfoSlice";
import { AvailableFarmResponse } from "../utils/apiTypes";
import { useApiCall, useUserInfo } from "../utils/utils";

import unknownTokenLogo from "../images/unknown-token.svg";
import StakingTable from "../components/StakingTable";
import StakingModal from "../components/StakingModal";
export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
export default function StakingPage() {
  const getAndUpdateUserInfo = useUserInfo();
  const dispatch = useAppDispatch();
  const apiCall = useApiCall();
  const availableFarms = useAppSelector(selectAvailableFarms);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [showStakeModal, setShowStakeModal] = useState<boolean>(false);
  const [stakeIdSelected, setStakeId] = useState<number>(0);
  const userWotBalance = useAppSelector(selectUserWotAmount);

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
  useEffect(() => {
    getAndUpdateUserInfo();
  }, [getAndUpdateUserInfo]);

  useEffect(() => {
    apiCall(`/farms/${process.env.REACT_APP_CHAIN_ID}/available`, {}).then(
      (res) => {
        if (!res?.data) {
          return;
        }
        const { data: response }: { data: AvailableFarmResponse[] } = res;
        const availableFarms: AvailableFarmState[] = response.map(
          (farm): AvailableFarmState => {
            return {
              id: farm.id,
              farmContractAddress: farm.address,
              apy: farm.apy,
              lockupTime: farm.periodInSeconds,
              tokenSymbol: farm.token.symbol,
              tokenAddress: farm.token.address,
              minimumToStake: farm.minimumToStake,
              earningPercentage: 0,
              token: farm.token
            };
          }
        );
        dispatch(addAvailableFarms(availableFarms));
        setLoadingFarms(false);
      }
    );
    // TODO: Fix dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
  if (loadingFarms && !availableFarms.length) {
    return (
      <div className="flex h-full w-full justify-center">
        <Spinner className="h-10 text-gray-800" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-10">
        <h1 className="text-pequod-white ml-4 text-2xl font-normal">Staking</h1>
        <Carousel
            itemClass="mx-4"
            responsive={responsive}
            slidesToSlide={1}
            swipeable
            draggable
            infinite
          >
            {availableFarms.map((farm, i) => (
              <div
                key={i}
                className="from-pequod-white-400 to-transparent border-white-400 h-full rounded-40 border bg-gradient-to-b p-8 text-white shadow-md"
              >
                <div className="grid-cols-cards grid grid-rows-2 gap-2">
                  <img
                    src={unknownTokenLogo}
                    alt={farm.tokenSymbol}
                    className="row-span-2 h-10"
                  />
                  <div>
                    <p>
                      <span className="opacity-75">{farm.token.name} </span>
                      <span className="font-bold">{farm.tokenSymbol}</span>
                    </p>
                    <p className="text-sm opacity-75">{farm.tokenSymbol}/USDT</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p>APY</p>
                      <p className="text-sm">{farm.apy}%</p>
                    </div>
                    <button
                      onClick={() => {setStakeId(farm.id); setShowStakeModal(!showStakeModal)}}
                      className="border-pequod-white bg-pequod-gray rounded-md border px-3 py-1"
                    >
                      Stake now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        
        <h1 className="text-pequod-white ml-4 text-2xl font-normal">Staked tokens</h1>
        <StakingTable></StakingTable>
        
        {
          showStakeModal ?
          (
            <>
            <StakingModal stakeId={stakeIdSelected}
            userTokenBalance={userWotBalance}></StakingModal>
            </>
          ) : 
          (<></>)
        }

      </div>
    </>
  );
}
