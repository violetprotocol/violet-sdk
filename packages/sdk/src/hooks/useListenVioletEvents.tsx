// "use client";

import { useState, useEffect } from "react";
import { VIOLET_AUTHORIZATION_CHANNEL } from "@/constants";
import { AuthorizationEvent, AuthorizeVioletResponse } from "@/types";
import { secp256k1 } from "@noble/curves/secp256k1";

type PayloadType =
  | {
      event: AuthorizationEvent.INACTIVE;
      data: {};
    }
  | {
      event: AuthorizationEvent.LISTENING;
      data: {};
    }
  | {
      event: AuthorizationEvent.ERROR;
      data: {
        code: string;
        txId: string;
      };
    }
  | {
      event: AuthorizationEvent.COMPLETED;
      data: {
        token: string;
        txId: string;
        signature: {
          r: string;
          s: string;
          v: 0 | 1 | 27 | 28;
        };
        expiry: number;
      };
    };

const useListenVioletEvents = (
  channel: string = VIOLET_AUTHORIZATION_CHANNEL
) => {
  const [payload, setPayload] = useState<PayloadType>({
    event: AuthorizationEvent.INACTIVE,
    data: {},
  });

  useEffect(() => {
    const broadcastChannel = new BroadcastChannel(channel);

    setPayload({ event: AuthorizationEvent.LISTENING, data: {} });

    const listener = (event: MessageEvent<AuthorizeVioletResponse>) => {
      if (!event.isTrusted) {
        setPayload({
          event: AuthorizationEvent.LISTENING,
          data: { code: "EVENT_NOT_TRUSTED" },
        });

        return;
      }

      if ("error_code" in event.data) {
        setPayload({
          event: AuthorizationEvent.ERROR,
          data: {
            code: event.data.error_code.toUpperCase(),
            txId: event.data.tx_id,
          },
        });

        return;
      }

      if ("token" in event.data) {
        const eat = event.data.token;

        let parsedEAT;

        try {
          parsedEAT = JSON.parse(atob(eat));
        } catch (e) {
          setPayload({
            event: AuthorizationEvent.ERROR,
            data: { code: "EAT_MALFORMED", txId: event.data.tx_id },
          });

          return;
        }

        if (!parsedEAT?.signature || !parsedEAT?.expiry) {
          setPayload({
            event: AuthorizationEvent.ERROR,
            data: { code: "EAT_PARSING_FAILED", txId: event.data.tx_id },
          });

          return;
        }

        const { r, s } = secp256k1.Signature.fromCompact(
          parsedEAT.signature.slice(2, 130)
        );

        const v = parseInt(`0x${parsedEAT.signature.slice(130)}`, 16) as
          | 0
          | 1
          | 27
          | 28;

        const signature = {
          r: `0x${r.toString(16)}`,
          s: `0x${s.toString(16)}`,
          v,
        };

        setPayload({
          event: AuthorizationEvent.COMPLETED,
          data: {
            token: event.data.token,
            txId: event.data.tx_id,
            signature,
            expiry: parsedEAT.expiry,
          },
        });

        return;
      }

      throw new Error("UNKNOWN_ERROR_VIOLET_EMBEDDED_AUTHORIZATION");
    };

    broadcastChannel.addEventListener("message", listener, {
      once: true,
    });
  }, [channel]);

  return payload;
};

export { useListenVioletEvents };
