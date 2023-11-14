"use client";

import { VIOLET_AUTHORIZATION_CHANNEL } from "@violetprotocol/sdk";
import { useEffect } from "react";

const Callback = () => {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const params = {};

    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    const channel = new BroadcastChannel(VIOLET_AUTHORIZATION_CHANNEL);

    channel.postMessage(params);

    window.close();
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      You can close this window now.
    </div>
  );
};

export default Callback;
