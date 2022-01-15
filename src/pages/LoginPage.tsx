import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ReactComponent as MetamaskStackedLogo } from '../images/metamask-logo-stacked.svg';
import { ReactComponent as WalletConnectLogo } from '../images/walletconnect-logo.svg';
import { connectorLocalStorageKey, ConnectorNames } from '../utils/connectors';
import { ReactComponent as Logo } from '../images/logo.svg';

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/';

  const connectToWallet = async (connectorId: ConnectorNames) => {
    await login(connectorId);
    localStorage.setItem(connectorLocalStorageKey, connectorId);

    navigate(from, { replace: true });
  };

  return (
    <div className='h-full flex flex-col justify-center items-center px-4 sm:px-0 bg-pequod-dark'>
      <div className='w-full sm:mx-auto sm:w-full sm:max-w-md bg-pequod-gray rounded-md shadow-lg'>
        <div className='flex justify-center items-center w-full py-4'>
          <Logo className='flex-shrink-0' />
        </div>
        <p className='text-pequod-white text-xl font-semibold text-center'>
          Connect your wallet
        </p>
        <div className='py-8 px-4 sm:rounded-lg sm:px-10 flex flex-col gap-5'>
          <div
            className='pb-3 rounded-md bg-gray-200 flex flex-col items-center cursor-pointer'
            onClick={() => connectToWallet(ConnectorNames.Injected)}
          >
            <MetamaskStackedLogo className='h-28 mx-auto' />
            <span className='font-semibold text-pequod-gray'>
              Connect using metamask
            </span>
          </div>
          <div
            className='pb-3 pt-6 rounded-md bg-gray-200 flex flex-col items-center cursor-pointer'
            onClick={() => connectToWallet(ConnectorNames.WalletConnect)}
          >
            <WalletConnectLogo className='h-16 mx-auto mb-6' />
            <span className='font-semibold text-pequod-gray'>
              Connect using WalletConnect
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
