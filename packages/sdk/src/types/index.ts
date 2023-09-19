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
  apiUrl: string;
} & {
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
    };

type EAT = {
  signature: Signature;
  expiry: number;
};

type AuthorizeResponse = [
  { rawEAT: string; txId: string; eat: EAT } | null,
  { code: string; txId?: string } | null,
];

type AuthorizePartialProps = Omit<
  AuthorizeProps,
  "clientId" | "redirectUrl" | "apiUrl"
>;

type ConfiguredAuthorize = (
  authorizePartialProps: AuthorizePartialProps
) => Promise<AuthorizeResponse | void>;

enum AuthorizationEvent {
  INACTIVE = "INACTIVE",
  LISTENING = "LISTENING",
  ERROR = "ERROR",
  COMPLETED = "COMPLETED",
}

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

export { AuthorizationEvent };
