// "use client"

import { Web3ContextType, useWeb3React } from "@web3-react/core";
import { RefObject, useEffect, useRef } from "react";
import { useIFrameTransport } from "@violetprotocol/sdk";

interface UseIFrameExecutorProps {
  sourceRef: RefObject<any>;
  targetRef: RefObject<any>;
}

/**
 * This should be used in the parent window to execute requests from the child window.
 *
 * @param sourceRef - the parent `window` to which the child posts messages as requests
 * @param targetRef - the child `window` (iframe) to which the parent posts messages as replies
 */
const useIFrameExecutor = ({
  sourceRef,
  targetRef,
}: UseIFrameExecutorProps) => {
  const ref = useRef<Web3ContextType["connector"] | null>(null);
  const w3 = useWeb3React();

  useEffect(() => {
    ref.current = w3.connector;
  }, [w3.connector]);

  useIFrameTransport({
    async requestExecutor(request) {
      if (!ref.current) throw new Error("NO_CONNECTOR_FOUND");

      const connector = ref.current;

      let provider = connector.customProvider as typeof w3.connector.provider;

      if (!provider) provider = w3.connector.provider;

      if (!provider) throw new Error("NO_PROVIDER_FOUND");

      if (typeof request === "string") {
        return provider.request({ method: request });
      }

      throw new Error("INVALID_REQUEST");
    },
    sourceRef,
    targetRef,
  });
};

export { useIFrameExecutor };
