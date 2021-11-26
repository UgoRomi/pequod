import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Carousel from 'react-multi-carousel';
import { PlusIcon } from '@heroicons/react/outline';

interface availableStaking {
  tokenName: string;
  tokenImage: string;
  tokenSymbol: string;
  totalAmountInStaking: number;
  userAmountInStaking: number;
  APYPercentage: number;
  totalEarned: number;
  totalBalance: number;
  tokenPriceUSD: number;
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
    items: 1.5,
    partialVisibilityGutter: 30,
  },
};

export default function TradingPage() {
  const [staking, setStaking] = useState<availableStaking[]>([]);

  useEffect(() => {
    axios
      .get('http://localhost:3001/staking')
      .then((res) => {
        setStaking(res.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          'There was an error retrieving available staking options\nPlease try reloading this page'
        );
      });
  }, []);

  return (
    <div>
      <div>
        <Carousel
          itemClass='mx-4'
          responsive={responsive}
          slidesToSlide={1}
          swipeable
          draggable
          infinite
        >
          {staking.map((token, i) => (
            <div
              key={i}
              className='rounded-md border-2 border-purple-400 bg-white shadow-md p-2 h-full'
            >
              <div className='flex items-center gap-4'>
                <img
                  src={token.tokenImage}
                  alt={token.tokenName}
                  className='h-10'
                />
                <div>
                  <p className='font-bold'>{token.tokenSymbol}</p>
                  <span className='text-sm opacity-75'>
                    APY - {token.APYPercentage}%
                  </span>
                </div>
              </div>
              <div className='flex items-center justify-between mt-4'>
                {token.userAmountInStaking > 0 ? (
                  <>
                    <div className='text-xs w-2/3 flex justify-evenly'>
                      <div>
                        <p className='font-semibold'>Earned</p>
                        <p>{token.totalEarned}</p>
                        <p>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(token.totalEarned * token.tokenPriceUSD)}
                        </p>
                      </div>
                      <div className='border-r' aria-hidden></div>
                      <div>
                        <p className='font-semibold'>Balance</p>
                        <p>{token.totalBalance}</p>
                        <p>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(token.totalBalance * token.tokenPriceUSD)}
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
                      <p>{token.totalAmountInStaking}</p>
                    </div>
                    <button className='bg-purple-400 text-white font-bold py-2 px-4 rounded-md'>
                      Stake now
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}
