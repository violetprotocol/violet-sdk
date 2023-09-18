import { ENROLLED_ENDPOINT } from "../constants";

const isRegisteredWithViolet = async ({
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
    throw new Error(`FAILED_TO_FETCH_REGISTRATION_STATUS_FOR_${address}`);
  }

  const data = await response.json();

  if (!data) {
    throw new Error(`FAILED_TO_PARSE_RESPONSE_FROM_VIOLET_FOR_${address}`);
  }

  return data.isUserEnrolled;
};

export { isRegisteredWithViolet };
