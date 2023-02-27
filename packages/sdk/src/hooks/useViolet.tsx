import { API_URL, VIOLET_AUTHORIZE_KEY } from "../constants";

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

    const parsedApiUrl = new URL(apiUrl);

    const url = new URL(`${parsedApiUrl.toString()}api/authz/authorize`);

    url.searchParams.append("account_id", `eip155:${chainId}:${address}`);

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

      return new Promise((resolve) => {
        const interval = setInterval(() => {
          window.addEventListener(
            "storage",
            (event) => {
              if (event.key !== VIOLET_AUTHORIZE_KEY) return;

              clearInterval(interval);

              if (!event.isTrusted) {
                return resolve([null, { code: "EVENT_NOT_TRUSTED" }]);
              }

              const raw = event.newValue;

              localStorage.removeItem(VIOLET_AUTHORIZE_KEY);

              if (!raw) {
                return resolve([null, { code: "SOMETHING_WENT_WRONG" }]);
              }

              const violet = JSON.parse(raw) as AuthorizeVioletResponse;

              if ("error_code" in violet) {
                return resolve([
                  null,
                  {
                    code: violet.error_code.toUpperCase(),
                    txId: violet.tx_id,
                  },
                ]);
              }

              return resolve([
                { token: violet.token, txId: violet.tx_id },
                null,
              ]);
            },
            { once: true }
          );
        }, 200);
      });
    }

    if (options.mode === "redirect") {
      handleRedirect({ url: url.toString() });
    }
  };

  return { authorize };
};

export { useViolet };
