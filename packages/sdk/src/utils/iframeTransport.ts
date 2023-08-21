export enum IFrameMessageKind {
  Request = "iframe-message-request",
  Response = "iframe-message-response",
}

export type IFrameMessage<ReqData = any, ResData = any> =
  | IFrameMessageRequest<ReqData>
  | IFrameMessageResponse<ResData>;

export type IFrameMessageId = string;

export interface IFrameMessageRequest<Data = any> {
  id: IFrameMessageId;
  kind: IFrameMessageKind.Request,
  data: Data;
}

export type IFrameMessageResponse<Data = any> = IFrameMessageResponseSuccess<Data> | IFrameMessageResponseFailure;

export interface IFrameMessageResponseSuccess<Data = any> {
  id: IFrameMessageId;
  kind: IFrameMessageKind.Response,
  success: true,
  failure: false,
  data: Data;
}

export interface IFrameMessageResponseFailure {
  id: IFrameMessageId;
  kind: IFrameMessageKind.Response,
  success: false,
  failure: true,
  error: unknown;
}

/**
 * We return a random number between the 0 and the maximum safe integer so that we always generate a unique identifier,
 * across all communication channels.
 */
export function getUniqueId(): string {
  return Math.floor(Math.random() * Number.MAX_VALUE).toString();
}

// By default post to any origin
const DEFAULT_TARGET_ORIGIN = '*';
// By default timeout is 60 seconds
const DEFAULT_TIMEOUT_MILLISECONDS = 240000;

// The interface for the source of the events, typically the window.
export interface MinimalEventSourceInterface {
  addEventListener(
    eventType: "message",
    handler: (message: MessageEvent) => void
  ): void;
  removeEventListener(
    eventType: "message",
    handler: (message: MessageEvent) => void
  ): void;
}

// The interface for the target of our events, typically the parent window.
export interface MinimalEventTargetInterface {
  postMessage(message: any, targetOrigin?: string): void;
}

/**
 * Options for constructing the iframe transport.
 */
export interface IFrameTransportOptions {
  // The origin to communicate with. Default '*'
  targetOrigin?: string;
  // How long to time out waiting for responses. Default 60 seconds.
  timeoutMilliseconds?: number;

  // The event source. By default we use the window. This can be mocked for tests, or it can wrap
  // a different interface, e.g. workers.
  eventSource?: MinimalEventSourceInterface;

  // The event target. By default we use the window parent. This can be mocked for tests, or it can wrap
  // a different interface, e.g. workers.
  eventTarget?: MinimalEventTargetInterface;
}

/**
 * This is what we store in the state to keep track of pending promises.
 */
interface PromiseCompleter<Data> {
  // A response was received (either error or result response).
  resolve(result: IFrameMessageResponseSuccess<Data>): void;

  // An error with executing the request was encountered.
  reject(error: unknown): void;
}

/**
 * This is the primary artifact of this library.
 */
export class IFrameTransport {
  private readonly targetOrigin: string;
  private readonly timeoutMilliseconds: number;
  private readonly eventSource: MinimalEventSourceInterface;
  private readonly eventTarget: MinimalEventTargetInterface;
  private readonly completers: {
    [id: string]: PromiseCompleter<any>;
  } = {};
  private readonly requestExecutor: (data: any) => Promise<any>;

  public constructor(
    requestExecutor: (data: any) => Promise<any>,
    {
      targetOrigin = DEFAULT_TARGET_ORIGIN,
      timeoutMilliseconds = DEFAULT_TIMEOUT_MILLISECONDS,
      eventSource = window,
      eventTarget = window.parent,
    }: IFrameTransportOptions = {},
  ) {
    this.targetOrigin = targetOrigin;
    this.timeoutMilliseconds = timeoutMilliseconds;
    this.eventSource = eventSource;
    this.eventTarget = eventTarget;
    this.requestExecutor = requestExecutor;

    // Listen for messages from the event source.
    this.eventSource.addEventListener("message", this.handleEventSourceMessage);
  }

  public cleanup() {
    this.eventSource.removeEventListener("message", this.handleEventSourceMessage);
  }

  /**
   * Helper method that handles transport and request wrapping
   * @param method method to execute
   * @param params params to pass the method
   * @param requestId jsonrpc request id
   */
  public async executeRequest<ReqData = any, ResData = any>(
    request: IFrameMessageRequest<ReqData>
  ): Promise<IFrameMessageResponse<ResData>> {
    const { id } = request;

    const promise = new Promise<
      IFrameMessageResponse<ResData>
    >((resolve, reject) => (this.completers[id] = { resolve, reject }));

    this.eventTarget.postMessage(request, this.targetOrigin);

    // Delete the completer within the timeout and reject the promise.
    setTimeout(() => {
      if (this.completers[id]) {
        this.completers[id].reject(
          new Error(
            `IFrameTransport Request with ID "${id}" timed out after ${this.timeoutMilliseconds} milliseconds`
          )
        );
        delete this.completers[id];
      }
    }, this.timeoutMilliseconds);

    return promise;
  };

  /**
   * Handle a message on the event source.
   * @param event message event that will be processed by the provider
   */
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
  
      // True if we haven't timed out and this is a response to a message we sent.
      if (completer) {
        if (message.success) {
          completer.resolve(message);
        } else if (message.failure) {
          completer.reject(message);
        } else {
          completer.reject(
            new Error('Response from provider did not have error or result key')
          );
        }
        delete this.completers[message.id];
      }
    } else {
      throw Error(`Unsupported IFrameMessage ${JSON.stringify(message)}`);
    }
  };
}
