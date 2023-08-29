import { Signature } from "@ethersproject/bytes";
import { mode } from "../lib";

type VioletConfigParams = {
  clientId: string;
  redirectUrl: string;
  apiUrl?: string;
};

type RedirectOptions = {
  mode: typeof mode.REDIRECT;
};

type PopupOptions = {
  mode: typeof mode.POPUP;
  focus?: boolean;
};

type AuthorizeProps = VioletConfigParams & {
  address: string;
  chainId: number;
  transaction: {
    functionSignature: string;
    data: string;
    targetContract: string;
  };
  state?: string;
  options?: RedirectOptions | PopupOptions;
};

type AuthorizeVioletResponse =
  | {
      token: string;
      tx_id: string;
    }
  | {
      error_code: string;
      tx_id: string;
    }
  | {
      pending_state: string;
      tx_id: string;
    };

type EAT = {
  signature: Signature;
  expiry: number;
};

type SuccessResponse = { rawEAT: string; txId: string; eat: EAT };

type ErrorResponse = { code: string; txId?: string };

type PendingResponse = { code: string; txId?: string };

type AuthorizeResponse = [
  SuccessResponse | null,
  ErrorResponse | null,
  PendingResponse | null,
];

type AuthorizePartialProps = Omit<
  AuthorizeProps,
  "clientId" | "redirectUrl" | "apiUrl"
>;

type ConfiguredAuthorize = (
  authorizePartialProps: AuthorizePartialProps
) => Promise<AuthorizeResponse | void>;

export type {
  VioletConfigParams,
  AuthorizeProps,
  AuthorizeResponse,
  AuthorizeVioletResponse,
  EAT,
  RedirectOptions,
  PopupOptions,
  AuthorizePartialProps,
  ConfiguredAuthorize,
};
