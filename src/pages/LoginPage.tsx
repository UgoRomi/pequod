import {useLocation, useNavigate} from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import {ReactComponent as MetamaskStackedLogo} from '../images/metamask-logo-stacked.svg';
import {ReactComponent as WalletConnectLogo} from '../images/walletconnect-logo.svg';
import {connectorLocalStorageKey, ConnectorNames} from '../utils/connectors';
import {ReactComponent as Logo} from '../images/logo.svg';

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {login} = useAuth();

  const from = location.state?.from?.pathname || '/';

  const connectToWallet = async (connectorId: ConnectorNames) => {
    await login(connectorId);
    localStorage.setItem(connectorLocalStorageKey, connectorId);

    navigate(from, {replace: true});
  };

  return (
    <div className="flex h-full flex-col items-center justify-center bg-pequod-dark px-4 sm:px-0">
      <div className="w-full rounded-md bg-pequod-gray shadow-lg sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex w-full items-center flex-col justify-center py-4">
          <Logo className="flex-shrink-0" />
          <p className="text-center text-md text-pequod-white mb-2">
            BETA V 1.1.0
          </p>
        </div>
        <p className="text-center text-xl font-semibold text-pequod-white">
          Connect your wallet
        </p>
        <div className="flex flex-col gap-5 py-8 px-4 sm:rounded-lg sm:px-10">
          <div
            className="flex cursor-pointer flex-col items-center rounded-md bg-gray-200 pb-3"
            onClick={() => connectToWallet(ConnectorNames.Injected)}
          >
            <MetamaskStackedLogo className="mx-auto h-28" />
            <span className="font-semibold text-pequod-gray">
              Connect using metamask
            </span>
          </div>
          <div
            className="flex cursor-pointer flex-col items-center rounded-md bg-gray-200 pb-3 pt-6"
            onClick={() => connectToWallet(ConnectorNames.WalletConnect)}
          >
            <WalletConnectLogo className="mx-auto mb-6 h-16" />
            <span className="font-semibold text-pequod-gray">
              Connect using WalletConnect
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
