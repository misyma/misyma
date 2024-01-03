export interface QueueHandlerPayload {
  data: unknown;
  eventName: string;
}

export type QueueHandler = (payload: QueueHandlerPayload) => Promise<unknown>;
