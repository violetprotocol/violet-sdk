import {
  AuthorizePartialProps,
  ConfiguredAuthorize,
  VioletConfigParams,
} from "../types";
import { authorize } from "./authorize";

const createVioletClient = ({
  clientId,
  redirectUrl,
  apiUrl,
}: VioletConfigParams): { authorize: ConfiguredAuthorize } => {
  const configuredAuthorize = async (
    authorizePartialProps: AuthorizePartialProps
  ) => authorize({ clientId, redirectUrl, apiUrl, ...authorizePartialProps });

  return { authorize: configuredAuthorize };
};

export { createVioletClient };
