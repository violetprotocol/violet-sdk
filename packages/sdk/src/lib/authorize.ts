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

const VIOLET_CONTEXT = "violet_popup";

const generatePopup = ({
  url,
  options,
}: {
  url: string;
  options?: PopupOptions;
}) => {
  const popup = window.open(
    url,
    VIOLET_CONTEXT,
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

/**
 * Initiates the authorization process by either redirecting to the authorization URL
 * or opening it in a popup, depending on the provided options.
 * This function is only available in a browser environment.
 *
 * @async
 * @function authorize
 * @param {Object} options - The authorization parameters and options.
 * @param {string} options.state - An optional state parameter to maintain state between the request and callback.
 * @param {Object} options.transaction - Contains functionSignature, data, targetContract for the transaction.
 * @param {string} options.address - The address of the user.
 * @param {number} options.chainId - The chain ID for the transaction.
 * @param {string} options.clientId - The client ID for the application.
 * @param {string} options.redirectUrl - The URL to redirect to after authorization.
 * @param {string} [options.apiUrl=API_URL] - The URL of the API for authorization. Defaults to API_URL.
 * @param {Object} [options.options=DEFAULT_OPTIONS] - The options for the authorization request. Defaults to DEFAULT_OPTIONS.
 * @returns {Promise<AuthorizeResponse|void>} - A promise that resolves to an array with two elements. The first element is an object with `token` and `txId` if authorization was successful or `null` if not. The second element is an object with `code` and `txId` if there was an error or `null` if not. If the function is run outside of a browser environment, the function returns `undefined`.
 * @throws - If an unknown error occurs.
 */
const authorize = async ({
  state,
  transaction,
  address,
  chainId,
  clientId,
  redirectUrl,
  apiUrl = API_URL,
  options = DEFAULT_OPTIONS,
}: AuthorizeProps): Promise<AuthorizeResponse | void> => {
  if (typeof window === "undefined") {
    console.warn("AUTHORIZE_ONLY_AVAILABLE_IN_BROWSER");

    return;
  }

  const channel = new BroadcastChannel(VIOLET_AUTHORIZATION_CHANNEL);

  const url = buildAuthorizationUrl({
    state,
    transaction,
    address,
    chainId,
    clientId,
    redirectUrl,
    apiUrl,
  });

  if (options.mode === "popup") {
    const popup = generatePopup({
      url: url.toString(),
      options,
    });

    if (!popup) {
      console.warn("POPUP_NOT_AVAILABLE_FALLBACK_REDIRECT");

      handleRedirect({ url });

      return;
    }

    return new Promise((resolve, reject) => {
      const listener = (event: MessageEvent<AuthorizeVioletResponse>) => {
        popup.close();

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
    handleRedirect({ url });
  }
};

export type { AuthorizeProps };

export { authorize, mode };
