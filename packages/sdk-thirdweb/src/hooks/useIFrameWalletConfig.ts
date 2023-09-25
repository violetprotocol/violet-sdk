import { useEffect, useRef } from "react";
import { useIFrameTransport, IFrameMessageKind } from "@violetprotocol/sdk";
import { iframeWallet } from "../utils";
import type { RequestProps } from "../types";

const useIFrameWalletConfig = () => {
  const sourceRef = useRef<Window | null>(null);
  const targetRef = useRef<Window | null>(null);

  useEffect(() => {
    sourceRef.current = window;
    targetRef.current = window.parent;
  }, []);

  const transportRef = useIFrameTransport({
    requestExecutor() {
      return Promise.resolve(true);
    },

    sourceRef,
    targetRef,
  });

  const request = async (data: RequestProps) => {
    try {
      const executedRequest = await transportRef.current!.executeRequest({
        id: crypto.randomUUID(),
        kind: IFrameMessageKind.Request,
        data,
      });

      if (executedRequest.failure) {
        const { error } = executedRequest;

        console.log(`[CHILD WALLET RESPONSE] Failure: `, error);

        throw error;
      }

      if (executedRequest.success) {
        const response = executedRequest.data;

        console.log(`[CHILD WALLET RESPONSE] Success: `, data);

        return response;
      }
    } catch (error) {
      console.log(`[CHILD WALLET RESPONSE] Failure: `, error);

      throw error;
    }
  };

  return () =>
    iframeWallet({
      request: (method, params) => request({ method, params }),
    });
};

export { useIFrameWalletConfig };
