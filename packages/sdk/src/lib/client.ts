import {
  AuthorizePartialProps,
  ConfiguredAuthorize,
  ConfiguredEnroll,
  EnrollmentPartialProps,
  VioletConfigParams,
} from "../types";
import { authorize } from "./authorize";
import { enroll } from "./enroll";
import { isEnrolled } from "./isEnrolled";
import { API_URL } from "..";

const createVioletClient = ({
  clientId,
  redirectUrl,
  apiUrl = API_URL,
}: VioletConfigParams): {
  authorize: ConfiguredAuthorize;
  enroll: ConfiguredEnroll;
  IsRegisteredWithViolet: (address: string) => Promise<boolean>;
} => {
  const configuredAuthorize = async (
    authorizePartialProps: AuthorizePartialProps
  ) => authorize({ clientId, redirectUrl, apiUrl, ...authorizePartialProps });

  const configuredEnroll = async (
    enrollmentPartialProps: EnrollmentPartialProps
  ) => enroll({ clientId, redirectUrl, apiUrl, ...enrollmentPartialProps });

  const configuredIsRegisteredWithViolet = async (address: string) =>
    isEnrolled({
      address,
      apiUrl,
    });

  return {
    authorize: configuredAuthorize,
    enroll: configuredEnroll,
    IsRegisteredWithViolet: configuredIsRegisteredWithViolet,
  };
};

export { createVioletClient };
