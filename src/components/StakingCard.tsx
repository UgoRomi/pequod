import { ChevronUpIcon } from '@heroicons/react/outline';
import { LockClosedIcon } from '@heroicons/react/solid';
import { useState } from 'react';

export default function StakingCard({
  apy,
  tokenSymbol,
  amountEarned,
  tokenPriceValue,
  amountStaked,
  allowed,
  approveSpending,
  stakeTokens,
  stakingContractAddress,
  stakeId,
}: {
  apy: number;
  tokenSymbol: string;
  amountEarned: number;
  tokenPriceValue: number;
  amountStaked: number;
  allowed: boolean;
  approveSpending: (() => void) | undefined;
  stakeTokens: (
    stakingContractAddress: string,
    amount: string,
    stakeId: string
  ) => Promise<{
    success: boolean;
    txHash: string;
  }>;
  stakingContractAddress: string;
  stakeId: string;
}) {
  const [stakingFormIsOpen, setStakingFormIsOpen] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('0');

  return (
    <div className='rounded-md border-2 border-purple-400 bg-white shadow-md p-2 h-full w-full'>
      <div className='flex items-center gap-4'>
        <img
          src='https://upload.wikimedia.org/wikipedia/commons/5/51/Mr._Smiley_Face.svg'
          alt='WOT Logo'
          className='h-10'
        />
        <div>
          <p className='font-bold'>{tokenSymbol}</p>
          <p className='text-sm opacity-75'>APY - {apy}%</p>
          <p className='text-sm opacity-75'>Lockup time 1 year</p>
        </div>
        {amountStaked > 0 ? (
          <>
            <div className='hidden lg:block'>
              <p className='font-semibold'>Earned</p>
              <p>{amountEarned}</p>
              <p>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(amountEarned * tokenPriceValue)}
              </p>
            </div>
            <div className='hidden lg:block'>
              <p className='font-semibold'>Total in staking</p>
              <p>{amountStaked}</p>
              <p>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(amountStaked * tokenPriceValue)}
              </p>
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
                className='bg-purple-400 text-white font-bold py-2 px-4 rounded-md lg:w-32'
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
          {amountStaked > 0 && (
            <div className='lg:hidden grid grid-cols-1 gap-4'>
              <div className='flex gap-x-6 flex-wrap'>
                <p className='font-semibold w-full'>Earned</p>
                <span>
                  {tokenSymbol}: {amountEarned}
                </span>
                <span>
                  USD:{' '}
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(amountEarned * tokenPriceValue)}
                </span>
              </div>
              <div className='flex gap-x-6 flex-wrap'>
                <p className='font-semibold w-full'>Total in staking</p>
                <p>
                  {tokenSymbol}: {amountStaked}
                </p>
                <p>
                  USD:{' '}
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(amountStaked * tokenPriceValue)}
                </p>
              </div>
            </div>
          )}
          <div className='border-t-2 mt-2 pt-2 flex justify-around items-end'>
            <div>
              <label
                htmlFor='stakingAmount'
                className='block text-sm font-medium text-gray-700'
              >
                Stake {tokenSymbol}
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
                className='shadow-sm focus:outline-none focus:ring focus:ring-purple-400 block sm:text-sm bg-purple-100 border-1 rounded-md px-2 py-1.5 disabled:opacity-80 disabled:cursor-not-allowed'
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
              />
            </div>
            <button
              onClick={() =>
                stakeTokens(stakingContractAddress, stakeAmount, stakeId)
              }
              className='bg-purple-400 text-white font-bold py-2 px-4 rounded-md h-10'
            >
              Stake Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
