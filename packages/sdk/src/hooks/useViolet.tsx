import { useCallback, useEffect } from "react";
import { API_URL } from "../constants";
import { useModal } from "../stores/modals";

const useViolet = ({
  clientId,
  redirectUrl,
  address,
  chainId,
  apiUrl = API_URL,
}: {
  clientId: string;
  redirectUrl: string;
  address: string;
  chainId: number;
  apiUrl?: string;
}) => {
  const setOpenModal = useModal((state) => state.setOpenModal);

  const handlePostMessage = useCallback(
    async (event: MessageEvent) => {
      if (event.origin !== apiUrl) return;

      console.log(event.data);

      setOpenModal(null);
    },
    [apiUrl, setOpenModal]
  );

  useEffect(() => {
    window.addEventListener("message", handlePostMessage, false);

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

      url.searchParams.append("redirect_uri", redirectUrl);

      url.searchParams.append("client_id", clientId);

      setOpenModal({
        name: "AUTHORIZATION",
        metadata: {
          url: url.toString(),
        },
      });

      // if (typeof window !== "undefined") {
      //   window.location.href = url.toString();

      //   return;
      // }

      // throw new Error("WINDOW_NOT_AVAILABLE");
    },
    [address, apiUrl, chainId, clientId, redirectUrl, setOpenModal]
  );

  return { authorize };
};

export { useViolet };
