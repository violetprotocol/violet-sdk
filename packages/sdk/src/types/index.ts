import type { Signature } from "@ethersproject/bytes";
import { mode } from "../lib";

type VioletConfigParams = {
  clientId: string;
  redirectUrl: string;
  apiUrl: string;
};

type RedirectOptions = {
  mode: typeof mode.REDIRECT;
};

type PopupOptions = {
  mode: typeof mode.POPUP;
  focus?: boolean;
};

type EnrollProps = VioletConfigParams & {
  address: string;
  chainId: number;
  options?: RedirectOptions | PopupOptions;
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

type EnrollmentResponse = [
  { txId: string } | null,
  { code: string; txId?: string } | null,
];

type AuthorizeResponse = [
  { rawEAT: string; txId: string; eat: EAT } | null,
  { code: string; txId?: string } | null,
];

type AuthorizePartialProps = Omit<
  AuthorizeProps,
  "clientId" | "redirectUrl" | "apiUrl"
>;

type EnrollmentPartialProps = Omit<
  EnrollProps,
  "clientId" | "redirectUrl" | "apiUrl"
>;

type ConfiguredAuthorize = (
  authorizePartialProps: AuthorizePartialProps,
) => Promise<AuthorizeResponse | void>;

type ConfiguredEnroll = (
  enrollmentPartialProps: EnrollmentPartialProps,
) => Promise<EnrollmentResponse | void>;

enum AuthorizationEvent {
  INACTIVE = "INACTIVE",
  LISTENING = "LISTENING",
  ERROR = "ERROR",
  COMPLETED = "COMPLETED",
}

export type {
  AuthorizePartialProps,
  AuthorizeProps,
  AuthorizeResponse,
  AuthorizeVioletResponse,
  ConfiguredAuthorize,
  ConfiguredEnroll,
  EAT,
  EnrollProps,
  EnrollmentPartialProps,
  EnrollmentResponse,
  PopupOptions,
  RedirectOptions,
  VioletConfigParams,
};

export { AuthorizationEvent };
