import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type EmailEventRawEntity } from '../../../../databaseModule/infrastructure/tables/emailEventsTable/emailEventRawEntity.js';
import { emailEventsTable } from '../../../../databaseModule/infrastructure/tables/emailEventsTable/emailEventsTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type EmailEvent } from '../../../domain/entities/emailEvent/emailEvent.js';

export class EmailEventTestUtils extends TestUtils {
  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, emailEventsTable);
  }

  public async create(emailEvent: EmailEvent): Promise<EmailEventRawEntity> {
    const rawEntities = await this.databaseClient<EmailEventRawEntity>(emailEventsTable).insert(
      {
        created_at: emailEvent.getCreatedAt(),
        id: emailEvent.getId(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payload: JSON.stringify(emailEvent.getPayload()) as any,
        status: emailEvent.getStatus(),
        event_name: emailEvent.getEmailEventName(),
      },
      '*',
    );

    return rawEntities[0] as EmailEventRawEntity;
  }

  public async createMany(emailEvents: EmailEvent[]): Promise<EmailEventRawEntity[]> {
    const rawEntities = await this.databaseClient<EmailEventRawEntity>(emailEventsTable).insert(
      emailEvents.map((emailEvent) => ({
        created_at: emailEvent.getCreatedAt(),
        id: emailEvent.getId(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payload: JSON.stringify(emailEvent.getPayload()) as any,
        status: emailEvent.getStatus(),
        event_name: emailEvent.getEmailEventName(),
      })),
      '*',
    );

    return rawEntities;
  }

  public async findById(id: string): Promise<EmailEventRawEntity | null> {
    const rawEntities = await this.databaseClient<EmailEventRawEntity>(emailEventsTable).where({ id }).select('*');

    return rawEntities[0] ?? null;
  }

  public async findAll(): Promise<EmailEventRawEntity[]> {
    return this.databaseClient<EmailEventRawEntity>(emailEventsTable).select('*');
  }
}
