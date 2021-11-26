import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Carousel from 'react-multi-carousel';
import { PlusIcon, SearchIcon } from '@heroicons/react/outline';

interface AvailableStaking {
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

interface Token {
  name: string;
  address: string;
  symbol: string;
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
  const [staking, setStaking] = useState<AvailableStaking[]>([]);
  const [tokenSearch, setTokenSearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);

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

  useEffect(() => {
    if (!tokenSearch) {
      setSearchResults([]);
      return;
    }
    const searchTokens = setTimeout(() => {
      axios
        .get(`http://localhost:3001/tokens/${tokenSearch}`)
        .then((res) => {
          setSearchResults(res.data);
        })
        .catch((_err) => {
          toast.error('Error retrieving tokens, please retry');
        });
    }, 200);

    return () => clearTimeout(searchTokens);
  }, [tokenSearch]);

  return (
    <div>
      <div className='flex flex-col gap-11'>
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
        <div className='grid grid-rows-2 grid-cols-3 lg:bg-white lg:p-5 lg:border-2 lg:border-purple-400 lg:rounded-md'>
          <div className='flex-1 flex flex-col col-span-3'>
            <p className='font-bold m-auto mb-3 text-md text-gray-800'>
              Search token
            </p>
            <form className='w-full flex justify-center md:ml-0'>
              <label htmlFor='search-field' className='sr-only'>
                Search
              </label>
              <div className='relative w-full text-gray-400 focus-within:text-gray-600 max-w-xl'>
                <div className='absolute inset-y-0 left-2 flex items-center pointer-events-none'>
                  <SearchIcon className='h-5 w-5' aria-hidden='true' />
                </div>
                <input
                  id='search-field'
                  className='block w-full h-full pl-10 pr-3 py-2 bg-white lg:bg-purple-50 text-gray-600 focus:outline-none focus:ring placeholder-gray-400 focus:placeholder-gray-400 sm:text-sm rounded-md'
                  placeholder='0xe861....'
                  type='search'
                  name='search'
                  value={tokenSearch}
                  onChange={(e) => setTokenSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
                {searchResults?.length > 0 && searchFocused && (
                  <div className='z-10 mt-1 p-3 w-full shadow-md rounded-md absolute bg-white'>
                    {searchResults.map((token, i) => (
                      <div className='cursor-pointer' key={token.address}>
                        <span className='p-1 text-md text-gray-800 font-semibold'>
                          {token.name} - ${token.symbol}
                        </span>
                        <span className='block text-sm text-gray-600 overflow-hidden'>
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
      </div>
    </div>
  );
}
