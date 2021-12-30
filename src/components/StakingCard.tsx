import { ChevronUpIcon, ExclamationCircleIcon } from '@heroicons/react/outline';
import { LockClosedIcon } from '@heroicons/react/solid';
import { useEffect, useState } from 'react';
import { AvailableFarmState } from '../store/farmsSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { RootState } from '../store/store';
import { updateUserFarm } from '../store/userInfoSlice';
import { useAllowance, useApprove, useWotStake } from '../utils/contractsUtils';
import { secondsToDhms } from '../utils/utils';
import PercentagesGroup, { Percentages } from './PercentagesGroup';
import Spinner from './Spinner';

export default function StakingCard({
  stakeId,
  userTokenBalance,
  disabled = false,
}: {
  stakeId: number;
  userTokenBalance: number;
  disabled: boolean;
}) {
  const [stakingFormIsOpen, setStakingFormIsOpen] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('0');
  const [allowed, setAllowed] = useState(false);
  const [percentageButtonActive, setPercentageButtonActive] =
    useState<number>(0);

  const [stakingInProgress, setStakingInProgress] = useState(false);
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
    approve(
      farmGeneralData.tokenAddress,
      farmGeneralData.farmContractAddress
    ).then((res) => {
      setAllowed(res);
    });
  };

  const stake = () => {
    setStakingInProgress(true);
    stakeWot(
      farmGeneralData.farmContractAddress,
      stakeAmount,
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

  const updateStakeAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStakeAmount(event.target.value);
    const stakeAmount = parseFloat(event.target.value);
    setPercentageButtonActive(4 * (stakeAmount / userTokenBalance));
  };

  return (
    <div className='rounded-md border-2 border-purple-400 bg-white shadow-md p-2 h-full w-full relative'>
      {disabled && (
        <div className='absolute top-0 left-0 w-full h-full bg-gray-600 bg-opacity-60 z-10 box-border rounded-sm'></div>
      )}
      <div className='flex items-center gap-4 lg:gap-7'>
        <img
          src='https://upload.wikimedia.org/wikipedia/commons/5/51/Mr._Smiley_Face.svg'
          alt='WOT Logo'
          className='h-10'
        />
        <div>
          <p className='font-bold'>{farmGeneralData.tokenSymbol}</p>
          <p className='text-sm opacity-75'>APY - {farmGeneralData.apy}%</p>
          <p className='text-sm opacity-75'>Lockup time: 1 year</p>
        </div>
        {userFarm ? (
          <>
            <div className='hidden lg:block self-start'>
              <p className='font-semibold'>Earned</p>
              <p>{userFarm.amountEarned.toFixed(5)}</p>
              {userFarm.tokenUSDPrice !== Infinity && (
                <p>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(userFarm.amountEarned * userFarm.tokenUSDPrice)}
                </p>
              )}
            </div>
            <div className='hidden lg:block self-start'>
              <p className='font-semibold'>Total in staking</p>
              <p>{userFarm.totalAmount.toFixed(5)}</p>
              {userFarm.tokenUSDPrice !== Infinity && (
                <p>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(userFarm.totalAmount * userFarm.tokenUSDPrice)}
                </p>
              )}
            </div>
            <div className='hidden lg:block self-start'>
              <p className='font-semibold'>Unlocks in</p>
              <p>{secondsToDhms(userFarm.unStakingTimeInSeconds)}</p>
            </div>
            <button
              onClick={() => setStakingFormIsOpen(!stakingFormIsOpen)}
              className='capitalize text-purple-400 font-bold py-2 px-4 rounded-md ml-auto gap-3 justify-center items-center flex'
            >
              <LockClosedIcon className='w-5 text-purple-400 font-bold' />
              details
              <ChevronUpIcon
                className={`${
                  !stakingFormIsOpen ? 'transform rotate-180' : ''
                } w-5 h-5 text-purple-400`}
              />
            </button>
          </>
        ) : (
          <>
            {allowed ? (
              <button
                onClick={() => setStakingFormIsOpen(!stakingFormIsOpen)}
                className='capitalize text-purple-400 font-bold py-2 px-4 rounded-md ml-auto gap-3 justify-center items-center flex'
              >
                Details
                <ChevronUpIcon
                  className={`${
                    !stakingFormIsOpen ? 'transform rotate-180' : ''
                  } w-5 h-5 text-purple-400`}
                />
              </button>
            ) : (
              <button
                className='bg-purple-400 text-white font-bold py-2 px-4 rounded-md'
                onClick={approveSpending}
              >
                Approve Staking
              </button>
            )}
          </>
        )}
      </div>
      {stakingFormIsOpen && (
        <div className='flex flex-col my-3'>
          {userFarm && (
            <div className='lg:hidden grid grid-cols-1 gap-4'>
              <div className='flex gap-x-6 flex-wrap'>
                <p className='font-semibold w-full'>Earned</p>
                <span>{userFarm.amountEarned}</span>
                {userFarm.tokenUSDPrice !== Infinity && (
                  <span>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(userFarm.amountEarned * userFarm.tokenUSDPrice)}
                  </span>
                )}
              </div>
              <div className='flex gap-x-6 flex-wrap'>
                <p className='font-semibold w-full'>Total in staking</p>
                <p>{userFarm.totalAmount}</p>
                {userFarm.tokenUSDPrice !== Infinity && (
                  <p>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(userFarm.totalAmount * userFarm.tokenUSDPrice)}
                  </p>
                )}
              </div>
              <div className='flex gap-x-6 flex-wrap'>
                <p className='font-semibold w-full'>Unlocks in</p>
                <p>{secondsToDhms(userFarm.unStakingTimeInSeconds)}</p>
              </div>
            </div>
          )}
          <div className='border-t-2 mt-2 pt-2 flex flex-wrap justify-around items-center gap-y-3'>
            {userFarm && (
              <span className='w-full text-xl font-bold flex items-center justify-center gap-3 text-purple-500'>
                <ExclamationCircleIcon className='h-20 lg:h-10' />
                Adding more {userFarm?.tokenSymbol} to the staking pool will
                reset the lockup period
              </span>
            )}
            <div>
              <label
                htmlFor='stakingAmount'
                className='block text-sm font-medium text-gray-700'
              >
                Stake {farmGeneralData.tokenSymbol}
              </label>
              <input
                type='text'
                name='stakingAmount'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                pattern='^[0-9]*[.,]?[0-9]*$'
                placeholder='0.0'
                minLength={1}
                maxLength={79}
                spellCheck='false'
                className='shadow-sm focus:outline-none focus:ring focus:ring-purple-400 block sm:text-sm bg-purple-100 border-1 rounded-md px-2 py-1.5 disabled:opacity-70 disabled:cursor-default'
                value={stakeAmount}
                onChange={updateStakeAmount}
              />
              <PercentagesGroup
                darkModeClass='text-gray-700'
                buttonClickCallback={percentageButtonClicked}
                active={percentageButtonActive}
                setActive={setPercentageButtonActive}
              />
            </div>
            <button
              disabled={
                !stakeAmount ||
                parseFloat(stakeAmount) === 0 ||
                stakingInProgress
              }
              onClick={stake}
              className='flex bg-purple-400 text-white font-bold py-2 px-4 rounded-md h-10 disabled:opacity-70 disabled:cursor-default'
            >
              {stakingInProgress ? (
                <>
                  <Spinner />
                  Staking...
                </>
              ) : (
                'Stake Now'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
