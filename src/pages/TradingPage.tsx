import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Carousel from 'react-multi-carousel';

interface availableStaking {
  tokenName: string;
  tokenImage: string;
  tokenSymbol: string;
  amountInStaking: number;
  APYPercentage: number;
  totalEarned: number;
  totalBalance: number;
  tokenPriceUSD: number;
}

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 6,
    partialVisibilityGutter: 40,
    slidesToSlide: 1,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    partialVisibilityGutter: 50,
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
          ssr
          swipeable={true}
          draggable={true}
          itemClass='mx-4'
          responsive={responsive}
        >
          {staking.map((token, i) => (
            <div key={i} className='rounded-md border-2 border-purple-400 p-2'>
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
              <div className='flex items-center justify-between'></div>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}
