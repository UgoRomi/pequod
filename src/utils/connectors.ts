import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

const injected = new InjectedConnector({
  supportedChainIds: [parseInt(process.env.REACT_APP_CHAIN_ID as string)],
});
const walletconnect = new WalletConnectConnector({
  rpc: {
    [parseInt(process.env.REACT_APP_CHAIN_ID as string)]: process.env
      .REACT_APP_CHAIN_RPC_URL as string,
  },
  qrcode: true,
});

export enum ConnectorNames {
  Injected = "injected",
  WalletConnect = "walletconnect",
}

export interface Config {
  title: string;
  connectorId: ConnectorNames;
  priority: number;
}

export const connectors: Config[] = [
  {
    title: "Metamask",
    connectorId: ConnectorNames.Injected,
    priority: 1,
  },
  {
    title: "WalletConnect",
    connectorId: ConnectorNames.WalletConnect,
    priority: 2,
  },
];

export const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.WalletConnect]: walletconnect,
};

export const connectorLocalStorageKey = "connectorId";
