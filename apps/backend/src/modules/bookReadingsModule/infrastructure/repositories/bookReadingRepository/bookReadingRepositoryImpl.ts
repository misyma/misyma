import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { BookReading, type BookReadingState } from '../../../domain/entities/bookReading/bookReading.js';
import {
  type BookReadingRepository,
  type DeletePayload,
  type FindBookReadingPayload,
  type FindBookReadingsPayload,
  type SavePayload,
} from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';
import { type BookReadingRawEntity } from '../../databases/bookReadingsDatabase/tables/bookReadingTable/bookReadingRawEntity.js';
import { BookReadingTable } from '../../databases/bookReadingsDatabase/tables/bookReadingTable/bookReadingTable.js';
import { type BookReadingMapper } from '../mappers/bookReadingMapper/bookReadingMapper.js';

type CreateBookReadingPayload = { bookReading: BookReadingState };

type UpdateBookReadingPayload = { bookReading: BookReading };

export class BookReadingRepositoryImpl implements BookReadingRepository {
  public constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    private readonly bookReadingMapper: BookReadingMapper,
    private readonly uuidService: UuidService,
  ) {}

  private readonly table = new BookReadingTable();

  public async findBookReading(payload: FindBookReadingPayload): Promise<BookReading | null> {
    const { id } = payload;

    let rawEntity: BookReadingRawEntity | undefined;

    try {
      rawEntity = await this.sqliteDatabaseClient<BookReadingRawEntity>(this.table.name).where({ id }).first();
    } catch (error) {
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

  public async findBookReadings(payload: FindBookReadingsPayload): Promise<BookReading[]> {
    const { bookId } = payload;

    let rawEntities: BookReadingRawEntity[];

    try {
      rawEntities = await this.sqliteDatabaseClient<BookReadingRawEntity>(this.table.name).where({ bookId });
    } catch (error) {
      throw new RepositoryError({
        entity: 'BookReading',
        operation: 'find',
      });
    }

    return rawEntities.map((rawEntity) => this.bookReadingMapper.mapToDomain(rawEntity));
  }

  private async create(entity: CreateBookReadingPayload): Promise<BookReading> {
    const { bookReading } = entity;

    let rawEntity: BookReadingRawEntity;

    try {
      const result = await this.sqliteDatabaseClient<BookReadingRawEntity>(this.table.name).insert(
        {
          id: this.uuidService.generateUuid(),
          bookId: bookReading.bookId,
          rating: bookReading.rating,
          comment: bookReading.comment,
          startedAt: bookReading.startedAt,
          endedAt: bookReading.endedAt,
        },
        '*',
      );

      rawEntity = result[0] as BookReadingRawEntity;
    } catch (error) {
      throw new RepositoryError({
        entity: 'BookReading',
        operation: 'create',
      });
    }

    return this.bookReadingMapper.mapToDomain(rawEntity);
  }

  private async update(payload: UpdateBookReadingPayload): Promise<BookReading> {
    const { bookReading } = payload;

    let rawEntity: BookReadingRawEntity;

    try {
      const result = await this.sqliteDatabaseClient<BookReadingRawEntity>(this.table.name)
        .where({ id: bookReading.getId() })
        .update(bookReading.getState(), '*');

      rawEntity = result[0] as BookReadingRawEntity;
    } catch (error) {
      throw new RepositoryError({
        entity: 'BookReading',
        operation: 'update',
      });
    }

    return this.bookReadingMapper.mapToDomain(rawEntity);
  }

  public async saveBookReading(payload: SavePayload): Promise<BookReading> {
    const { bookReading } = payload;

    if (bookReading instanceof BookReading) {
      return this.update({ bookReading });
    }

    return this.create({ bookReading });
  }

  public async deleteBookReading(payload: DeletePayload): Promise<void> {
    const { id } = payload;

    try {
      await this.sqliteDatabaseClient<BookReadingRawEntity>(this.table.name).where({ id }).delete();
    } catch (error) {
      throw new RepositoryError({
        entity: 'BookReading',
        operation: 'delete',
      });
    }
  }
}
