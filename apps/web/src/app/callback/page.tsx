"use client";

import { VIOLET_AUTHORIZE_KEY } from "@violetprotocol/sdk";
import { useEffect } from "react";

const Callback = () => {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const params = {};

    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    if (params.hasOwnProperty("tx_id")) {
      localStorage.setItem(VIOLET_AUTHORIZE_KEY, JSON.stringify(params));

      window.close();
    }
  }, []);

  return null;
};

export default Callback;
