import { EmailEvent } from '../../../../../domain/entities/emailEvent/emailEvent.js';
import { type EmailEventStatus } from '../../../../../domain/entities/emailEvent/types/emailEventStatus.js';
import { type EmailEventType } from '../../../../../domain/entities/emailEvent/types/emailEventType.js';
import { type EmailEventRawEntity } from '../../../../databases/userDatabase/tables/emailEventTable/emailEventRawEntity.js';

export class EmailEventMapper {
  public map(rawEntity: EmailEventRawEntity): EmailEvent {
    const { createdAt, id, payload, status, eventName } = rawEntity;

    return new EmailEvent({
      createdAt,
      id,
      payload: JSON.parse(payload),
      status: status as EmailEventStatus,
      eventName: eventName as EmailEventType,
    });
  }
}
