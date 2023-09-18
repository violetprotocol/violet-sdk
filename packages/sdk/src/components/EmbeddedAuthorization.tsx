import { useListenVioletEvents } from "@/hooks/useListenVioletEvents";
import { AuthorizationEvent, AuthorizeProps } from "@/types";
import { buildAuthorizationUrl } from "@/utils/buildAuthorizationUrl";
import { cn } from "@/utils/cn";
import { forwardRef, useEffect } from "react";

const IFRAME_WIDTH = 384;
const IFRAME_HEIGHT = 524;

type EmbeddedAuthorizationProps = {
  apiUrl: string;
  authz: AuthorizeProps;
  onIssued: (data: {
    token: string;
    txId: string;
    signature: {
      r: string;
      s: string;
      v: number;
    };
    expiry: number;
  }) => void;
  onFailed: (error: { code: string; txId: string }) => void;
  className?: string;
  width?: number;
  height?: number;
};

const EmbeddedAuthorization = forwardRef<
  HTMLIFrameElement,
  EmbeddedAuthorizationProps
>(
  (
    {
      authz,
      onIssued,
      onFailed,
      className,
      width = IFRAME_WIDTH,
      height = IFRAME_HEIGHT,
    },
    ref
  ) => {
    const payload = useListenVioletEvents();

    useEffect(() => {
      if (payload.event === AuthorizationEvent.COMPLETED) {
        onIssued({ ...payload.data });
      }

      if (payload.event === AuthorizationEvent.ERROR) {
        onFailed({ ...payload.data });
      }
    }, [payload, onIssued, onFailed]);

    const url = buildAuthorizationUrl({
      ...authz,
    });

    return (
      <div
        className={cn(
          "flex items-center justify-center w-full h-full",
          className
        )}
      >
        <iframe
          className="border-none rounded-2xl"
          ref={ref}
          src={url}
          width={width}
          height={height}
          allow="clipboard-write"
        />
      </div>
    );
  }
);

export { EmbeddedAuthorization };
