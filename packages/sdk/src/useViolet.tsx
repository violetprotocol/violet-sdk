import { useNetwork, useAccount } from "wagmi";
import { API_URL } from "./constants";

const useViolet = ({
  clientId,
  redirectUrl,
  apiUrl = API_URL,
}: {
  clientId: string;
  redirectUrl: string;
  apiUrl?: string;
}) => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const authorize = async ({
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
    if (!chain) {
      throw new Error("NO_CHAIN_SELECTED");
    }

    if (typeof window === "undefined") {
      throw new Error("WINDOW_NOT_AVAILABLE");
    }

    const parsedApiUrl = new URL(apiUrl);

    const url = new URL(`${parsedApiUrl.toString()}api/authz/authorize`);

    url.searchParams.append("account_id", `eip155:${chain.id}:${address}`);

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

    if (typeof window !== "undefined") {
      window.location.href = url.toString();

      return;
    }

    throw new Error("WINDOW_NOT_AVAILABLE");
  };

  return { authorize };
};

export { useViolet };
