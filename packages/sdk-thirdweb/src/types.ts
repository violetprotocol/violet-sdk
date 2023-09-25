import { providers } from "ethers";

type IFrameWalletConfig = {
  request: providers.JsonRpcFetchFunc;
};

type RequestProps = {
  method: string;
  params?: any[];
};

type IFrameWalletOptions = {
  request: providers.JsonRpcFetchFunc;
};

export type { IFrameWalletConfig, RequestProps, IFrameWalletOptions };
