export interface QueueMessagePayload {
  data: unknown;
  eventName: string;
}

export interface QueueChannel {
  getMessages(): Promise<QueueMessagePayload[]>;
}
