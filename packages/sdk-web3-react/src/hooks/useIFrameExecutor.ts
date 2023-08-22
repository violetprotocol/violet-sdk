// "use client"

import { useWeb3React } from "@web3-react/core";
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
function useIFrameExecutor({
  sourceRef,
  targetRef,
}: UseIFrameExecutorProps) {
  const ref_ = useRef<any>();
  const w3 = useWeb3React();

  useEffect(() => {
    ref_.current = w3.connector;
  }, [sourceRef?.current, targetRef?.current]);

  useIFrameTransport({
    async requestExecutor(request) {
      console.log(`[PARENT REQUEST EXECUTOR]: `, request);
      const connector = ref_.current;
      const provider = connector.customProvider || w3.connector.provider;
      return provider.request(request);
    },
    sourceRef,
    targetRef,
  });
}

export { useIFrameExecutor };
