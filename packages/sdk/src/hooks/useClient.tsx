// "use client";

import { VioletContext } from "@/providers/VioletProvider";
import { useContext } from "react";

const useClient = () => {
  const client = useContext(VioletContext);

  if (!client) {
    throw new Error("USE_ENROLL_OUTSIDE_PROVIDER");
  }

  return client;
};

export { useClient };
