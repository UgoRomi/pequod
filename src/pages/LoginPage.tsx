import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ReactComponent as MetamaskStackedLogo } from '../images/metamask-logo-stacked.svg';
import { ReactComponent as WalletConnectLogo } from '../images/walletconnect-logo.svg';
import { injectedConnector, walletConnectConnector } from '../utils/connectors';

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activate } = useWeb3React();

  const from = location.state?.from?.pathname || '/';

  const connectToWallet = async (
    provider: InjectedConnector | WalletConnectConnector
  ) => {
    try {
      await activate(provider);
      navigate(from, { replace: true });
    } catch (error) {
      toast.error('Error connecting to the wallet');
    }
  };

  return (
    <div className='h-full flex flex-col justify-center items-center px-4 sm:px-0'>
      <div className='w-full sm:mx-auto sm:w-full sm:max-w-md bg-gray-100 rounded-md shadow-lg'>
        <h1 className='text-pink-400 text-5xl text-center p-5 font-bold'>
          Pequod
        </h1>
        <p className='text-gray-800 text-xl font-semibold text-center'>
          Connect your wallet
        </p>
        <div className='py-8 px-4 sm:rounded-lg sm:px-10 flex flex-col gap-5'>
          <div
            className='pb-3 rounded-md bg-gray-200 flex flex-col items-center cursor-pointer'
            onClick={() => connectToWallet(injectedConnector)}
          >
            <MetamaskStackedLogo className='h-28 mx-auto' />
            <span className='font-semibold text-pink-500'>
              Connect using metamask
            </span>
          </div>
          <div
            className='pb-3 pt-6 rounded-md bg-gray-200 flex flex-col items-center cursor-pointer'
            onClick={() => connectToWallet(walletConnectConnector)}
          >
            <WalletConnectLogo className='h-16 mx-auto mb-6' />
            <span className='font-semibold text-pink-500'>
              Connect using WalletConnect
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
