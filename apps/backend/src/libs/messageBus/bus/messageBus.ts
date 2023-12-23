export interface MessagePayload<T = unknown> {
  topic: string;
  data: MessageData<T>;
}

export interface MessageData<T = unknown> {
  messageName: string;
  data: T;
}

export type SyncMessageHandler = (message: MessageData) => void;

export type AsyncMessageHandler = (message: MessageData) => Promise<void>;

export type ErrorHandler = (error: Error) => void;

export interface ReceivePayload {
  topic: string;
  handler: SyncMessageHandler | AsyncMessageHandler;
}

export interface MessageBus {
  send(payload: MessagePayload<unknown>): void;
  setOnErrorHandler(handler: ErrorHandler): void;
}
