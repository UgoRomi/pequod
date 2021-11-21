import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

export const injectedConnector = new InjectedConnector({
  supportedChainIds: [56],
});
export const walletConnectConnector = new WalletConnectConnector({
  rpc: { 56: 'https://bsc-dataseed.binance.org/' },
  qrcode: true,
});
