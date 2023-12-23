import { type LoggerService } from '../../logger/services/loggerService/loggerService.js';
import { type ReceivePayload, type MessageBus } from '../bus/messageBus.js';
import { MessageBusImpl } from '../bus/messageBusImpl.js';
import { type MQemitterClient } from '../clients/mqemitterClient.js';

export interface CreatePayload {
  client: MQemitterClient;
  topics: ReceivePayload[];
}

export class MessageBusFactory {
  public constructor(private readonly loggerService: LoggerService) {}

  public create(payload: CreatePayload): MessageBus {
    const { client, topics } = payload;

    return new MessageBusImpl(client, this.loggerService, topics);
  }
}
