enum IFrameMessageKind {
  Request = "iframe-message-request",
  Response = "iframe-message-response",
}

type IFrameMessage<ReqData = unknown, ResData = unknown> =
  | IFrameMessageRequest<ReqData>
  | IFrameMessageResponse<ResData>;

type IFrameMessageId = string;

type IFrameMessageRequest<Data = unknown> = {
  id: IFrameMessageId;
  kind: IFrameMessageKind.Request;
  data: Data;
};

type IFrameMessageResponse<Data = unknown> =
  | IFrameMessageResponseSuccess<Data>
  | IFrameMessageResponseFailure;

type IFrameMessageResponseSuccess<Data = unknown> = {
  id: IFrameMessageId;
  kind: IFrameMessageKind.Response;
  success: true;
  failure: false;
  data: Data;
};

type IFrameMessageResponseFailure = {
  id: IFrameMessageId;
  kind: IFrameMessageKind.Response;
  success: false;
  failure: true;
  error: unknown;
};

const DEFAULT_TARGET_ORIGIN = "*";
const DEFAULT_TIMEOUT_MILLISECONDS = 240000;

type MinimalEventSourceType = {
  addEventListener(
    eventType: "message",
    handler: (message: MessageEvent) => void
  ): void;
  removeEventListener(
    eventType: "message",
    handler: (message: MessageEvent) => void
  ): void;
};

type MinimalEventTargetType = {
  postMessage(message: unknown, targetOrigin?: string): void;
};

type IFrameTransportOptions = {
  targetOrigin?: string;
  timeoutMilliseconds?: number;
  eventSource?: MinimalEventSourceType;
  eventTarget?: MinimalEventTargetType;
};

type PromiseCompleter<Data> = {
  resolve(result: IFrameMessageResponseSuccess<Data>): void;
  reject(error: unknown): void;
};

/**
 * This class represents an InteframeTransport, which is a mechanism for communication between iFrames
 *
 * @property {string} targetOrigin - The origin to communicate with. Default '*'
 * @property {number} timeoutMilliseconds - How long to time out waiting for responses. Default 240000 milliseconds.
 * @property {MinimalEventSourceType} eventSource - The type for the source of events, typically the window.
 * @property {MinimalEventTargetType} eventTarget - The type for the target of our events, typically the parent window.
 * @property {(data: unknown) => Promise<unknown>} requestExecutor - The request executor function
 * @property {{[id: string]: PromiseCompleter<unknown>; }} completers - Object to store pending promises
 *
 * @constructor
 * @param {function} requestExecutor - Main function to handle requests processing
 * @param {IFrameTransportOptions} IFrameTransportOptions - object for passing options
 */
class IFrameTransport {
  private readonly targetOrigin: string;
  private readonly timeoutMilliseconds: number;
  private readonly eventSource: MinimalEventSourceType;
  private readonly eventTarget: MinimalEventTargetType;
  private readonly completers: {
    [id: string]: PromiseCompleter<any>;
  } = {};
  private readonly requestExecutor: (data: unknown) => Promise<unknown>;

  public constructor(
    requestExecutor: (data: unknown) => Promise<unknown>,
    {
      targetOrigin = DEFAULT_TARGET_ORIGIN,
      timeoutMilliseconds = DEFAULT_TIMEOUT_MILLISECONDS,
      eventSource = window,
      eventTarget = window.parent,
    }: IFrameTransportOptions = {}
  ) {
    this.targetOrigin = targetOrigin;
    this.timeoutMilliseconds = timeoutMilliseconds;
    this.eventSource = eventSource;
    this.eventTarget = eventTarget;
    this.requestExecutor = requestExecutor;

    this.eventSource.addEventListener("message", this.handleEventSourceMessage);
  }

  public cleanup() {
    this.eventSource.removeEventListener(
      "message",
      this.handleEventSourceMessage
    );
  }

  public async executeRequest<ReqData = unknown, ResData = unknown>(
    request: IFrameMessageRequest<ReqData>
  ): Promise<IFrameMessageResponse<ResData>> {
    const { id } = request;

    const promise = new Promise<IFrameMessageResponse<ResData>>(
      (resolve, reject) => (this.completers[id] = { resolve, reject })
    );

    this.eventTarget.postMessage(request, this.targetOrigin);

    setTimeout(() => {
      if (this.completers[id]) {
        this.completers[id].reject(
          new Error(
            `IFRAME_TRANSPORT_REQUEST_ID_${id}_TIMEOUT_AFTER_${this.timeoutMilliseconds}_MS`
          )
        );

        delete this.completers[id];
      }
    }, this.timeoutMilliseconds);

    return promise;
  }

  private handleEventSourceMessage = (event: MessageEvent) => {
    const data = event.data;
    if (!data) return;

    const message = data as IFrameMessage;
    if (!message.id) return;
    if (!message.kind) return;

    if (message.kind === IFrameMessageKind.Request) {
      this.requestExecutor(message.data)
        .then((data) => {
          const response: IFrameMessageResponse = {
            id: message.id,
            kind: IFrameMessageKind.Response,
            success: true,
            failure: false,
            data,
          };
          this.eventTarget.postMessage(response, this.targetOrigin);
        })
        .catch((error) => {
          const response: IFrameMessageResponse = {
            id: message.id,
            kind: IFrameMessageKind.Response,
            success: false,
            failure: true,
            error,
          };
          this.eventTarget.postMessage(response, this.targetOrigin);
        });
    } else if (message.kind === IFrameMessageKind.Response) {
      const completer = this.completers[message.id];

      if (completer) {
        if (message.success) {
          completer.resolve(message);
        } else if (message.failure) {
          completer.reject(message);
        } else {
          completer.reject(new Error("RESPONSE_MALFORMED"));
        }
        delete this.completers[message.id];
      }
    } else {
      throw Error(`Unsupported IFrameMessage ${JSON.stringify(message)}`);
    }
  };
}

export type {
  IFrameMessage,
  IFrameMessageRequest,
  IFrameMessageResponse,
  PromiseCompleter,
  IFrameTransportOptions,
  MinimalEventTargetType,
  MinimalEventSourceType,
  IFrameMessageId,
};

export {
  IFrameMessageKind,
  IFrameTransport,
  DEFAULT_TARGET_ORIGIN,
  DEFAULT_TIMEOUT_MILLISECONDS,
};
