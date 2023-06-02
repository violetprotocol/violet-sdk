import { AUTHORIZE_ENDPOINT, ETHEREUM_NAMESPACE } from "../constants";

const buildAuthorizationUrl = ({
  state,
  transaction,
  address,
  chainId,
  clientId,
  redirectUrl,
  apiUrl,
}: {
  state?: string;
  transaction: {
    functionSignature: string;
    data: string;
    targetContract: string;
  };
  address: string;
  chainId: number;
  clientId: string;
  redirectUrl: string;
  apiUrl: string;
}) => {
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

  return url.toString();
};

export { buildAuthorizationUrl };
