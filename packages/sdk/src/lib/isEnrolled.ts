import { ENROLLED_ENDPOINT } from "../constants";

/**
 * Checks if the user is enrolled in Violet.
 *
 * @async
 * @function isEnrolled
 * @param {Object} options - The authorization parameters and options.
 * @param {string} options.address - The address of the user.
 * @param {string} [options.apiUrl=API_URL] - The URL of the API for authorization. Defaults to API_URL.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the user is enrolled in Violet.
 * @throws - If an unknown error occurs while fetching and parsing the enrollment status.
 */
const isEnrolled = async ({
  address,
  apiUrl,
}: {
  address: string;
  apiUrl: string;
}): Promise<boolean> => {
  const url = new URL(ENROLLED_ENDPOINT, apiUrl);

  url.searchParams.append("from", `eip155:1:${address}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    mode: "cors",
  });

  if (!response.ok) {
    throw new Error(`FAILED_TO_FETCH_ENROLLMENT_STATUS_FOR_${address}`);
  }

  const data = await response.json();

  if (!data) {
    throw new Error(
      `FAILED_TO_PARSE_ENROLLMENT_STATUS_FROM_VIOLET_FOR_${address}`
    );
  }

  return data.isUserEnrolled;
};

export { isEnrolled };
