import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import { type EmailEvent } from '../../../domain/entities/emailEvent/emailEvent.js';
import { type EmailEventRawEntity } from '../../../infrastructure/databases/userEventsDatabase/tables/emailEventTable/emailEventRawEntity.js';
import { EmailEventTable } from '../../../infrastructure/databases/userEventsDatabase/tables/emailEventTable/emailEventTable.js';

export class EmailEventTestUtils {
  public constructor(private readonly sqliteDatabaseClient: SqliteDatabaseClient) {}

  private readonly emailEventsTable = new EmailEventTable();

  private createQueryBuilder(): QueryBuilder<EmailEventRawEntity> {
    return this.sqliteDatabaseClient<EmailEventRawEntity>(this.emailEventsTable.name);
  }

  public async create(emailEvent: EmailEvent): Promise<EmailEventRawEntity> {
    const queryBuilder = this.createQueryBuilder();

    const rawEntities = await queryBuilder.insert(
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
    const queryBuilder = this.createQueryBuilder();

    const rawEntities = await queryBuilder.insert(
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
    const queryBuilder = this.createQueryBuilder();

    const rawEntities = await queryBuilder.where(this.emailEventsTable.columns.id, '=', id).select('*');

    return rawEntities[0] ?? null;
  }

  public async findAll(): Promise<EmailEventRawEntity[]> {
    const queryBuilder = this.createQueryBuilder();

    return queryBuilder.select('*');
  }

  public async truncate(): Promise<void> {
    await this.sqliteDatabaseClient('emailEvents').truncate();
  }
}
