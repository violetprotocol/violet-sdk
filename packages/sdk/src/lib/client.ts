import {
  AuthorizePartialProps,
  ConfiguredAuthorize,
  VioletConfigParams,
} from "../types";
import { authorize } from "./authorize";
import { isRegisteredWithViolet } from "./IsRegisteredWithViolet";
import { API_URL } from "..";

const createVioletClient = ({
  clientId,
  redirectUrl,
  apiUrl = API_URL,
}: VioletConfigParams): {
  authorize: ConfiguredAuthorize;
  IsRegisteredWithViolet: (address: string) => Promise<boolean>;
} => {
  const configuredAuthorize = async (
    authorizePartialProps: AuthorizePartialProps
  ) => authorize({ clientId, redirectUrl, apiUrl, ...authorizePartialProps });

  const configuredIsRegisteredWithViolet = async (address: string) =>
    isRegisteredWithViolet({
      address,
      apiUrl,
    });

  return {
    authorize: configuredAuthorize,
    IsRegisteredWithViolet: configuredIsRegisteredWithViolet,
  };
};

export { createVioletClient };
