"use client";

import { VIOLET_AUTHORIZATION_JSON } from "@violetprotocol/sdk";
import { useEffect } from "react";

const Callback = () => {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const params = {};

    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    if (params.hasOwnProperty("tx_id")) {
      localStorage.setItem(VIOLET_AUTHORIZATION_JSON, JSON.stringify(params));

      window.close();
    }
  }, []);

  return null;
};

export default Callback;
