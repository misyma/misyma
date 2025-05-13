import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type UuidService } from '../../../../../libs/uuid/uuidService.js';
import { type EmailEventRawEntity } from '../../../../databaseModule/infrastructure/tables/emailEventsTable/emailEventRawEntity.js';
import { emailEventsTable } from '../../../../databaseModule/infrastructure/tables/emailEventsTable/emailEventsTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type EmailEventDraft, type EmailEvent } from '../../../domain/entities/emailEvent/emailEvent.js';
import { emailEventStatuses } from '../../../domain/entities/emailEvent/types/emailEventStatus.js';
import {
  type UpdateStatusPayload,
  type EmailEventRepository,
  type FindAllCreatedAfterPayload,
} from '../../../domain/repositories/emailEventRepository/emailEventRepository.js';

import { type EmailEventMapper } from './emailEventMapper/emailEventMapper.js';

export class EmailEventRepositoryImpl implements EmailEventRepository {
  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly uuidService: UuidService,
    private readonly emailEventMapper: EmailEventMapper,
  ) {}

  public async findAllCreatedAfter(payload: FindAllCreatedAfterPayload): Promise<EmailEvent[]> {
    const { after } = payload;

    let rawEntities: EmailEventRawEntity[];

    try {
      rawEntities = await this.databaseClient<EmailEventRawEntity>(emailEventsTable)
        .where('created_at', '>=', after)
        .select('*');
    } catch (error) {
      throw new RepositoryError({
        entity: 'EmailEvent',
        operation: 'find',
        originalError: error,
      });
    }

    return rawEntities.map((rawEntity) => this.emailEventMapper.map(rawEntity));
  }

  public async findAllPending(): Promise<EmailEvent[]> {
    let rawEntities: EmailEventRawEntity[];

    try {
      rawEntities = await this.databaseClient<EmailEventRawEntity>(emailEventsTable)
        .where({ status: emailEventStatuses.pending })
        .select('*');
    } catch (error) {
      throw new RepositoryError({
        entity: 'EmailEvent',
        operation: 'find',
        originalError: error,
      });
    }

    return rawEntities.map((rawEntity) => this.emailEventMapper.map(rawEntity));
  }

  public async updateStatus(payload: UpdateStatusPayload): Promise<void> {
    const { id, status } = payload;

    try {
      await this.databaseClient<EmailEventRawEntity>(emailEventsTable).where({ id }).update({
        status,
      });
    } catch (error) {
      throw new RepositoryError({
        entity: 'EmailEvent',
        operation: 'update',
        originalError: error,
      });
    }
  }

  public async create(entity: EmailEventDraft): Promise<void> {
    try {
      await this.databaseClient<EmailEventRawEntity>(emailEventsTable).insert({
        created_at: new Date(),
        id: this.uuidService.generateUuid(),
        payload: JSON.stringify(entity.getPayload()),
        status: emailEventStatuses.pending,
        event_name: entity.getEmailEventName(),
      });
    } catch (error) {
      throw new RepositoryError({
        entity: 'EmailEvent',
        operation: 'create',
        originalError: error,
      });
    }
  }

  public async deleteProcessed(): Promise<void> {
    try {
      await this.databaseClient<EmailEventRawEntity>(emailEventsTable)
        .where({ status: emailEventStatuses.processed })
        .delete();
    } catch (error) {
      throw new RepositoryError({
        entity: 'EmailEvent',
        operation: 'delete',
        originalError: error,
      });
    }
  }
}
