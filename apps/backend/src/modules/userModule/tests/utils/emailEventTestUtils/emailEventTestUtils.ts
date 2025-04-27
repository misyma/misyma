import { TestUtils } from '../../../../../../tests/testUtils.js';
import { type EmailEventRawEntity } from '../../../../databaseModule/infrastructure/tables/emailEventTable/emailEventRawEntity.js';
import { emailEventTable } from '../../../../databaseModule/infrastructure/tables/emailEventTable/emailEventTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type EmailEvent } from '../../../domain/entities/emailEvent/emailEvent.js';

export class EmailEventTestUtils extends TestUtils {
  public constructor(databaseClient: DatabaseClient) {
    super(databaseClient, emailEventTable);
  }

  public async create(emailEvent: EmailEvent): Promise<EmailEventRawEntity> {
    const rawEntities = await this.databaseClient<EmailEventRawEntity>(emailEventTable).insert(
      {
        createdAt: emailEvent.getCreatedAt(),
        id: emailEvent.getId(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payload: JSON.stringify(emailEvent.getPayload()) as any,
        status: emailEvent.getStatus(),
        eventName: emailEvent.getEmailEventName(),
      },
      '*',
    );

    return rawEntities[0] as EmailEventRawEntity;
  }

  public async createMany(emailEvents: EmailEvent[]): Promise<EmailEventRawEntity[]> {
    const rawEntities = await this.databaseClient<EmailEventRawEntity>(emailEventTable).insert(
      emailEvents.map((emailEvent) => ({
        createdAt: emailEvent.getCreatedAt(),
        id: emailEvent.getId(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payload: JSON.stringify(emailEvent.getPayload()) as any,
        status: emailEvent.getStatus(),
        eventName: emailEvent.getEmailEventName(),
      })),
      '*',
    );

    return rawEntities;
  }

  public async findById(id: string): Promise<EmailEventRawEntity | null> {
    const rawEntities = await this.databaseClient<EmailEventRawEntity>(emailEventTable).where({ id }).select('*');

    return rawEntities[0] ?? null;
  }

  public async findAll(): Promise<EmailEventRawEntity[]> {
    return this.databaseClient<EmailEventRawEntity>(emailEventTable).select('*');
  }
}
