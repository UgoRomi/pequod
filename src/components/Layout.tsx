import { Fragment, useEffect, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  LogoutIcon,
  XIcon,
  DocumentDuplicateIcon,
  MenuAlt2Icon,
} from "@heroicons/react/outline";

import { useWeb3React } from "@web3-react/core";
import useAuth from "../hooks/useAuth";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import { classNames, useValidateSessionIfInvalid } from "../utils/utils";
import { ReactComponent as Logo } from "../images/logo.svg";
import logoPng from "../images/logo.png";
import { useAppSelector } from "../store/hooks";
import { selectUserSignedMessage } from "../store/userInfoSlice";
import Spinner from "./Spinner";
import { toast } from "react-toastify";
import "../override_toastify.css";

import swapIcon from "../images/swap.png";
import stakingIcon from "../images/stake.png";
import notificationIcon from "../images/notifications.png";
import launchpadIcon from "../images/launchpad.png";
import liquidityIcon from "../images/liquiditypool.png";
import aiIcon from "../images/ai.png";
import giveawayIcon from "../images/giveaway.png";
import airdropIcon from "../images/airdrop.png";
import swapArrowsIcon from "../images/swapArrows.svg";
export default function Layout({ children }: { children: JSX.Element }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { account } = useWeb3React();
  const { logout } = useAuth();
  const location = useLocation();
  const userSignedMessage = useAppSelector(selectUserSignedMessage);
  const validateSessionIfInvalid = useValidateSessionIfInvalid();
  const [signInProgress, setSignInProgress] = useState(false);

  const [navigation, setNavigation] = useState([
    {
      name: "Swap",
      href: "/",
      icon: swapIcon,
      current: false,
      disabled: false,
    },
    {
      name: "Staking",
      href: "/staking",
      icon: stakingIcon,
      current: false,
      disabled: false,
    },
    {
      name: "Notifications",
      href: "/notifications",
      icon: notificationIcon,
      current: false,
      disabled: true,
    },
    {
      name: "Launchpad",
      href: "/launchpad",
      icon: launchpadIcon,
      current: false,
      disabled: false,
    },
    {
      name: "Liquidity pool",
      href: "/liquidity",
      icon: liquidityIcon,
      current: false,
      disabled: true,
    },
    {
      name: "Achab Services (AI)",
      href: "/achabservices",
      icon: aiIcon,
      current: false,
      disabled: true,
    },
    {
      name: "Giveaways",
      href: "/giveaways",
      icon: giveawayIcon,
      current: false,
      disabled: true,
    },
    {
      name: "Airdrops",
      href: "/airdrops",
      icon: airdropIcon,
      current: false,
      disabled: true,
    },
    {
      name: "Migration",
      href: "/migration",
      icon: swapArrowsIcon,
      current: false,
      disabled: false,
    },
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
    const accountUser = account ? account : "";
    navigator.clipboard.writeText(accountUser);

    /* Alert the copied text */

    toast.success("Text copied");
  };

  return (
    <>
      <div className="min-h-full bg-pequod-dark">
        {!userSignedMessage && (
          <div className="fixed top-0 left-0 z-50 flex h-full w-full items-center justify-center bg-gray-800 bg-opacity-80">
            <button
              className="flex h-10 rounded-md bg-pequod-purple py-2 px-4 text-pequod-white disabled:cursor-default disabled:opacity-70"
              disabled={signInProgress}
              onClick={signMessage}
            >
              {signInProgress ? (
                <>
                  <Spinner className="h-5 text-pequod-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign the message"
              )}
            </button>
          </div>
        )}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-40 flex md:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="relative flex w-full max-w-xs flex-1 flex-col gap-6 bg-pequod-gray pt-5 pb-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="focus:outline-none ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex flex-shrink-0 items-center justify-center px-4">
                  <img src={logoPng} className="h-20" alt="Pequod Logo" />
                </div>
                <Menu as="div" className="flex w-full justify-center">
                  <div>
                    <Menu.Button className="b-2 focus:outline-none flex max-w-xs items-center rounded-full border bg-transparent text-sm focus:ring-2 focus:ring-pequod-purple focus:ring-offset-2">
                      <span className="sr-only">Open user menu</span>
                      <span className="focus:outline-none inline-flex items-center rounded-full bg-transparent px-5 py-1 text-base font-medium text-pequod-white shadow-sm hover:bg-transparent focus:ring-2 focus:ring-pequod-purple focus:ring-offset-2">
                        {account?.slice(0, 6) + "..." + account?.slice(37)}
                      </span>
                      <DocumentDuplicateIcon
                        className="mr-3 h-6 w-6 flex-shrink-0 text-white"
                        aria-hidden="true"
                        onClick={(e) => copyToClipboard(e)}
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="focus:outline-none absolute mt-10 w-48 origin-top-right rounded-md bg-pequod-dark py-1 shadow-lg ring-1 ring-pequod-dark ring-opacity-5">
                      <Menu.Item onClick={logout}>
                        {({ active }) => (
                          <span
                            className={classNames(
                              active ? "bg-pequod-dark" : "",
                              "flex cursor-pointer items-center px-4 py-2 text-sm text-pequod-white"
                            )}
                          >
                            <LogoutIcon
                              className="mr-2 h-5"
                              aria-hidden="true"
                            />
                            Disconnect
                          </span>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
                <div className="mt-5 h-0 flex-1 overflow-y-auto">
                  <nav className="space-y-1 px-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={(e) => {
                          if (item.disabled) e.preventDefault();
                        }}
                        className={classNames(
                          item.current
                            ? "border-l-4 border-pequod-pink bg-pequod-white-300 text-pequod-white"
                            : item.disabled
                            ? "cursor-default text-white opacity-60"
                            : "pl-3 text-pequod-white hover:bg-pequod-white-300",
                          "group flex items-center justify-center px-2 py-3 text-sm font-medium"
                        )}
                      >
                        <img
                          src={item.icon}
                          alt=""
                          className={classNames(
                            item.disabled
                              ? "cursor-default text-white opacity-60 grayscale filter"
                              : "text-pequod-pink",
                            "mr-3 h-6 w-6 flex-shrink-0"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
            </Transition.Child>
            <div className="w-14 flex-shrink-0" aria-hidden="true">
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex flex-grow flex-col overflow-y-auto border-r border-pequod-white bg-pequod-gray pt-5">
            <div className="flex flex-shrink-0 flex-col items-center justify-center px-4">
              <Logo className="mt-10 h-28 w-auto" />

              <p className="text-md mb-2 text-center text-pequod-white">
                BETA V 1.2.0
              </p>
            </div>
            <div className="sticky top-0 z-10 flex h-20 flex-shrink-0 flex-col items-center justify-center">
              <div className="flex flex-1 items-center justify-center">
                <div className="flex items-center">
                  {/* Profile dropdown */}
                  <Menu as="div" className="relative">
                    <div>
                      <Menu.Button className="b-2 focus:outline-none flex max-w-xs items-center  rounded-full border bg-transparent text-sm focus:ring-2 focus:ring-pequod-purple focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        <span className="focus:outline-none inline-flex items-center rounded-full bg-transparent px-5 py-1 text-base font-medium text-pequod-white shadow-sm hover:bg-transparent focus:ring-2 focus:ring-pequod-purple focus:ring-offset-2">
                          {account?.slice(0, 6) + "..." + account?.slice(37)}
                        </span>
                        <DocumentDuplicateIcon
                          className="mr-3 h-6 w-6 flex-shrink-0 text-white"
                          aria-hidden="true"
                          onClick={(e) => copyToClipboard(e)}
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="focus:outline-none absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-pequod-dark py-1 shadow-lg ring-1 ring-pequod-dark ring-opacity-5">
                        <Menu.Item onClick={logout}>
                          {({ active }) => (
                            <span
                              className={classNames(
                                active ? "bg-pequod-dark" : "",
                                "flex cursor-pointer items-center px-4 py-2 text-sm text-pequod-white"
                              )}
                            >
                              <LogoutIcon
                                className="mr-2 h-5"
                                aria-hidden="true"
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

            <div className="mt-5 flex flex-1 flex-col">
              <nav className="flex-1 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={(e) => {
                      if (item.disabled) e.preventDefault();
                    }}
                    className={classNames(
                      item.current
                        ? "border-l-4 border-pequod-pink bg-pequod-white-300 text-pequod-white"
                        : item.disabled
                        ? "cursor-default text-white opacity-60"
                        : "pl-3 text-pequod-white hover:bg-pequod-white-300",
                      "group flex items-center justify-center px-2 py-3 text-sm font-medium"
                    )}
                  >
                    <img
                      src={item.icon}
                      alt=""
                      className={classNames(
                        item.disabled
                          ? "cursor-default text-white opacity-60 grayscale filter"
                          : "text-pequod-pink",
                        "mr-3 h-6 w-6 flex-shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col md:pl-64">
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 md:hidden ">
            <button
              type="button"
              className="focus:outline-none px-4 text-pequod-white focus:ring-2 focus:ring-inset focus:ring-pequod-purple md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuAlt2Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex flex-1 justify-between px-4">
              <div className="ml-4 flex items-center md:ml-6">
                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="focus:outline-none absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-pequod-dark py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                      <Menu.Item onClick={logout}>
                        {({ active }) => (
                          <span
                            className={classNames(
                              active ? "bg-pequod-gray" : "",
                              "flex cursor-pointer items-center px-4 py-2 text-sm text-pequod-white"
                            )}
                          >
                            <LogoutIcon
                              className="mr-2 h-5"
                              aria-hidden="true"
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
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-2">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
