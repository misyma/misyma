/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ErrorHandler, type MessagePayload, type MessageBus, type ReceivePayload } from './messageBus.js';
import { type LoggerService } from '../../logger/services/loggerService/loggerService.js';
import { type MQemitterClient } from '../clients/mqemitterClient.js';
import { isAsyncHandler } from '../utils/guards/isAsyncHandler.js';

export class MessageBusImpl implements MessageBus {
  private errorHandler?: ErrorHandler;

  public constructor(
    private readonly nativeMq: MQemitterClient,
    private readonly loggerService: LoggerService,
    private readonly topics: ReceivePayload[],
  ) {
    this.topics.forEach((payload) => this.receive(payload));
  }

  public send(payload: MessagePayload): void {
    const { data, topic } = payload;

    this.nativeMq.emit({
      topic,
      data,
    });
  }

  private receive(payload: ReceivePayload): void {
    const { topic, handler } = payload;

    if (isAsyncHandler(handler)) {
      this.nativeMq.on(topic, (message: any, callback: any) => {
        handler(message['data'])
          .then(() => callback())
          .catch((error) => this.errorHandler?.(error));
      });
    } else {
      this.nativeMq.on(topic, (message: any, callback: any) => {
        this.loggerService.debug({
          message: 'Received message',
          topic,
          data: message['data'],
        });

        try {
          handler(message['data']);
        } catch (error) {
          this.loggerService.error({
            message: 'Caught an error while handling a message',
            topic,
            error,
          });

          if (error instanceof Error) {
            this.errorHandler?.(error);
          }
        }

        callback();
      });
    }
  }

  public setOnErrorHandler(handler: ErrorHandler): void {
    this.errorHandler = handler;
  }
}
