import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';
import {
  WalletConnectConnector,
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
} from '@web3-react/walletconnect-connector';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  connectorLocalStorageKey,
  ConnectorNames,
  connectorsByName,
} from '../utils/connectors';
import { setupNetwork } from '../utils/wallet';

const useAuth = () => {
  const { activate, deactivate } = useWeb3React();

  const login = useCallback(
    async (connectorID: ConnectorNames) => {
      const connector = connectorsByName[connectorID];
      if (connector) {
        await activate(connector, async (error: Error) => {
          if (error instanceof UnsupportedChainIdError) {
            const hasSetup = await setupNetwork();
            if (hasSetup) {
              await activate(connector);
            }
          } else {
            window.localStorage.removeItem(connectorLocalStorageKey);
            if (error instanceof NoEthereumProviderError) {
              toast.error('Provider Error\n No provider was found');
            } else if (
              error instanceof UserRejectedRequestErrorInjected ||
              error instanceof UserRejectedRequestErrorWalletConnect
            ) {
              if (connector instanceof WalletConnectConnector) {
                const walletConnector = connector as WalletConnectConnector;
                walletConnector.walletConnectProvider = null;
              }
              toast.error(
                'Authorization Error\n Please authorize to access your account'
              );
            } else {
              toast.error(`${error.name}\n ${error.message}`);
            }
          }
        });
      } else {
        toast.error('Unable to find connector, The connector config is wrong');
      }
    },
    [activate]
  );

  const logout = useCallback(() => {
    deactivate();
    // This localStorage key is set by @web3-react/walletconnect-connector
    if (localStorage.getItem('walletconnect')) {
      connectorsByName.walletconnect.close();
      connectorsByName.walletconnect.walletConnectProvider = null;
      localStorage.removeItem('walletconnect');
    }
    localStorage.removeItem(connectorLocalStorageKey);
  }, [deactivate]);

  return { login, logout };
};

export default useAuth;
