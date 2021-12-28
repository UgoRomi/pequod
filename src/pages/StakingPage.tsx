import { LockClosedIcon } from '@heroicons/react/outline';
import { useEffect, useState } from 'react';
import Carousel from 'react-multi-carousel';
import { useAllowance } from '../utils/contractsUtils';

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

export default function StakingPage() {
  const [, setStaking100Allowed] = useState<boolean>(false);
  const [, setStaking20Allowed] = useState<boolean>(false);
  const check100StakingAllowance = useAllowance(
    process.env.REACT_APP_WOT_ADDRESS as string,
    process.env.REACT_APP_WOT_STAKING_100_ADDRESS as string
  );

  const check20StakingAllowance = useAllowance(
    process.env.REACT_APP_WOT_ADDRESS as string,
    process.env.REACT_APP_WOT_STAKING_20_ADDRESS as string
  );

  // Get the allowance for moby towards the 100% staking contract
  useEffect(() => {
    check100StakingAllowance().then((allowance: number) => {
      setStaking100Allowed(allowance !== 0);
    });
  }, [check100StakingAllowance]);

  // Get the allowance for moby towards the 20% staking contract
  useEffect(() => {
    check20StakingAllowance().then((allowance: number) => {
      setStaking20Allowed(allowance !== 0);
    });
  }, [check20StakingAllowance]);

  return (
    <div>
      <Carousel
        itemClass='mx-4'
        responsive={responsive}
        slidesToSlide={1}
        swipeable
        draggable
        infinite
      >
        <div className='rounded-md border-2 border-purple-400 bg-white shadow-md p-2 h-full'>
          <div className='flex items-center gap-4'>
            <img
              src='https://upload.wikimedia.org/wikipedia/commons/5/51/Mr._Smiley_Face.svg'
              alt='WOT Logo'
              className='h-10'
            />
            <div>
              <p className='font-bold'>WOT</p>
              <p className='text-sm opacity-75'>APY - 20%</p>
              <p className='text-sm opacity-75'>Lockup time 1 year</p>
            </div>
          </div>
          <div className='flex items-center justify-between mt-4'>
            {false ? (
              <>
                <div className='text-xs w-2/3 flex justify-evenly'>
                  <div>
                    <p className='font-semibold'>Earned</p>
                    <p>{100000}</p>
                    <p>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(100000 * 1)}
                    </p>
                  </div>
                  <div className='border-r' aria-hidden></div>
                  <div>
                    <p className='font-semibold'>Balance</p>
                    <p>{10000000}</p>
                    <p>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(10000000 * 1)}
                    </p>
                  </div>
                </div>
                <div className='flex w-1/3 justify-center h-full'>
                  <button className='bg-purple-400 text-white font-bold py-2 px-4 rounded-md'>
                    <LockClosedIcon className='w-5' />
                  </button>
                </div>
              </>
            ) : (
              <div className='w-full flex justify-center'>
                <button className='bg-purple-400 text-white font-bold py-2 px-4 rounded-md'>
                  Stake now
                </button>
              </div>
            )}
          </div>
        </div>
        <div className='rounded-md border-2 border-purple-400 bg-white shadow-md p-2 h-full'>
          <div className='flex items-center gap-4'>
            <img
              src='https://upload.wikimedia.org/wikipedia/commons/5/51/Mr._Smiley_Face.svg'
              alt='WOT Logo'
              className='h-10'
            />
            <div>
              <p className='font-bold'>WOT</p>
              <div className='w-full grid grid-cols-2 grid-rows-2'>
                <span className='text-sm opacity-75'>APY</span>
                <span className='text-sm opacity-75'>Unlocks In</span>
                <span className='text-sm opacity-75'>20%</span>
                <span className='text-sm opacity-75'>364:23:12:16</span>
              </div>
            </div>
          </div>
          <div className='flex items-center justify-between mt-4'>
            {true ? (
              <>
                <div className='text-xs w-2/3 flex justify-evenly'>
                  <div>
                    <p className='font-semibold'>Earned</p>
                    <p>{100000}</p>
                    <p>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(100000 * 1)}
                    </p>
                  </div>
                  <div className='border-r' aria-hidden></div>
                  <div>
                    <p className='font-semibold'>Balance</p>
                    <p>{10000000}</p>
                    <p>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(10000000 * 1)}
                    </p>
                  </div>
                </div>
                <div className='flex w-1/3 justify-center h-full'>
                  <button className='bg-purple-400 text-white font-bold py-2 px-4 rounded-md'>
                    <LockClosedIcon className='w-5' />
                  </button>
                </div>
              </>
            ) : (
              <div className='w-full flex justify-center'>
                <button className='bg-purple-400 text-white font-bold py-2 px-4 rounded-md'>
                  Stake now
                </button>
              </div>
            )}
          </div>
        </div>
      </Carousel>
    </div>
  );
}
