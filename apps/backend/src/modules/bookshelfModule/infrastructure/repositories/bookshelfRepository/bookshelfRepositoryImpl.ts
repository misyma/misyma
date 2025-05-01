import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type UuidService } from '../../../../../libs/uuid/uuidService.js';
import { type BookshelfRawEntity } from '../../../../databaseModule/infrastructure/tables/bookshelfTable/bookshelfRawEntity.js';
import { bookshelvesTable } from '../../../../databaseModule/infrastructure/tables/bookshelfTable/bookshelfTable.js';
import { type BookshelfWithJoinsRawEntity } from '../../../../databaseModule/infrastructure/tables/bookshelfTable/bookshelfWithJoinsRawEntity.js';
import { usersBooksTable } from '../../../../databaseModule/infrastructure/tables/userBookTable/userBookTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { Bookshelf, type BookshelfState } from '../../../domain/entities/bookshelf/bookshelf.js';
import {
  type CountBookshelvesPayload,
  type BookshelfRepository,
  type DeleteBookshelfPayload,
  type FindBookshelfPayload,
  type FindBookshelvesPayload,
  type SaveBookshelfPayload,
} from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';

import { type BookshelfMapper } from './bookshelfMapper/bookshelfMapper.js';

type CreateBookshelfPayload = { bookshelf: BookshelfState };

type UpdateBookshelfPayload = { bookshelf: Bookshelf };

export class BookshelfRepositoryImpl implements BookshelfRepository {
  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly bookshelfMapper: BookshelfMapper,
    private readonly uuidService: UuidService,
  ) {}

  public async findBookshelf(payload: FindBookshelfPayload): Promise<Bookshelf | null> {
    const { where } = payload;

    let rawEntities: BookshelfWithJoinsRawEntity[];

    try {
      const query = this.databaseClient<BookshelfWithJoinsRawEntity>(bookshelvesTable)
        .select([
          `${bookshelvesTable}.id`,
          `${bookshelvesTable}.name`,
          `${bookshelvesTable}.userId`,
          `${bookshelvesTable}.type`,
          `${bookshelvesTable}.createdAt`,
          `${bookshelvesTable}.imageUrl`,
          this.databaseClient.raw(`COUNT("bookId") as "bookCount"`),
        ])
        .leftJoin(usersBooksTable, (join) => {
          join.on(`${usersBooksTable}.bookshelfId`, '=', `${bookshelvesTable}.id`);
        })
        .groupBy(`${bookshelvesTable}.id`);

      if ('id' in where) {
        query.where(`${bookshelvesTable}.id`, where.id);
      } else {
        query.where(`${bookshelvesTable}.userId`, where.userId).where(`${bookshelvesTable}.name`, where.name);
      }

      rawEntities = await query;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Bookshelf',
        operation: 'find',
        originalError: error,
      });
    }

    if (!rawEntities.length) {
      return null;
    }

    return this.bookshelfMapper.mapRawWithJoinsToDomain(rawEntities)[0] as Bookshelf;
  }

  public async findBookshelves(payload: FindBookshelvesPayload): Promise<Bookshelf[]> {
    const { userId, name, page, pageSize, type, sortDate } = payload;

    const query = this.databaseClient<BookshelfWithJoinsRawEntity>(bookshelvesTable)
      .select([
        `${bookshelvesTable}.id`,
        `${bookshelvesTable}.name`,
        `${bookshelvesTable}.userId`,
        `${bookshelvesTable}.type`,
        `${bookshelvesTable}.createdAt`,
        `${bookshelvesTable}.imageUrl`,
        this.databaseClient.raw(`COUNT("bookId") as "bookCount"`),
      ])
      .leftJoin(usersBooksTable, (join) => {
        join.on(`${usersBooksTable}.bookshelfId`, '=', `${bookshelvesTable}.id`);
      })
      .groupBy(`${bookshelvesTable}.id`);

    if (type !== undefined) {
      query.where(`${bookshelvesTable}.type`, type);
    }

    if (userId) {
      query.where(`${bookshelvesTable}.userId`, userId);
    }

    if (name) {
      query.whereRaw('name ILIKE ?', `%${name}%`);
    }

    if (sortDate) {
      query.orderBy('id', sortDate);
    }

    let rawEntities: BookshelfWithJoinsRawEntity[];

    try {
      rawEntities = await query.limit(pageSize).offset(pageSize * (page - 1));
    } catch (error) {
      throw new RepositoryError({
        entity: 'Bookshelf',
        operation: 'find',
        originalError: error,
      });
    }

    return this.bookshelfMapper.mapRawWithJoinsToDomain(rawEntities);
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
      const result = await this.databaseClient<BookshelfRawEntity>(bookshelvesTable).insert(
        {
          id: this.uuidService.generateUuid(),
          name: bookshelf.name,
          userId: bookshelf.userId,
          type: bookshelf.type,
          createdAt: bookshelf.createdAt,
          imageUrl: bookshelf.imageUrl,
        },
        '*',
      );

      rawEntity = result[0] as BookshelfRawEntity;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Bookshelf',
        operation: 'create',
        originalError: error,
      });
    }

    return this.bookshelfMapper.mapToDomain(rawEntity);
  }

  private async update(payload: UpdateBookshelfPayload): Promise<Bookshelf> {
    const { bookshelf } = payload;

    const { name, imageUrl } = bookshelf.getState();

    let rawEntity: BookshelfRawEntity;

    try {
      const result = await this.databaseClient<BookshelfRawEntity>(bookshelvesTable)
        .where({ id: bookshelf.getId() })
        .update(
          {
            name,
            imageUrl,
          },
          '*',
        );

      rawEntity = result[0] as BookshelfRawEntity;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Bookshelf',
        operation: 'update',
        originalError: error,
      });
    }

    return this.bookshelfMapper.mapToDomain(rawEntity);
  }

  public async deleteBookshelf(payload: DeleteBookshelfPayload): Promise<void> {
    const { id } = payload;

    try {
      await this.databaseClient<BookshelfRawEntity>(bookshelvesTable).where({ id }).delete();
    } catch (error) {
      throw new RepositoryError({
        entity: 'Bookshelf',
        operation: 'delete',
        originalError: error,
      });
    }
  }

  public async countBookshelves(payload: CountBookshelvesPayload): Promise<number> {
    const { userId, name } = payload;

    try {
      const query = this.databaseClient<BookshelfRawEntity>(bookshelvesTable).where({ userId });

      if (name) {
        query.whereRaw('name ILIKE ?', `%${name}%`);
      }

      const countResult = await query.count().first();

      const count = countResult?.['count'];

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
        originalError: error,
      });
    }
  }
}
