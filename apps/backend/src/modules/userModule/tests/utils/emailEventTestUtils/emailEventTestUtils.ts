import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type EmailEvent } from '../../../domain/entities/emailEvent/emailEvent.js';
import { type EmailEventRawEntity } from '../../../infrastructure/databases/userEventsDatabase/tables/emailEventTable/emailEventRawEntity.js';
import { EmailEventTable } from '../../../infrastructure/databases/userEventsDatabase/tables/emailEventTable/emailEventTable.js';

export class EmailEventTestUtils {
  public constructor(private readonly databaseClient: DatabaseClient) {}

  private readonly emailEventsTable = new EmailEventTable();

  public async create(emailEvent: EmailEvent): Promise<EmailEventRawEntity> {
    const rawEntities = await this.databaseClient<EmailEventRawEntity>(this.emailEventsTable.name).insert(
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
    const rawEntities = await this.databaseClient<EmailEventRawEntity>(this.emailEventsTable.name).insert(
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
    const rawEntities = await this.databaseClient<EmailEventRawEntity>(this.emailEventsTable.name)
      .where({ id })
      .select('*');

    return rawEntities[0] ?? null;
  }

  public async findAll(): Promise<EmailEventRawEntity[]> {
    return this.databaseClient<EmailEventRawEntity>(this.emailEventsTable.name).select('*');
  }

  public async truncate(): Promise<void> {
    await this.databaseClient(this.emailEventsTable.name).truncate();
  }
}
