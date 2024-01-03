import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import {
  type UpdateStatusPayload,
  type EmailEventRepository,
  type FindAllCreatedAfterPayload,
} from '../../../domain/repositories/emailEventRepository/emailEventRepository.js';
import { type EmailEventRawEntity } from '../../databases/userEventsDatabase/tables/emailEventTable/emailEventRawEntity.js';
import { EmailEventTable } from '../../databases/userEventsDatabase/tables/emailEventTable/emailEventTable.js';

export class EmailEventRepositoryImpl implements EmailEventRepository {
  private readonly databaseTable = new EmailEventTable();

  public constructor(private readonly sqliteDatabaseClient: SqliteDatabaseClient) {}

  private createQueryBuilder(): QueryBuilder<EmailEventRawEntity> {
    return this.sqliteDatabaseClient<EmailEventRawEntity>(this.databaseTable.name);
  }

  public async findAllCreatedAfter(payload: FindAllCreatedAfterPayload): Promise<unknown[]> {
    const { after } = payload;

    const queryBuilder = this.createQueryBuilder();

    let rawEntities: EmailEventRawEntity[];

    try {
      rawEntities = await queryBuilder.where(this.databaseTable.columns.createdAt, '>=', after).select('*');
    } catch (error) {
      throw new RepositoryError({
        entity: 'EmailEvent',
        operation: 'find',
      });
    }

    return rawEntities;
  }

  public async findAllUnprocessed(): Promise<unknown[]> {
    const queryBuilder = this.createQueryBuilder();

    let rawEntities: EmailEventRawEntity[];

    try {
      rawEntities = await queryBuilder.where(this.databaseTable.columns.status, '=', 'unprocessed').select('*');
    } catch (error) {
      throw new RepositoryError({
        entity: 'EmailEvent',
        operation: 'find',
      });
    }

    return rawEntities;
  }

  public async updateStatus(payload: UpdateStatusPayload): Promise<void> {
    const { id, status } = payload;

    const queryBuilder = this.createQueryBuilder();

    try {
      await queryBuilder.where(this.databaseTable.columns.id, '=', id).update({
        [this.databaseTable.columns.status]: status,
      });
    } catch (error) {
      throw new RepositoryError({
        entity: 'EmailEvent',
        operation: 'update',
      });
    }
  }

  public async deleteProcessed(): Promise<void> {
    try {
      const queryBuilder = this.createQueryBuilder();

      await queryBuilder.where(this.databaseTable.columns.status, '=', 'processed').delete();
    } catch (error) {
      throw new RepositoryError({
        entity: 'EmailEvent',
        operation: 'delete',
      });
    }
  }
}
