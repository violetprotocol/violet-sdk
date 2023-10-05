// "use client";

import { useListenVioletAuthorization } from "@/hooks/useListenVioletAuthorization";
import { AuthorizationEvent, AuthorizePartialProps } from "@/types";
import { buildAuthorizationUrl } from "@/utils/buildAuthorizationUrl";
import { cn } from "@/utils/cn";
import { IframeHTMLAttributes, forwardRef, useEffect } from "react";
import type { Signature } from "@ethersproject/bytes";
import { VIOLET_AUTHORIZATION_CHANNEL, useClient } from "..";

const IFRAME_MIN_WIDTH = 384;
const IFRAME_MIN_HEIGHT = 524;

type EmbeddedAuthorizationProps = Omit<
  IframeHTMLAttributes<HTMLIFrameElement>,
  "src" | "srcDoc" | "allow" | "name"
> & {
  authorizeProps: AuthorizePartialProps;
  onIssued: (data: {
    token: string;
    txId: string;
    signature: Signature;
    expiry: number;
  }) => void;
  onFailed: (error: { code: string; txId: string }) => void;
  channel?: string;
  width?: number;
  height?: number;
};

const EmbeddedAuthorization = forwardRef<
  HTMLIFrameElement,
  EmbeddedAuthorizationProps
>(
  (
    {
      authorizeProps,
      onIssued,
      onFailed,
      className,
      channel = VIOLET_AUTHORIZATION_CHANNEL,
      width = IFRAME_MIN_WIDTH,
      height = IFRAME_MIN_HEIGHT,
      ...props
    },
    ref
  ) => {
    if (width < IFRAME_MIN_WIDTH) {
      console.warn(
        `Provided width is less than minimum width, consider changing it to prevent possible UI issues. Minimum width is ${IFRAME_MIN_WIDTH}px.`
      );
    }

    if (height < IFRAME_MIN_HEIGHT) {
      console.warn(
        `Provided height is less than minimum height, consider changing it to prevent possible UI issues. Minimum height is ${IFRAME_MIN_HEIGHT}px.`
      );
    }

    const { config } = useClient();

    const payload = useListenVioletAuthorization(channel);

    useEffect(() => {
      if (payload.event === AuthorizationEvent.COMPLETED) {
        onIssued(payload.data);
      }

      if (payload.event === AuthorizationEvent.ERROR) {
        onFailed(payload.data);
      }
    }, [payload, onIssued, onFailed]);

    const url = buildAuthorizationUrl({
      ...authorizeProps,
      ...config,
    });

    return (
      <div
        className={cn(
          "w-full h-full flex justify-center items-center",
          className
        )}
      >
        <iframe
          className="border-none rounded-2xl"
          name="violet-authorization"
          ref={ref}
          src={url}
          width={width}
          height={height}
          allow="clipboard-write; clipboard-read; geolocation"
          {...props}
        />
      </div>
    );
  }
);

EmbeddedAuthorization.displayName = "EmbeddedAuthorization";

export { EmbeddedAuthorization };
