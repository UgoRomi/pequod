import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

const injected = new InjectedConnector({
  supportedChainIds: [56],
});
const walletconnect = new WalletConnectConnector({
  rpc: {
    1: 'https://mainnet.infura.io/v3/23ae9a2ce21a42c78bc008b128f36aa0',
    56: 'https://bsc-dataseed.binance.org/',
  },
  qrcode: true,
});

export enum ConnectorNames {
  Injected = 'injected',
  WalletConnect = 'walletconnect',
}

export interface Config {
  title: string;
  connectorId: ConnectorNames;
  priority: number;
}

export const connectors: Config[] = [
  {
    title: 'Metamask',
    connectorId: ConnectorNames.Injected,
    priority: 1,
  },
  {
    title: 'WalletConnect',
    connectorId: ConnectorNames.WalletConnect,
    priority: 2,
  },
];

export const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.WalletConnect]: walletconnect,
};

export const connectorLocalStorageKey = 'connectorId';
