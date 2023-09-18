import { useState, useEffect } from "react";
import { VIOLET_AUTHORIZATION_CHANNEL } from "@/constants";
import { AuthorizationEvent, AuthorizeVioletResponse } from "@/types";
import { splitSignature } from "@ethersproject/bytes";

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
          v: number;
        };
        expiry: number;
      };
    };

const useListenVioletEvents = () => {
  const [payload, setPayload] = useState<PayloadType>({
    event: AuthorizationEvent.INACTIVE,
    data: {},
  });

  useEffect(() => {
    const channel = new BroadcastChannel(VIOLET_AUTHORIZATION_CHANNEL);
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

        const parsedEAT = JSON.parse(atob(eat));

        if (!parsedEAT?.signature || !parsedEAT?.expiry) {
          setPayload({
            event: AuthorizationEvent.ERROR,
            data: { code: "EAT_PARSING_FAILED", txId: event.data.tx_id },
          });

          return;
        }

        const signature = splitSignature(parsedEAT.signature);

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

    channel.addEventListener("message", listener, {
      once: true,
    });
  }, []);

  return payload;
};

export { useListenVioletEvents };
