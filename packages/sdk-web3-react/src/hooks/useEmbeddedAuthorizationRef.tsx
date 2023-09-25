import { useEffect, useRef } from "react";
import { useIFrameExecutor } from "./useIFrameExecutor";

const useEmbeddedAuthorizationRef = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const sourceRef = useRef<Window | null>(null);
  const targetRef = useRef<any>(null);

  useEffect(() => {
    sourceRef.current = window;
    targetRef.current = iframeRef.current?.contentWindow;
  }, []);

  useIFrameExecutor({ sourceRef, targetRef });

  return iframeRef;
};

export { useEmbeddedAuthorizationRef };
