import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { Bookshelf, type BookshelfState } from '../../../domain/entities/bookshelf/bookshelf.js';
import {
  type BookshelfRepository,
  type DeleteBookshelfPayload,
  type FindBookshelfPayload,
  type FindBookshelvesPayload,
  type SaveBookshelfPayload,
} from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { type BookshelfRawEntity } from '../../databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfRawEntity.js';
import { BookshelfTable } from '../../databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfTable.js';
import { type BookshelfMapper } from '../mappers/bookshelfMapper/bookshelfMapper.js';

type CreateBookshelfPayload = { bookshelf: BookshelfState };

type UpdateBookshelfPayload = { bookshelf: Bookshelf };

export class BookshelfRepositoryImpl implements BookshelfRepository {
  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly bookshelfMapper: BookshelfMapper,
    private readonly uuidService: UuidService,
  ) {}

  private readonly table = new BookshelfTable();

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
      const result = await this.databaseClient<BookshelfRawEntity>(this.table.name).where(whereCondition).first();

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
    const { userId } = payload;

    let rawEntities: BookshelfRawEntity[];

    try {
      const result = await this.databaseClient<BookshelfRawEntity>(this.table.name).where({ userId });

      rawEntities = result;
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
      const result = await this.databaseClient<BookshelfRawEntity>(this.table.name).insert(
        {
          id: this.uuidService.generateUuid(),
          name: bookshelf.name,
          userId: bookshelf.userId,
          address: bookshelf.address,
          imageUrl: bookshelf.imageUrl,
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
      const result = await this.databaseClient<BookshelfRawEntity>(this.table.name)
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
      await this.databaseClient<BookshelfRawEntity>(this.table.name).where({ id }).delete();
    } catch (error) {
      throw new RepositoryError({
        entity: 'Bookshelf',
        operation: 'delete',
        error,
      });
    }
  }
}
