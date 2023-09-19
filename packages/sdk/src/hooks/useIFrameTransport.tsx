// "use client";

import { RefObject, useEffect, useRef } from "react";
import {
  IFrameTransport,
  MinimalEventSourceType,
  MinimalEventTargetType,
} from "../utils/iframeTransport";

type UseIFrameTransportProps = {
  requestExecutor: (request: unknown) => Promise<unknown>;
  sourceRef: RefObject<MinimalEventSourceType>;
  targetRef: RefObject<MinimalEventTargetType>;
};

const useIFrameTransport = ({
  requestExecutor,
  sourceRef,
  targetRef,
}: UseIFrameTransportProps) => {
  const transportRef = useRef<IFrameTransport | null>(null);

  useEffect(() => {
    if (transportRef.current) transportRef.current.cleanup();

    if (!sourceRef?.current) return;
    if (!targetRef?.current) return;

    transportRef.current = new IFrameTransport(requestExecutor, {
      eventSource: sourceRef.current,
      eventTarget: targetRef.current,
    });
    return () => transportRef.current?.cleanup();
  }, [sourceRef?.current, targetRef?.current]);

  return transportRef;
};

export { useIFrameTransport };
