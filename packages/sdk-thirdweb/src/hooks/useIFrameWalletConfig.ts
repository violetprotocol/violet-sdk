import { useEffect, useRef } from "react";
import { useIFrameTransport, IFrameMessageKind } from "@violetprotocol/sdk";
import { providers } from "ethers";
import {
  AbstractClientWallet,
  Connector,
  WagmiAdapter,
  AsyncStorage,
} from "@thirdweb-dev/wallets";
import { InjectedConnector } from "@thirdweb-dev/wallets/evm/connectors/injected";
import { WalletConfig } from "@thirdweb-dev/react";
import { Ethereum } from "@thirdweb-dev/wallets/dist/declarations/src/evm/connectors/injected/types";

type IFrameWalletConfig = {
  request: providers.JsonRpcFetchFunc;
};

type IFrameWalletOptions = {
  request: providers.JsonRpcFetchFunc;
};

const iframeWallet = (
  options: IFrameWalletConfig
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
      return new IFrameWallet(id, { ...walletOptions, ...options });
    },

    isInstalled() {
      return true;
    },
  };
};

class IFrameWallet extends AbstractClientWallet<IFrameWalletOptions> {
  async getConnector(): Promise<Connector> {
    if (!this.options) throw new Error("OPTIONS_REQUEST_NOT_AVAILABLE");

    return createConnector(this.options.request, this.walletStorage);
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
          request: ({ method, params }: any) => {
            return request(method, params);
          },
        } as unknown as Ethereum;
      },
    },
  });

  const adapter = new WagmiAdapter(connector);

  return adapter;
};

const useIFrameWalletConfig = () => {
  const sourceRef = useRef<Window | null>(null);
  const targetRef = useRef<Window | null>(null);

  useEffect(() => {
    sourceRef.current = window;
    targetRef.current = window.parent;
  }, []);

  const transportRef = useIFrameTransport({
    requestExecutor() {
      return Promise.resolve(true);
    },

    sourceRef,
    targetRef,
  });

  const request = async (method: string, params?: any[]) => {
    if (!transportRef.current) throw new Error("TRANSPORT_REF_NOT_AVAILABLE");

    try {
      const executedRequest = await transportRef.current.executeRequest({
        id: crypto.randomUUID(),
        kind: IFrameMessageKind.Request,
        data: {
          method,
          params,
        },
      });

      if (executedRequest.failure) {
        const { error } = executedRequest;

        console.log(`[CHILD WALLET RESPONSE] Failure: `, error);

        throw error;
      }

      if (executedRequest.success) {
        const response = executedRequest.data;

        console.log(`[CHILD WALLET RESPONSE] Success: `, {
          method,
          params,
        });

        return response;
      }
    } catch (error) {
      console.log(`[CHILD WALLET RESPONSE] Failure: `, error);

      throw error;
    }
  };

  return () =>
    iframeWallet({
      request,
    });
};

export { useIFrameWalletConfig };
