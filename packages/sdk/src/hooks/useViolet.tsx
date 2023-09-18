// "use client";

import { createVioletClient } from "../lib";
import { VioletConfigParams } from "../types";

const useViolet = ({ clientId, redirectUrl, apiUrl }: VioletConfigParams) => {
  const client = createVioletClient({ clientId, redirectUrl, apiUrl });

  return client;
};

export { useViolet };
