import { providers } from "ethers";
import { AbstractClientWallet, Connector, WagmiAdapter, AsyncStorage } from "@thirdweb-dev/wallets";
import { InjectedConnector } from "@thirdweb-dev/wallets/evm/connectors/injected";
import { WalletConfig } from "@thirdweb-dev/react";
import { useEffect, useRef } from "react";
import { IFrameMessageKind, getUniqueId } from "../utils/iframeTransport";
import { useIFrameTransport } from "./useIFrameTransport";

export function useThirdwebIFrameWalletConfig() {
  const sourceRef = useRef<any>();
  const targetRef = useRef<any>();

  useEffect(() => {
    sourceRef.current = window;
    targetRef.current = window.parent;
  }, []);

  const transportRef = useIFrameTransport({
    requestExecutor(request) {
      console.log(`[useIFrameWalletConfig.requestExecutor]: `, request);
      return Promise.resolve(true);
    },
    sourceRef,
    targetRef,
  });

  const request = (data: RequestProps): Promise<any> => {
    console.log(`[useIFrameWalletConfig.request]: `, data);
    return transportRef!.current!.executeRequest({
      id: getUniqueId(),
      kind: IFrameMessageKind.Request,
      data,
    }).then((data) => {
      if (data.success) {
        data = data.data;
        console.log(`[CHILD WALLET RESPONSE] Success: `, data);
        return data;
      } else if (data.failure) {
        const error = data.error;
        console.log(`[CHILD WALLET RESPONSE] Failure: `, error);
        throw error;
      }
    }).catch((error) => {
      console.log(`[CHILD WALLET RESPONSE] Failure: `, error);
      throw error;
    });
  };

  return () => iframeWallet({
    request: (method, params) => request({ method, params }),
  });
}

interface IFrameWalletConfig {
  request: providers.JsonRpcFetchFunc;
}

function iframeWallet(options?: IFrameWalletConfig): WalletConfig<IFrameWallet> {
  const id = "iframe-wallet";

  return {
    id,
    meta: {
      name: "IFrame Wallet",
      // @TODO: This URL is for demo purpose only. DON'T use in production.
      iconURL: "https://cdn0.iconfinder.com/data/icons/finance-development/512/CEO-22-512.png",
    },

    create(walletOptions) {
      return new IFrameWallet(id, { ...walletOptions, ...options, } as any)
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

function createConnector(request: providers.JsonRpcFetchFunc, connectorStorage: AsyncStorage): Connector {
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
    }
  });
  const adapter = new WagmiAdapter(connector);
  return adapter;
}
