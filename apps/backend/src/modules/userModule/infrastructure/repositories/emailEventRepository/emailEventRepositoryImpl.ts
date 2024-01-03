import { type EmailEventMapper } from './mappers/emailEventMapper/emailEventMapper.js';
import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type EmailEvent } from '../../../domain/entities/emailEvent/emailEvent.js';
import { type EmailEventDraft } from '../../../domain/entities/emailEvent/emailEventDraft.ts/emailEventDraft.js';
import { EmailEventStatus } from '../../../domain/entities/emailEvent/types/emailEventStatus.js';
import {
  type UpdateStatusPayload,
  type EmailEventRepository,
  type FindAllCreatedAfterPayload,
} from '../../../domain/repositories/emailEventRepository/emailEventRepository.js';
import {
  type EmailPayload,
  type EmailEventRawEntity,
} from '../../databases/userEventsDatabase/tables/emailEventTable/emailEventRawEntity.js';
import { EmailEventTable } from '../../databases/userEventsDatabase/tables/emailEventTable/emailEventTable.js';

export class EmailEventRepositoryImpl implements EmailEventRepository {
  private readonly databaseTable = new EmailEventTable();

  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    private readonly uuidService: UuidService,
    private readonly emailEventMapper: EmailEventMapper,
  ) {}

  private createQueryBuilder(): QueryBuilder<EmailEventRawEntity> {
    return this.sqliteDatabaseClient<EmailEventRawEntity>(this.databaseTable.name);
  }

  public async findAllCreatedAfter(payload: FindAllCreatedAfterPayload): Promise<EmailEvent[]> {
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

    return rawEntities.map((rawEntity) => this.emailEventMapper.map(rawEntity));
  }

  public async findAllUnprocessed(): Promise<EmailEvent[]> {
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

    return rawEntities.map((rawEntity) => this.emailEventMapper.map(rawEntity));
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

  public async create(entity: EmailEventDraft): Promise<void> {
    const queryBuilder = this.createQueryBuilder();

    try {
      await queryBuilder.insert({
        createdAt: new Date(),
        id: this.uuidService.generateUuid(),
        payload: JSON.stringify(entity.getPayload()) as unknown as EmailPayload,
        status: EmailEventStatus.pending,
      });
    } catch (error) {
      throw new RepositoryError({
        entity: 'EmailEvent',
        operation: 'create',
      });
    }
  }

  public async deleteProcessed(): Promise<void> {
    try {
      const queryBuilder = this.createQueryBuilder();

      await queryBuilder.where(this.databaseTable.columns.status, '=', EmailEventStatus.processed).delete();
    } catch (error) {
      throw new RepositoryError({
        entity: 'EmailEvent',
        operation: 'delete',
      });
    }
  }
}
