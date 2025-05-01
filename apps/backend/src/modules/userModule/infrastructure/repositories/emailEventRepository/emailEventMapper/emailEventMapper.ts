import { type EmailType } from '../../../../../../common/types/emailType.js';
import { type EmailEventRawEntity } from '../../../../../databaseModule/infrastructure/tables/emailEventTable/emailEventRawEntity.js';
import { EmailEvent } from '../../../../domain/entities/emailEvent/emailEvent.js';
import { type EmailEventStatus } from '../../../../domain/entities/emailEvent/types/emailEventStatus.js';

export class EmailEventMapper {
  public map(rawEntity: EmailEventRawEntity): EmailEvent {
    const { created_at: createdAt, id, payload, status, event_name: eventName } = rawEntity;

    return new EmailEvent({
      createdAt,
      id,
      payload: JSON.parse(payload),
      status: status as EmailEventStatus,
      eventName: eventName as EmailType,
    });
  }
}
