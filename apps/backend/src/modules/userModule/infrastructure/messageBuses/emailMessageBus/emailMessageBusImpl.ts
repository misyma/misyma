import { type EmailMessageBus } from '../../../application/messageBuses/emailMessageBus/emailMessageBus.js';
import { type EmailEventDraft } from '../../../domain/entities/emailEvent/emailEvent.js';
import { type EmailEventRepository } from '../../../domain/repositories/emailEventRepository/emailEventRepository.js';

export class EmailMessageBusImpl implements EmailMessageBus {
  public constructor(private readonly emailEventRepository: EmailEventRepository) {}

  public async sendEvent(emailEvent: EmailEventDraft): Promise<void> {
    await this.emailEventRepository.create(emailEvent);
  }
}
