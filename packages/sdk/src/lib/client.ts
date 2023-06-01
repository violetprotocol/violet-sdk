import { VioletConfigParams } from "../types";
import {
  AuthorizeProps,
  AuthorizeResponse,
  authorize as authorizeTx,
} from "./authorize";

type AuthorizePartialProps = Omit<
  AuthorizeProps,
  "clientId" | "redirectUrl" | "apiUrl"
>;

type ConfiguredAuthorize = (
  authorizePartialProps: AuthorizePartialProps
) => Promise<AuthorizeResponse | void>;

const createVioletClient = ({
  clientId,
  redirectUrl,
  apiUrl,
}: VioletConfigParams): { authorize: ConfiguredAuthorize } => {
  const authorize = async (authorizePartialProps: AuthorizePartialProps) =>
    authorizeTx({ ...authorizePartialProps, clientId, redirectUrl, apiUrl });

  return { authorize };
};

export { createVioletClient };
