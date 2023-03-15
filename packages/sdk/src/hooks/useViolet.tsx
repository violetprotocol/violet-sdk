import {
  API_URL,
  AUTHORIZE_ENDPOINT,
  ETHEREUM_NAMESPACE,
  VIOLET_AUTHORIZATION_CHANNEL,
} from "../constants";

const mode = {
  REDIRECT: "redirect",
  POPUP: "popup",
} as const;

type BaseProps = {
  clientId: string;
  redirectUrl: string;
  apiUrl?: string;
};

type RedirectOptions = {
  mode: typeof mode.REDIRECT;
};

type RedirectProps = BaseProps & {
  options?: RedirectOptions;
};

type PopupOptions = {
  mode: typeof mode.POPUP;
  focus?: boolean;
};

type PopupProps = BaseProps & {
  options?: PopupOptions;
};

type Props = RedirectProps | PopupProps;

type AuthorizeProps = {
  address: string;
  chainId: number;
  transaction: {
    functionSignature: string;
    data: string;
    targetContract: string;
  };
  state?: string;
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

type AuthorizeResponse = [
  { token: string; txId: string } | null,
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

const useViolet = ({
  clientId,
  redirectUrl,
  apiUrl = API_URL,
  options = {
    mode: "popup",
  },
}: Props) => {
  const authorize = async ({
    state,
    transaction,
    address,
    chainId,
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
            return resolve([
              { token: event.data.token, txId: event.data.tx_id },
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

  return { authorize };
};

export { useViolet };
