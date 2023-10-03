import {
  AuthorizePartialProps,
  ConfiguredAuthorize,
  ConfiguredEnroll,
  EnrollmentPartialProps,
  VioletConfigParams,
} from "@/types";
import { API_URL } from "@/constants";

import { authorize } from "@/lib/authorize";
import { enroll } from "@/lib/enroll";
import { isEnrolled } from "@/lib/isEnrolled";

const createVioletClient = ({
  clientId,
  redirectUrl,
  apiUrl = API_URL,
}: VioletConfigParams): {
  authorize: ConfiguredAuthorize;
  enroll: ConfiguredEnroll;
  isEnrolled: (address: string) => Promise<boolean>;
  config: VioletConfigParams;
} => {
  const client = {
    authorize: async (authorizePartialProps: AuthorizePartialProps) =>
      authorize({ clientId, redirectUrl, apiUrl, ...authorizePartialProps }),
    enroll: async (enrollmentPartialProps: EnrollmentPartialProps) =>
      enroll({ clientId, redirectUrl, apiUrl, ...enrollmentPartialProps }),
    isEnrolled: async (address: string) =>
      isEnrolled({
        address,
        apiUrl,
      }),
    config: {
      clientId,
      redirectUrl,
      apiUrl,
    },
  };

  return client;
};

export { createVioletClient };
