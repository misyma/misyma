import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { type Writeable } from '../../../../../common/types/util/writeable.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type BookReading } from '../../../domain/entities/bookReading/bookReading.js';
import { type BookReadingDomainAction } from '../../../domain/entities/bookReading/bookReadingDomainActions/bookReadingDomainAction.js';
import { BookReadingDomainActionType } from '../../../domain/entities/bookReading/bookReadingDomainActions/bookReadingDomainActionType.js';
import { BookReadingDraft } from '../../../domain/entities/bookReading/bookReadingDraft/bookReadingDraft.js';
import {
  type BookReadingRepository,
  type DeletePayload,
  type FindByIdPayload,
  type FindByBookIdPayload,
  type SavePayload,
} from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';
import { type BookReadingRawEntity } from '../../databases/bookReadingsDatabase/tables/bookReadingTable/bookReadingRawEntity.js';
import { BookReadingTable } from '../../databases/bookReadingsDatabase/tables/bookReadingTable/bookReadingTable.js';
import { type BookReadingMapper } from '../mappers/bookReadingMapper/bookReadingMapper.js';

export class BookReadingRepositoryImpl implements BookReadingRepository {
  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    private readonly bookReadingMapper: BookReadingMapper,
    private readonly uuidService: UuidService,
    private readonly loggerService: LoggerService,
  ) {}

  private readonly table = new BookReadingTable();

  public async findById(payload: FindByIdPayload): Promise<BookReading | null> {
    const { id } = payload;

    let rawEntity: BookReadingRawEntity | undefined;

    try {
      const result = await this.sqliteDatabaseClient<BookReadingRawEntity>(this.table.name)
        .where(this.table.columns.id, id)
        .first();

      rawEntity = result;
    } catch (error) {
      this.loggerService.error({
        message: 'Error while finding bookReading by id.',
        context: {
          error,
        },
      });

      throw new RepositoryError({
        entity: 'BookReading',
        operation: 'find',
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.bookReadingMapper.mapToDomain(rawEntity);
  }

  public async findByBookId(payload: FindByBookIdPayload): Promise<BookReading[]> {
    const { bookId } = payload;

    let rawEntities: BookReadingRawEntity[];

    try {
      rawEntities = await this.sqliteDatabaseClient<BookReadingRawEntity>(this.table.name).where(
        this.table.columns.bookId,
        bookId,
      );
    } catch (error) {
      this.loggerService.error({
        message: 'Error while finding bookReading by book id.',
        context: {
          error,
        },
      });

      throw new RepositoryError({
        entity: 'BookReading',
        operation: 'find',
      });
    }

    return rawEntities.map((rawEntity) => this.bookReadingMapper.mapToDomain(rawEntity));
  }

  private async create(entity: BookReadingDraft): Promise<BookReading> {
    let rawEntity: BookReadingRawEntity;

    try {
      const result = await this.sqliteDatabaseClient<BookReadingRawEntity>(this.table.name).insert(
        {
          [this.table.columns.id]: this.uuidService.generateUuid(),
          [this.table.columns.bookId]: entity.getBookId(),
          [this.table.columns.rating]: entity.getRating(),
          [this.table.columns.comment]: entity.getComment(),
          [this.table.columns.startedAt]: entity.getStartedAt(),
          [this.table.columns.endedAt]: entity.getEndedAt(),
        },
        '*',
      );

      rawEntity = result[0] as BookReadingRawEntity;
    } catch (error) {
      this.loggerService.error({
        message: 'Error while creating BookReading.',
        context: {
          error,
        },
      });

      throw new RepositoryError({
        entity: 'BookReading',
        operation: 'create',
      });
    }

    return this.bookReadingMapper.mapToDomain(rawEntity);
  }

  private async update(entity: BookReading): Promise<BookReading> {
    const domainActions = entity.getDomainActions();

    if (domainActions.length === 0) {
      return entity;
    }

    const bookReadingRawEntity = this.mapDomainActionsToUpdatePayload(domainActions);

    let rawEntity: BookReadingRawEntity;

    try {
      const result = await this.sqliteDatabaseClient<BookReadingRawEntity>(this.table.name)
        .where(this.table.columns.id, entity.getId())
        .update(bookReadingRawEntity, '*');

      rawEntity = result[0] as BookReadingRawEntity;
    } catch (error) {
      this.loggerService.error({
        message: 'Error while updating BookReading.',
        context: {
          error,
        },
      });

      throw new RepositoryError({
        entity: 'BookReading',
        operation: 'update',
      });
    }

    return this.bookReadingMapper.mapToDomain(rawEntity);
  }

  public async save(payload: SavePayload): Promise<BookReading> {
    const { entity } = payload;

    if (entity instanceof BookReadingDraft) {
      return await this.create(entity);
    }

    return await this.update(entity);
  }

  private mapDomainActionsToUpdatePayload(domainActions: BookReadingDomainAction[]): Partial<BookReadingRawEntity> {
    let bookReadingRawEntity: Partial<Writeable<BookReadingRawEntity>> = {};

    domainActions.forEach((domainAction) => {
      switch (domainAction.actionName) {
        case BookReadingDomainActionType.updateComment:
          bookReadingRawEntity = {
            ...bookReadingRawEntity,
            [this.table.columns.comment]: domainAction.payload.comment,
          };

          break;

        case BookReadingDomainActionType.updateRating:
          bookReadingRawEntity = {
            ...bookReadingRawEntity,
            [this.table.columns.rating]: domainAction.payload.rating,
          };

          break;

        case BookReadingDomainActionType.updateStartedDate:
          bookReadingRawEntity = {
            ...bookReadingRawEntity,
            [this.table.columns.startedAt]: domainAction.payload.startedAt,
          };

          break;

        case BookReadingDomainActionType.updateEndedDate:
          bookReadingRawEntity = {
            ...bookReadingRawEntity,
            [this.table.columns.endedAt]: domainAction.payload.endedAt,
          };

          break;

        default:
          this.loggerService.error({
            message: 'Error mapping domain actions.',
            context: {
              domainAction,
            },
          });

          throw new RepositoryError({
            entity: 'BookReading',
            operation: 'update',
          });
      }
    });

    return bookReadingRawEntity;
  }

  public async delete(payload: DeletePayload): Promise<void> {
    const { entity } = payload;

    try {
      await this.sqliteDatabaseClient<BookReadingRawEntity>(this.table.name)
        .where(this.table.columns.id, entity.getId())
        .delete();
    } catch (error) {
      this.loggerService.error({
        message: 'Error while deleting bookReading.',
        context: {
          error,
        },
      });

      throw new RepositoryError({
        entity: 'BookReading',
        operation: 'delete',
      });
    }
  }
}
