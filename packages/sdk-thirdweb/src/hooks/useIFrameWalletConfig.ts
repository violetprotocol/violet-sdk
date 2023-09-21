import { providers } from "ethers";
import {
  AbstractClientWallet,
  Connector,
  WagmiAdapter,
  AsyncStorage,
} from "@thirdweb-dev/wallets";
import { InjectedConnector } from "@thirdweb-dev/wallets/evm/connectors/injected";
import { WalletConfig } from "@thirdweb-dev/react";
import { useEffect, useRef } from "react";
import { useIFrameTransport, IFrameMessageKind } from "@violetprotocol/sdk";

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

  const request = async (data: RequestProps) => {
    try {
      const executedRequest = await transportRef.current!.executeRequest({
        id: crypto.randomUUID(),
        kind: IFrameMessageKind.Request,
        data,
      });

      if (executedRequest.failure) {
        const { error } = executedRequest;

        console.log(`[CHILD WALLET RESPONSE] Failure: `, error);

        throw error;
      }

      if (executedRequest.success) {
        const response = executedRequest.data;

        console.log(`[CHILD WALLET RESPONSE] Success: `, data);

        return response;
      }
    } catch (error) {
      console.log(`[CHILD WALLET RESPONSE] Failure: `, error);

      throw error;
    }
  };

  return () =>
    iframeWallet({
      request: (method, params) => request({ method, params }),
    });
};

interface IFrameWalletConfig {
  request: providers.JsonRpcFetchFunc;
}

function iframeWallet(
  options?: IFrameWalletConfig
): WalletConfig<IFrameWallet> {
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
}

interface RequestProps {
  method: any;
  params: any;
}

interface IFrameWalletOptions {
  request: providers.JsonRpcFetchFunc;
}

class IFrameWallet extends AbstractClientWallet<IFrameWalletOptions> {
  async getConnector(): Promise<Connector> {
    return createConnector(this.options!.request, this.walletStorage);
  }
}

function createConnector(
  request: providers.JsonRpcFetchFunc,
  connectorStorage: AsyncStorage
): Connector {
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
}

export { useIFrameWalletConfig };
