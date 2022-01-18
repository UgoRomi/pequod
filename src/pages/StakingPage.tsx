import { useEffect, useState } from 'react';
import Spinner from '../components/Spinner';
import StakingCard from '../components/StakingCard';
import {
  addAvailableFarms,
  AvailableFarmState,
  selectAvailableFarms,
} from '../store/farmsSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectUserWotAmount } from '../store/userInfoSlice';
import { AvailableFarmResponse } from '../utils/apiTypes';
import { useApiCall, useUserInfo } from '../utils/utils';

export default function StakingPage() {
  const getAndUpdateUserInfo = useUserInfo();
  const dispatch = useAppDispatch();
  const apiCall = useApiCall();
  const availableFarms = useAppSelector(selectAvailableFarms);
  const [loadingFarms, setLoadingFarms] = useState(true);

  const userWotBalance = useAppSelector(selectUserWotAmount);

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
      <div className='flex justify-center w-full h-full'>
        <Spinner className='h-10 text-gray-800' />
      </div>
    );
  }

  return (
    <div className='grid w-full grid-cols-1 gap-3'>
      {availableFarms.map((farm) => {
        return (
          <StakingCard
            key={farm.id}
            stakeId={farm.id}
            userTokenBalance={userWotBalance}
          ></StakingCard>
        );
      })}
    </div>
  );
}
