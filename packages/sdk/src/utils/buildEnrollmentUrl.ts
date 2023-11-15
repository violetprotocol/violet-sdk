import { ENROLL_ENDPOINT, ETHEREUM_NAMESPACE } from "../constants";

const buildEnrollmentUrl = ({
  address,
  chainId,
  clientId,
  redirectUrl,
  apiUrl,
}: {
  state?: string;
  address: string;
  chainId: number;
  clientId: string;
  redirectUrl: string;
  apiUrl: string;
}) => {
  const url = new URL(ENROLL_ENDPOINT, apiUrl);

  url.searchParams.append(
    "account_id",
    `${ETHEREUM_NAMESPACE}:${chainId}:${address}`
  );

  url.searchParams.append("chain_id", chainId.toString());

  url.searchParams.append("client_id", clientId);

  url.searchParams.append("redirect_uri", redirectUrl);

  return url.toString();
};

export { buildEnrollmentUrl };
