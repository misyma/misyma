import { type EmailEventDraft } from '../../../domain/entities/emailEvent/emailEvent.js';

export interface EmailMessageBus {
  sendEvent(emailEvent: EmailEventDraft): Promise<void>;
}
