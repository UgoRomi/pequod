import { Fragment, useEffect, useState } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import {
  CashIcon,
  LogoutIcon,
  XIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  MenuAlt2Icon,
} from '@heroicons/react/outline';
import { useWeb3React } from '@web3-react/core';
import useAuth from '../hooks/useAuth';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { classNames, useValidateSessionIfInvalid } from '../utils/utils';
import logo from '../images/logo2.png';
import wotLogo from '../images/wot-logo.svg';
import { useAppSelector } from '../store/hooks';
import { selectUserSignedMessage } from '../store/userInfoSlice';
import Spinner from './Spinner';

import { toast } from 'react-toastify';

import { selectUserWotAmount } from '../store/userInfoSlice';
export default function Layout({ children }: { children: JSX.Element }) {
  const userWotBalance = useAppSelector(selectUserWotAmount);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { account } = useWeb3React();
  const { logout } = useAuth();
  const location = useLocation();
  const userSignedMessage = useAppSelector(selectUserSignedMessage);
  const validateSessionIfInvalid = useValidateSessionIfInvalid();
  const [signInProgress, setSignInProgress] = useState(false);

  const [navigation, setNavigation] = useState([
    { name: 'Trading', href: '/', icon: ChartPieIcon, current: false },
    { name: 'Staking', href: '/staking', icon: CashIcon, current: false },
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

  const copyToClipboard = (e: any) => {
    e.preventDefault();
    /* Get the text field */
    const accountUser = account ? account : '';
    navigator.clipboard.writeText(accountUser);

    /* Alert the copied text */

    toast.success('Text copied');
  };

  return (
    <>
      <div className='min-h-full bg-pequod-dark'>
        {!userSignedMessage && (
          <div className='z-50 bg-gray-800 bg-opacity-80 fixed top-0 left-0 w-full h-full flex justify-center items-center'>
            <button
              className='flex bg-pequod-purple text-pequod-white font-bold py-2 px-4 rounded-md h-10 disabled:opacity-70 disabled:cursor-default'
              disabled={signInProgress}
              onClick={signMessage}
            >
              {signInProgress ? (
                <>
                  <Spinner className='text-pequod-white h-5' />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign the message'
              )}
            </button>
          </div>
        )}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as='div'
            className='fixed inset-0 flex z-40 md:hidden'
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter='transition-opacity ease-linear duration-300'
              enterFrom='opacity-0'
              enterTo='opacity-100'
              leave='transition-opacity ease-linear duration-300'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
            >
              <Dialog.Overlay className='fixed inset-0 bg-gray-600 bg-opacity-75' />
            </Transition.Child>
            <Transition.Child
              as={Fragment}
              enter='transition ease-in-out duration-300 transform'
              enterFrom='-translate-x-full'
              enterTo='translate-x-0'
              leave='transition ease-in-out duration-300 transform'
              leaveFrom='translate-x-0'
              leaveTo='-translate-x-full'
            >
              <div className='relative flex-1 flex flex-col gap-6 max-w-xs w-full pt-5 pb-4 bg-pequod-gray'>
                <Transition.Child
                  as={Fragment}
                  enter='ease-in-out duration-300'
                  enterFrom='opacity-0'
                  enterTo='opacity-100'
                  leave='ease-in-out duration-300'
                  leaveFrom='opacity-100'
                  leaveTo='opacity-0'
                >
                  <div className='absolute top-0 right-0 -mr-12 pt-2'>
                    <button
                      type='button'
                      className='ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className='sr-only'>Close sidebar</span>
                      <XIcon
                        className='h-6 w-6 text-white'
                        aria-hidden='true'
                      />
                    </button>
                  </div>
                </Transition.Child>
                <div className='flex-shrink-0 flex items-center px-4'>
                  <img className='h-8 w-auto' src={logo} alt='Pequod Logo' />
                </div>
                <Menu as='div' className='flex w-full justify-center'>
                  <div>
                    <Menu.Button className='max-w-xs flex items-center border b-2 text-sm rounded-full bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pequod-purple'>
                      <span className='sr-only'>Open user menu</span>
                      <span className='inline-flex items-center px-5 py-1 text-base font-medium rounded-full shadow-sm text-pequod-white bg-transparent hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pequod-purple'>
                        {account?.slice(0, 6) + '...' + account?.slice(37)}
                      </span>
                      <DocumentDuplicateIcon
                        className='mr-3 flex-shrink-0 h-6 w-6 text-white'
                        aria-hidden='true'
                        onClick={(e) => copyToClipboard(e)}
                      />
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
                    <Menu.Items className='origin-top-right absolute mt-10 w-48 rounded-md shadow-lg py-1 bg-pequod-dark ring-1 ring-pequod-dark ring-opacity-5 focus:outline-none'>
                      <Menu.Item onClick={logout}>
                        {({ active }) => (
                          <span
                            className={classNames(
                              active ? 'bg-pequod-dark' : '',
                              'flex items-center px-4 py-2 text-sm text-pequod-white cursor-pointer'
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
                <div className='mt-5 flex-1 h-0 overflow-y-auto'>
                  <nav className='px-2 space-y-1'>
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          item.current
                            ? 'bg-pequod-purple'
                            : 'hover:bg-pequod-pink',
                          'group flex items-center px-2 py-2 text-base font-medium rounded-md text-pequod-white'
                        )}
                      >
                        <item.icon
                          className='mr-4 flex-shrink-0 h-6 w-6 text-purple-300'
                          aria-hidden='true'
                        />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
            </Transition.Child>
            <div className='flex-shrink-0 w-14' aria-hidden='true'>
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className='hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0'>
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className='flex flex-col flex-grow pt-5 bg-pequod-gray border-r border-pequod-white overflow-y-auto'>
            <div className='flex items-center flex-shrink-0 px-4'>
              <img className='w-full' src={logo} alt='Pequod logo' />
            </div>
            <div className='sticky top-0 z-10 flex-shrink-0 flex h-20 flex-col justify-center items-center'>
              <div className='flex-1 flex justify-center items-center'>
                <div className='flex items-center'>
                  {/* Profile dropdown */}
                  <Menu as='div' className='relative'>
                    <div>
                      <Menu.Button className='max-w-xs flex items-center border b-2  text-sm rounded-full bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pequod-purple'>
                        <span className='sr-only'>Open user menu</span>
                        <span className='inline-flex items-center px-5 py-1 text-base font-medium rounded-full shadow-sm text-pequod-white bg-transparent hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pequod-purple'>
                          {account?.slice(0, 6) + '...' + account?.slice(37)}
                        </span>
                        <DocumentDuplicateIcon
                          className='mr-3 flex-shrink-0 h-6 w-6 text-white'
                          aria-hidden='true'
                          onClick={(e) => copyToClipboard(e)}
                        />
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
                      <Menu.Items className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-pequod-dark ring-1 ring-pequod-dark ring-opacity-5 focus:outline-none'>
                        <Menu.Item onClick={logout}>
                          {({ active }) => (
                            <span
                              className={classNames(
                                active ? 'bg-pequod-dark' : '',
                                'flex items-center px-4 py-2 text-sm text-pequod-white cursor-pointer'
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
              <span className='flex flex-row text-white'>
                <img alt='logo wot' src={wotLogo} className='mr-2' width='20' />
                {userWotBalance}
              </span>
            </div>

            <div className='mt-5 flex-1 flex flex-col'>
              <nav className='flex-1 space-y-1'>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-pequod-white-300 border-l-4 border-pequod-pink'
                        : 'hover:bg-pequod-purple pl-3',
                      'group flex items-center px-2 py-3 text-sm font-medium justify-center text-pequod-white'
                    )}
                  >
                    <item.icon
                      className='mr-3 flex-shrink-0 h-6 w-6 text-pequod-pink'
                      aria-hidden='true'
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
        <div className='md:pl-64 flex flex-col flex-1'>
          <div className='sticky top-0 z-10 flex-shrink-0 flex h-16 md:hidden '>
            <button
              type='button'
              className='px-4 text-pequod-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pequod-purple md:hidden'
              onClick={() => setSidebarOpen(true)}
            >
              <span className='sr-only'>Open sidebar</span>
              <MenuAlt2Icon className='h-6 w-6' aria-hidden='true' />
            </button>
            <div className='flex-1 px-4 flex justify-between'>
              <div className='ml-4 flex items-center md:ml-6'>
                {/* Profile dropdown */}
                <Menu as='div' className='ml-3 relative'>
                  <Transition
                    as={Fragment}
                    enter='transition ease-out duration-100'
                    enterFrom='transform opacity-0 scale-95'
                    enterTo='transform opacity-100 scale-100'
                    leave='transition ease-in duration-75'
                    leaveFrom='transform opacity-100 scale-100'
                    leaveTo='transform opacity-0 scale-95'
                  >
                    <Menu.Items className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-pequod-dark ring-1 ring-black ring-opacity-5 focus:outline-none'>
                      <Menu.Item onClick={logout}>
                        {({ active }) => (
                          <span
                            className={classNames(
                              active ? 'bg-pequod-gray' : '',
                              'flex items-center px-4 py-2 text-sm text-pequod-white cursor-pointer'
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
          <main>
            <div className='py-6'>
              <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8'>
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
