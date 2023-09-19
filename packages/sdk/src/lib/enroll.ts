import { API_URL, VIOLET_AUTHORIZATION_CHANNEL } from "../constants";
import {
  EnrollmentResponse,
  AuthorizeVioletResponse,
  EnrollProps,
} from "../types";
import { buildEnrollmentUrl, generatePopup, handleRedirect } from "../utils";
import { mode } from "../utils/mode";

const VIOLET_CONTEXT = "violet_popup";

/**
 * Initiates the authorization process by either redirecting to the authorization URL
 * or opening it in a popup, depending on the provided options.
 * This function is only available in a browser environment.
 *
 * @async
 * @function enroll
 * @param {Object} options - The authorization parameters and options.
 * @param {string} options.address - The address of the user.
 * @param {number} options.chainId - The chain ID for the transaction.
 * @param {string} options.clientId - The client ID for the application.
 * @param {string} options.redirectUrl - The URL to redirect to after authorization and associated with the client ID. * @param {string} [options.apiUrl=API_URL] - The URL of the API for authorization. Defaults to API_URL.
 * @param {Object} [options.options=DEFAULT_OPTIONS] - The options for the authorization request. Defaults to DEFAULT_OPTIONS.
 * @returns {Promise<EnrollmentResponse|void>} - A promise that resolves to an array with two elements. The first element is an object with `txId` if authorization was successful or `null` if not. The second element is an object with `code` and `txId` if there was an error or `null` if not. If the function is run outside of a browser environment, the function returns `undefined`.
 * @throws - If an unknown error occurs.
 */
const enroll = async ({
  address,
  chainId,
  clientId,
  redirectUrl,
  apiUrl = API_URL,
}: EnrollProps): Promise<EnrollmentResponse | void> => {
  if (typeof window === "undefined") {
    console.warn("ENROLL_ONLY_AVAILABLE_IN_BROWSER");

    return;
  }

  const channel = new BroadcastChannel(VIOLET_AUTHORIZATION_CHANNEL);

  const url = buildEnrollmentUrl({
    address,
    chainId,
    clientId,
    redirectUrl,
    apiUrl,
  });

  const popup = generatePopup({
    url: url,
    id: VIOLET_CONTEXT,
  });

  if (!popup) {
    console.warn("POPUP_NOT_AVAILABLE_FALLBACK_REDIRECT");

    handleRedirect({ url });

    return;
  }

  return new Promise((resolve, reject) => {
    const listener = (event: MessageEvent<AuthorizeVioletResponse>) => {
      popup.close();

      if (!event.isTrusted) {
        return resolve([null, { code: "EVENT_NOT_TRUSTED" }]);
      }

      if ("error_code" in event.data) {
        return resolve([
          null,
          {
            code: event.data.error_code.toUpperCase(),
            txId: event.data.tx_id,
          },
        ]);
      }

      if ("tx_id" in event.data) {
        return resolve([{ txId: event.data.tx_id }, null]);
      }

      return reject(new Error("UNKNOWN_ERROR"));
    };

    channel.addEventListener("message", listener, {
      once: true,
    });
  });
};

export type { EnrollProps };
export { enroll, mode };
