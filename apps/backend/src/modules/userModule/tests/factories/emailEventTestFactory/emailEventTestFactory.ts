import { Generator } from '../../../../../../tests/generator.js';
import { emailTypes, type EmailType } from '../../../../../common/types/emailType.js';
import {
  EmailEvent,
  EmailEventDraft,
  type EmailEventDraftState,
  type EmailEventState,
} from '../../../domain/entities/emailEvent/emailEvent.js';
import { EmailEventStatus } from '../../../domain/entities/emailEvent/types/emailEventStatus.js';

export class EmailEventTestFactory {
  public createDraft(overrides: Partial<EmailEventDraftState> = {}): EmailEventDraft {
    return new EmailEventDraft({
      payload: {
        recipientEmail: Generator.email(),
        emailEventType: Generator.arrayElement<EmailType>(Object.keys(emailTypes) as EmailType[]),
        name: Generator.fullName(),
        ...overrides.payload,
      },
      eventName: Generator.arrayElement<EmailType>(Object.keys(emailTypes) as EmailType[]),
    });
  }

  public create(overrides: Partial<EmailEventState> = {}): EmailEvent {
    return new EmailEvent({
      createdAt: Generator.pastDate(),
      id: Generator.uuid(),
      eventName: Generator.arrayElement<EmailType>(Object.keys(emailTypes) as EmailType[]),
      status: EmailEventStatus.pending,
      ...overrides,
      payload: {
        recipientEmail: Generator.email(),
        emailEventType: Generator.arrayElement<EmailType>(Object.keys(emailTypes) as EmailType[]),
        name: Generator.fullName(),
        ...overrides.payload,
      },
    });
  }
}
