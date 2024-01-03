import { EmailEvent } from '../../../../../domain/entities/emailEvent/emailEvent.js';
import { type EmailEventRawEntity } from '../../../../databases/userEventsDatabase/tables/emailEventTable/emailEventRawEntity.js';

export class EmailEventMapper {
  public map(rawEntity: EmailEventRawEntity): EmailEvent {
    const { createdAt, id, payload, status } = rawEntity;

    return new EmailEvent({
      createdAt,
      id,
      payload,
      status,
    });
  }
}
