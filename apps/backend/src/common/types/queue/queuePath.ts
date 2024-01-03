import { type QueueHandler } from './queueHandler.js';

export interface QueuePath {
  queuePath: string;
  handler: QueueHandler;
}
