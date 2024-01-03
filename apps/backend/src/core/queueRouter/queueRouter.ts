import { setTimeout } from 'timers/promises';

import { type QueueChannel } from '../../common/types/queue/queueChannel.js';
import { type QueueController } from '../../common/types/queue/queueController.js';
import { type QueueHandlerPayload, type QueueHandler } from '../../common/types/queue/queueHandler.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type LoggerService } from '../../libs/logger/services/loggerService/loggerService.js';
import { coreSymbols } from '../symbols.js';

interface RegisterQueueControllerPayload {
  controllers: QueueController[];
}

interface RegisterQueueChannelsPayload {
  controllers: QueueController[];
}

export class QueueRouter {
  private readonly paths = new Map<string, QueueHandler>();

  private readonly channels: QueueChannel[] = [];

  private readonly loggerService: LoggerService;

  public constructor(private readonly container: DependencyInjectionContainer) {
    const controllers: QueueController[] = [];

    this.loggerService = this.container.get<LoggerService>(coreSymbols.loggerService);

    this.registerQueueControllers({
      controllers,
    });

    this.registerQueueChannels({
      controllers,
    });
  }

  private registerQueueControllers(payload: RegisterQueueControllerPayload): void {
    const { controllers } = payload;

    controllers.forEach((controller) => {
      const queuePaths = controller.getQueuePaths();

      queuePaths.forEach((handler) => {
        this.paths.set(handler.queuePath, handler.handler);
      });
    });
  }

  private registerQueueChannels(payload: RegisterQueueChannelsPayload): void {
    const { controllers } = payload;

    controllers.forEach((controller) => {
      const channels = controller.getChannels();

      channels.forEach((channel) => {
        this.channels.push(channel);
      });
    });
  }

  private async handleQueueMessage(payload: QueueHandlerPayload): Promise<unknown> {
    const { eventName, data } = payload;

    const handler = this.paths.get(eventName);

    if (!handler) {
      return;
    }

    try {
      return await handler({
        data,
        eventName,
      });
    } catch (error) {
      this.loggerService.error({
        message: 'An error occurred while handling a queue message.',
        context: {
          eventName,
          data,
        },
      });

      return;
    }
  }

  private async processChannels(): Promise<void> {
    for (const channel of this.channels) {
      const messages = await channel.getMessages();

      for (const message of messages) {
        await this.handleQueueMessage(message);
      }
    }

    await setTimeout(5000, async () => await this.processChannels());
  }

  public async start(): Promise<void> {
    await setTimeout(5000, async () => await this.processChannels());
  }
}
