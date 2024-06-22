import { type BookshelfMapper } from './bookshelfMapper/bookshelfMapper.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { Bookshelf, type BookshelfState } from '../../../domain/entities/bookshelf/bookshelf.js';
import {
  type CountBookshelvesPayload,
  type BookshelfRepository,
  type DeleteBookshelfPayload,
  type FindBookshelfPayload,
  type FindBookshelvesPayload,
  type SaveBookshelfPayload,
} from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type BookshelfRawEntity } from '../../databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfRawEntity.js';
import { bookshelfTable } from '../../databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfTable.js';

type CreateBookshelfPayload = { bookshelf: BookshelfState };

type UpdateBookshelfPayload = { bookshelf: Bookshelf };

export class BookshelfRepositoryImpl implements BookshelfRepository {
  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly bookshelfMapper: BookshelfMapper,
    private readonly uuidService: UuidService,
  ) {}

  public async findBookshelf(payload: FindBookshelfPayload): Promise<Bookshelf | null> {
    let rawEntity: BookshelfRawEntity | undefined;

    let whereCondition: Partial<BookshelfRawEntity> = {};

    const { where } = payload;

    if ('id' in where) {
      whereCondition = {
        ...whereCondition,
        id: where.id,
      };
    } else {
      whereCondition = {
        ...whereCondition,
        userId: where.userId,
        name: where.name,
      };
    }

    try {
      const result = await this.databaseClient<BookshelfRawEntity>(bookshelfTable).where(whereCondition).first();

      rawEntity = result;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Bookshelf',
        operation: 'find',
        error,
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.bookshelfMapper.mapToDomain(rawEntity);
  }

  public async findBookshelves(payload: FindBookshelvesPayload): Promise<Bookshelf[]> {
    const { userId, ids, page, pageSize, type, sortDate } = payload;

    let rawEntities: BookshelfRawEntity[];

    let whereClause: Partial<BookshelfRawEntity> = {};

    if (type) {
      whereClause = {
        ...whereClause,
        type,
      };
    }

    if (userId) {
      whereClause = {
        ...whereClause,
        userId,
      };
    }

    const query = this.databaseClient<BookshelfRawEntity>(bookshelfTable);

    if (Object.entries(whereClause).length > 0) {
      query.where(whereClause);
    }

    if (ids) {
      query.whereIn('id', ids);
    }

    if (sortDate) {
      query.orderBy('createdAt', sortDate);
    }

    try {
      rawEntities = await query.limit(pageSize).offset(pageSize * (page - 1));
    } catch (error) {
      throw new RepositoryError({
        entity: 'Bookshelf',
        operation: 'find',
        error,
      });
    }

    return rawEntities.map((rawEntity) => this.bookshelfMapper.mapToDomain(rawEntity));
  }

  public async saveBookshelf(payload: SaveBookshelfPayload): Promise<Bookshelf> {
    const { bookshelf } = payload;

    if (bookshelf instanceof Bookshelf) {
      return this.update({ bookshelf });
    }

    return this.create({ bookshelf });
  }

  private async create(payload: CreateBookshelfPayload): Promise<Bookshelf> {
    const { bookshelf } = payload;

    let rawEntity: BookshelfRawEntity;

    try {
      const result = await this.databaseClient<BookshelfRawEntity>(bookshelfTable).insert(
        {
          id: this.uuidService.generateUuid(),
          name: bookshelf.name,
          userId: bookshelf.userId,
          type: bookshelf.type,
          createdAt: bookshelf.createdAt,
        },
        '*',
      );

      rawEntity = result[0] as BookshelfRawEntity;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Bookshelf',
        operation: 'create',
        error,
      });
    }

    return this.bookshelfMapper.mapToDomain(rawEntity);
  }

  private async update(payload: UpdateBookshelfPayload): Promise<Bookshelf> {
    const { bookshelf } = payload;

    let rawEntity: BookshelfRawEntity;

    try {
      const result = await this.databaseClient<BookshelfRawEntity>(bookshelfTable)
        .where({ id: bookshelf.getId() })
        .update(bookshelf.getState(), '*');

      rawEntity = result[0] as BookshelfRawEntity;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Bookshelf',
        operation: 'update',
        error,
      });
    }

    return this.bookshelfMapper.mapToDomain(rawEntity);
  }

  public async deleteBookshelf(payload: DeleteBookshelfPayload): Promise<void> {
    const { id } = payload;

    try {
      await this.databaseClient<BookshelfRawEntity>(bookshelfTable).where({ id }).delete();
    } catch (error) {
      throw new RepositoryError({
        entity: 'Bookshelf',
        operation: 'delete',
        error,
      });
    }
  }

  public async countBookshelves(payload: CountBookshelvesPayload): Promise<number> {
    const { userId } = payload;

    try {
      const countResult = await this.databaseClient<BookshelfRawEntity>(bookshelfTable)
        .where({ userId })
        .count()
        .first();

      const count = countResult?.['count(*)'];

      if (count === undefined) {
        throw new RepositoryError({
          entity: 'Bookshelf',
          operation: 'count',
          countResult,
        });
      }

      if (typeof count === 'string') {
        return parseInt(count, 10);
      }

      return count;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Bookshelf',
        operation: 'count',
        error,
      });
    }
  }
}
