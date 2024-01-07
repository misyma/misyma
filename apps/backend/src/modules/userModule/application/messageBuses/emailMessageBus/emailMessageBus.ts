import { type EmailEventDraft } from '../../../domain/entities/emailEvent/emailEventDraft.ts/emailEventDraft.js';

export interface EmailMessageBus {
  registerEvent(emailEvent: EmailEventDraft): Promise<void>;
}
