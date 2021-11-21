import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ReactComponent as MetamaskStackedLogo } from '../images/metamask-logo-stacked.svg';
import { ReactComponent as WalletConnectLogo } from '../images/walletconnect-logo.svg';
import { connectorLocalStorageKey, ConnectorNames } from '../utils/connectors';

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/';

  const connectToWallet = async (connectorId: ConnectorNames) => {
    login(connectorId);
    localStorage.setItem(connectorLocalStorageKey, connectorId);

    navigate(from, { replace: true });
  };

  return (
    <div className='h-full flex flex-col justify-center items-center px-4 sm:px-0 bg-gray-600'>
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
            onClick={() => connectToWallet(ConnectorNames.Injected)}
          >
            <MetamaskStackedLogo className='h-28 mx-auto' />
            <span className='font-semibold text-pink-500'>
              Connect using metamask
            </span>
          </div>
          <div
            className='pb-3 pt-6 rounded-md bg-gray-200 flex flex-col items-center cursor-pointer'
            onClick={() => connectToWallet(ConnectorNames.WalletConnect)}
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
