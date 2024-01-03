import { type QueueChannel } from '../../../../../common/types/queue/queueChannel.js';
import { type QueueController } from '../../../../../common/types/queue/queueController.js';
import { type QueuePath } from '../../../../../common/types/queue/queuePath.js';

export class EmailQueueController implements QueueController {
  public constructor() {}

  public getQueuePaths(): QueuePath[] {
    throw new Error('Method not implemented.');
  }

  public getChannels(): QueueChannel[] {
    throw new Error('Method not implemented.');
  }
}
