import { providers } from "ethers";
import {
  AbstractClientWallet,
  Connector,
  WagmiAdapter,
  AsyncStorage,
} from "@thirdweb-dev/wallets";
import { InjectedConnector } from "@thirdweb-dev/wallets/evm/connectors/injected";
import { WalletConfig } from "@thirdweb-dev/react";
import { IFrameWalletConfig, IFrameWalletOptions } from "./types";

const iframeWallet = (
  options?: IFrameWalletConfig
): WalletConfig<IFrameWallet> => {
  const id = "iframe-wallet";

  return {
    id,
    meta: {
      name: "IFrame Wallet",
      // @TODO: This URL is for demo purpose only. DON'T use in production.
      iconURL:
        "https://cdn0.iconfinder.com/data/icons/finance-development/512/CEO-22-512.png",
    },

    create(walletOptions) {
      return new IFrameWallet(id, { ...walletOptions, ...options } as any);
    },

    isInstalled() {
      return true;
    },
  };
};

class IFrameWallet extends AbstractClientWallet<IFrameWalletOptions> {
  async getConnector(): Promise<Connector> {
    return createConnector(this.options!.request, this.walletStorage);
  }
}

const createConnector = (
  request: providers.JsonRpcFetchFunc,
  connectorStorage: AsyncStorage
): Connector => {
  const connector = new InjectedConnector({
    connectorStorage,
    options: {
      getProvider: () => {
        return {
          isMetaMask: false,
          _events: {},
          request: ({ method, params }: any) => {
            return request(method, params);
          },
        } as any; // HACK: Overwrite TypeScript's type checking
      },
    },
  });

  const adapter = new WagmiAdapter(connector);

  return adapter;
};

export { iframeWallet };
