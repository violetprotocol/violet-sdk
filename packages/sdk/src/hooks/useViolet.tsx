import { useCallback, useEffect } from "react";
import { API_URL, VIOLET_CALLBACK_URL } from "../constants";

const generatePopup = ({ url, id }: { url: string; id: string }) => {
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

  if (popup) popup.focus();

  return popup;
};

const useViolet = ({
  clientId,
  redirectUrl,
  address,
  chainId,
  apiUrl = API_URL,
}: {
  clientId: string;
  redirectUrl?: string;
  address: string;
  chainId: number;
  apiUrl?: string;
}) => {
  const handlePostMessage = useCallback(
    async ({ origin, data }: MessageEvent<any>) => {
      if (origin !== new URL(apiUrl).origin) return;

      console.log(data);
    },
    []
  );

  useEffect(() => {
    window.addEventListener("message", handlePostMessage);

    return () => {
      window.removeEventListener("message", handlePostMessage);
    };
  }, [handlePostMessage]);

  const authorize = useCallback(
    async ({
      state,
      transaction,
    }: {
      state?: string;
      transaction: {
        functionSignature: string;
        data: string;
        targetContract: string;
      };
    }) => {
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

      if (redirectUrl) {
        url.searchParams.append("redirect_uri", redirectUrl);
      } else {
        url.searchParams.append("redirect_uri", VIOLET_CALLBACK_URL);
      }

      url.searchParams.append("client_id", clientId);

      const popup = generatePopup({
        url: url.toString(),
        id: crypto.randomUUID(),
      });

      if (!popup) throw new Error("POPUP_NOT_AVAILABLE");
    },
    [address, apiUrl, chainId, clientId, redirectUrl]
  );

  return { authorize };
};

export { useViolet };
