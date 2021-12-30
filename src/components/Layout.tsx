import { Fragment, useEffect, useState } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { CashIcon, LogoutIcon } from '@heroicons/react/outline';
import { useWeb3React } from '@web3-react/core';
import useAuth from '../hooks/useAuth';
import { useLocation } from 'react-router';
import { classNames, useValidateSessionIfInvalid } from '../utils/utils';
import { useAppSelector } from '../store/hooks';
import { selectUserSignedMessage } from '../store/userInfoSlice';
import Spinner from './Spinner';
import DarkModeToggle from './DarkModeToggle';
import logo from '../images/logo.png';
import logoSmall from '../images/logo-small.png';

export default function Layout({ children }: { children: JSX.Element }) {
  const { account } = useWeb3React();
  const { logout } = useAuth();
  const location = useLocation();
  const userSignedMessage = useAppSelector(selectUserSignedMessage);
  const validateSessionIfInvalid = useValidateSessionIfInvalid();
  const [signInProgress, setSignInProgress] = useState(false);

  const [navigation, setNavigation] = useState([
    { name: 'Staking', href: '/', icon: CashIcon, current: false },
  ]);

  useEffect(() => {
    const page = navigation.find(({ href }) => href === location.pathname);
    if (!page || page.current) return;
    setNavigation(
      navigation.map((item) => ({ ...item, current: item.href === page.href }))
    );
  }, [location.pathname, navigation]);

  const signMessage = () => {
    setSignInProgress(true);
    validateSessionIfInvalid().finally(() => setSignInProgress(false));
  };

  return (
    <>
      <div className='min-h-full'>
        {!userSignedMessage && (
          <div className='z-50 bg-gray-800 bg-opacity-80 fixed top-0 left-0 w-full h-full flex justify-center items-center'>
            <button
              className='flex bg-purple-500 text-white font-bold py-2 px-4 rounded-md h-10 disabled:opacity-70 disabled:cursor-default'
              disabled={signInProgress}
              onClick={signMessage}
            >
              {signInProgress ? (
                <>
                  <Spinner className='text-white h-5' />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign the message'
              )}
            </button>
          </div>
        )}
        <div className='bg-gray-800 dark:bg-gray-700 pb-32'>
          <Disclosure
            as='nav'
            className='bg-gray-800 dark:bg-gray-700 border-b border-purple-300 border-opacity-25 lg:border-none'
          >
            {({ open }) => (
              <>
                <div className='max-w-7xl mx-auto px-2 sm:px-4 lg:px-8'>
                  <div className='relative h-16 flex items-center justify-between lg:border-b lg:border-purple-400 lg:border-opacity-25'>
                    <div className='px-2 flex items-center lg:px-0'>
                      <img
                        className='flex-shrink-0 max-h-11 hidden md:block'
                        src={logo}
                        alt='Pequod Logo'
                      />
                      <img
                        className='flex-shrink-0 max-h-14 md:hidden'
                        src={logoSmall}
                        alt='Pequod Logo'
                      />
                    </div>
                    <div className='block ml-4'>
                      <div className='flex items-center'>
                        {/* Profile dropdown */}
                        <DarkModeToggle />
                        <Menu as='div' className='ml-3 relative'>
                          <div>
                            <Menu.Button className='max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'>
                              <span className='inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-400 hover:bg-purple-500 dark:text-gray-200 dark:bg-purple-500 dark:hover:bg-purple-600 focus:outline-none'>
                                {account?.slice(0, 6) +
                                  '...' +
                                  account?.slice(37)}
                              </span>
                            </Menu.Button>
                          </div>
                          <Transition
                            as={Fragment}
                            enter='transition ease-out duration-100'
                            enterFrom='transform opacity-0 scale-95'
                            enterTo='transform opacity-100 scale-100'
                            leave='transition ease-in duration-75'
                            leaveFrom='transform opacity-100 scale-100'
                            leaveTo='transform opacity-0 scale-95'
                          >
                            <Menu.Items className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 focus:outline-none'>
                              <Menu.Item onClick={logout}>
                                {({ active }) => (
                                  <span
                                    className={classNames(
                                      active
                                        ? 'bg-gray-100 dark:bg-gray-900'
                                        : '',
                                      'flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer'
                                    )}
                                  >
                                    <LogoutIcon
                                      className='mr-2 h-5'
                                      aria-hidden='true'
                                    />
                                    Disconnect
                                  </span>
                                )}
                              </Menu.Item>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Disclosure>
          <header className='py-10'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
              <h1 className='text-3xl font-bold text-white'>Dashboard</h1>
            </div>
          </header>
        </div>

        <main className='-mt-32'>
          <div className='max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8'>
            <div className='bg-white rounded-lg shadow px-5 py-6 sm:px-6'>
              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
