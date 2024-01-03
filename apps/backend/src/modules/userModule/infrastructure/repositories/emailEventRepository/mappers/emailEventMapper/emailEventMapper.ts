import { EmailEvent } from '../../../../../domain/entities/emailEvent/emailEvent.js';
import { type EmailEventStatus } from '../../../../../domain/entities/emailEvent/types/emailEventStatus.js';
import { type EmailEventType } from '../../../../../domain/entities/emailEvent/types/emailEventType.js';
import { type EmailEventRawEntity } from '../../../../databases/userEventsDatabase/tables/emailEventTable/emailEventRawEntity.js';

export class EmailEventMapper {
  public map(rawEntity: EmailEventRawEntity): EmailEvent {
    const { createdAt, id, payload, status } = rawEntity;

    return new EmailEvent({
      createdAt,
      id,
      payload: {
        ...payload,
        emailEventType: payload.emailEventType as EmailEventType,
      },
      status: status as EmailEventStatus,
    });
  }
}
