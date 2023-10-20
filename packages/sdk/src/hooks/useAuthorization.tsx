"use client";

import { VioletContext } from "@/providers/VioletProvider";
import { useContext } from "react";

const useAuthorization = () => {
  const client = useContext(VioletContext);

  if (!client) {
    throw new Error("USE_AUTHORIZE_OUTSIDE_PROVIDER");
  }

  return {
    authorize: client.authorize,
  };
};

export { useAuthorization };
