import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { type Writeable } from '../../../../../common/types/util/writeable.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type QueryBuilder } from '../../../../../libs/database/types/queryBuilder.js';
import { type Transaction } from '../../../../../libs/database/types/transaction.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import {
  type BookshelfRepository,
  type DeletePayload,
  type FindByIdPayload,
  type FindByUserIdPayload,
  type SavePayload,
} from '../../../domain/repositories/bookshelfRepository.js';
import { type Bookshelf } from '../../../domain/repositories/entities/bookshelf/bookshelf.js';
import { type BookshelfDomainAction } from '../../../domain/repositories/entities/bookshelf/bookshelfDomainActions/bookshelfDomainAction.js';
import { BookshelfDomainActionType } from '../../../domain/repositories/entities/bookshelf/bookshelfDomainActions/bookshelfDomainActionType.js';
import { BookshelfDraft } from '../../../domain/repositories/entities/bookshelf/bookshelfDraft/bookshelfDraft.js';
import { type BookshelfRawEntity } from '../../databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfRawEntity.js';
import { BookshelfTable } from '../../databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfTable.js';
import { type BookshelfMapper } from '../mappers/bookshelfMapper/bookshelfMapper.js';

export class BookshelfRepositoryImpl implements BookshelfRepository {
  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    private readonly bookshelfMapper: BookshelfMapper,
    private readonly uuidService: UuidService,
    private readonly loggerService: LoggerService,
  ) {}

  private readonly table = new BookshelfTable();

  private createQueryBuilder(transaction?: Transaction): QueryBuilder<BookshelfRawEntity> {
    if (transaction) {
      return this.sqliteDatabaseClient(this.table.name).transacting(transaction);
    }

    return this.sqliteDatabaseClient(this.table.name);
  }

  public async findById(payload: FindByIdPayload): Promise<Bookshelf | null> {
    const { id } = payload;

    let rawEntity: BookshelfRawEntity | undefined;

    try {
      const result = await this.createQueryBuilder().where(this.table.columns.id, id).first();

      rawEntity = result;
    } catch (error) {
      this.loggerService.error({
        message: 'Error while finding bookshelf by id.',
        context: {
          error,
        },
      });

      throw new RepositoryError({
        entity: 'Bookshelf',
        operation: 'find',
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.bookshelfMapper.mapToDomain(rawEntity);
  }

  public async findByUserId(payload: FindByUserIdPayload): Promise<Bookshelf[]> {
    const { userId } = payload;

    let rawEntities: BookshelfRawEntity[];

    try {
      const result = await this.createQueryBuilder().where(this.table.columns.userId, userId);

      rawEntities = result;
    } catch (error) {
      this.loggerService.error({
        message: 'Error while finding bookshelf by user id.',
        context: {
          error,
        },
      });

      throw new RepositoryError({
        entity: 'Bookshelf',
        operation: 'find',
      });
    }

    return rawEntities.map((rawEntity) => this.bookshelfMapper.mapToDomain(rawEntity));
  }

  private async create(entity: BookshelfDraft): Promise<Bookshelf> {
    let rawEntity: BookshelfRawEntity;

    try {
      const result = await this.createQueryBuilder().insert(
        {
          [this.table.columns.id]: this.uuidService.generateUuid(),
          [this.table.columns.name]: entity.getName(),
          [this.table.columns.userId]: entity.getUserId(),
          [this.table.columns.addressId]: entity.getAddressId(),
        },
        '*',
      );

      rawEntity = result[0] as BookshelfRawEntity;
    } catch (error) {
      this.loggerService.error({
        message: 'Error while creating bookshelf.',
        context: {
          error,
        },
      });

      throw new RepositoryError({
        entity: 'Bookshelf',
        operation: 'create',
      });
    }

    return this.bookshelfMapper.mapToDomain(rawEntity);
  }

  private async update(entity: Bookshelf): Promise<Bookshelf> {
    const domainActions = entity.getDomainActions();

    if (domainActions.length === 0) {
      return entity;
    }

    const bookshelfRawEntity = this.mapDomainActionsToUpdatePayload(domainActions);

    let rawEntity: BookshelfRawEntity;

    try {
      const result = await this.createQueryBuilder()
        .where(this.table.columns.id, entity.getId())
        .update(bookshelfRawEntity, '*');

      rawEntity = result[0] as BookshelfRawEntity;
    } catch (error) {
      this.loggerService.error({
        message: 'Error while updating bookshelf.',
        context: {
          error,
        },
      });

      throw new RepositoryError({
        entity: 'Bookshelf',
        operation: 'update',
      });
    }

    return this.bookshelfMapper.mapToDomain(rawEntity);
  }

  public async save(payload: SavePayload): Promise<Bookshelf> {
    const { entity } = payload;

    if (entity instanceof BookshelfDraft) {
      return await this.create(entity);
    }

    return await this.update(entity);
  }

  private mapDomainActionsToUpdatePayload(domainActions: BookshelfDomainAction[]): Partial<BookshelfRawEntity> {
    let bookshelfRawEntity: Partial<Writeable<BookshelfRawEntity>> = {};

    domainActions.forEach((domainAction) => {
      switch (domainAction.actionName) {
        case BookshelfDomainActionType.updateName:
          bookshelfRawEntity = {
            ...bookshelfRawEntity,
            [this.table.columns.name]: domainAction.payload.name,
          };

          break;

        case BookshelfDomainActionType.updateAddressId:
          bookshelfRawEntity = {
            ...bookshelfRawEntity,
            [this.table.columns.addressId]: domainAction.payload.addressId,
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
            entity: 'User',
            operation: 'update',
          });
      }
    });

    return bookshelfRawEntity;
  }

  public async delete(payload: DeletePayload): Promise<void> {
    const { entity } = payload;

    try {
      await this.createQueryBuilder().where(this.table.columns.id, entity.getId()).delete();
    } catch (error) {
      this.loggerService.error({
        message: 'Error while deleting bookshelf.',
        context: {
          error,
        },
      });

      throw new RepositoryError({
        entity: 'Bookshelf',
        operation: 'delete',
      });
    }
  }
}
