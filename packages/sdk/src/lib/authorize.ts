import { Signature, splitSignature } from "@ethersproject/bytes";
import {
  API_URL,
  AUTHORIZE_ENDPOINT,
  ETHEREUM_NAMESPACE,
  VIOLET_AUTHORIZATION_CHANNEL,
} from "../constants";
import { VioletConfigParams } from "../types";

const mode = {
  REDIRECT: "redirect",
  POPUP: "popup",
} as const;

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
    };

type EAT = {
  signature: Signature;
  expiry: number;
};

export type AuthorizeResponse = [
  { rawEAT: string; txId: string; eat: EAT } | null,
  { code: string; txId?: string } | null
];

const generatePopup = ({
  url,
  id,
  options,
}: {
  url: string;
  id: string;
  options?: PopupOptions;
}) => {
  const popup = window.open(
    url,
    id,
    `
          toolbar=no,
          location=no,
          directories=no,
          status=no,
          menubar=no,
          scrollbars=no,
          resizable=no,
          copyhistory=no,
          width=600,
          height=800
          `
  );

  if (popup && options?.focus) popup.focus();

  return popup;
};

const handleRedirect = ({ url }: { url: string }) => {
  window.location.href = url;
};

const authorize = async ({
  state,
  transaction,
  address,
  chainId,
  clientId,
  redirectUrl,
  apiUrl = API_URL,
  options = {
    mode: "popup",
  },
}: AuthorizeProps): Promise<AuthorizeResponse | void> => {
  if (typeof window === "undefined") return;

  const url = new URL(AUTHORIZE_ENDPOINT, apiUrl);

  url.searchParams.append(
    "account_id",
    `${ETHEREUM_NAMESPACE}:${chainId}:${address}`
  );

  if (state) {
    url.searchParams.append("dapp_state", state);
  }

  url.searchParams.append("tx_target_contract", transaction.targetContract);

  url.searchParams.append(
    "tx_function_signature",
    transaction.functionSignature
  );

  url.searchParams.append("tx_data", transaction.data);

  url.searchParams.append("client_id", clientId);

  url.searchParams.append("redirect_uri", redirectUrl);

  const channel = new BroadcastChannel(VIOLET_AUTHORIZATION_CHANNEL);

  if (options.mode === "popup") {
    const popup = generatePopup({
      url: url.toString(),
      id: crypto.randomUUID(),
      options,
    });

    if (!popup) {
      console.error("POPUP_NOT_AVAILABLE");

      handleRedirect({ url: url.toString() });

      return;
    }

    return new Promise((resolve, reject) => {
      const listener = (event: MessageEvent<AuthorizeVioletResponse>) => {
        if (!event.isTrusted) {
          return resolve([null, { code: "EVENT_NOT_TRUSTED" }]);
        }

        if ("error_code" in event.data) {
          return resolve([
            null,
            {
              code: event.data.error_code.toUpperCase(),
              txId: event.data.tx_id,
            },
          ]);
        }

        if ("token" in event.data) {
          let eat = event.data.token;
          const parsedEAT = JSON.parse(atob(eat));

          if (!parsedEAT?.signature || !parsedEAT?.expiry) {
            return resolve([
              null,
              {
                code: "EAT_PARSING_FAILED",
                txId: event.data.tx_id,
              },
            ]);
          }

          const signature = splitSignature(parsedEAT.signature);

          return resolve([
            {
              rawEAT: event.data.token,
              txId: event.data.tx_id,
              eat: { signature, expiry: parsedEAT.expiry },
            },
            null,
          ]);
        }

        return reject(new Error("UNKNOWN_ERROR"));
      };

      channel.addEventListener("message", listener, {
        once: true,
      });
    });
  }

  if (options.mode === "redirect") {
    handleRedirect({ url: url.toString() });
  }
};

export type { AuthorizeProps };

export { authorize };