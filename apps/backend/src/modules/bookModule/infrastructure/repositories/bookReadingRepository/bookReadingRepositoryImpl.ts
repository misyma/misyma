import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type UuidService } from '../../../../../libs/uuid/uuidService.js';
import { type BookReadingRawEntity } from '../../../../databaseModule/infrastructure/tables/bookReadingTable/bookReadingRawEntity.js';
import { bookReadingTable } from '../../../../databaseModule/infrastructure/tables/bookReadingTable/bookReadingTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { BookReading, type BookReadingState } from '../../../domain/entities/bookReading/bookReading.js';
import {
  type BookReadingRepository,
  type DeletePayload,
  type FindBookReadingPayload,
  type FindBookReadingsPayload,
  type SavePayload,
} from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';

import { type BookReadingMapper } from './bookReadingMapper/bookReadingMapper.js';

type CreateBookReadingPayload = { bookReading: BookReadingState };

type UpdateBookReadingPayload = { bookReading: BookReading };

export class BookReadingRepositoryImpl implements BookReadingRepository {
  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly bookReadingMapper: BookReadingMapper,
    private readonly uuidService: UuidService,
  ) {}

  public async findBookReading(payload: FindBookReadingPayload): Promise<BookReading | null> {
    const { id } = payload;

    let rawEntity: BookReadingRawEntity | undefined;

    try {
      rawEntity = await this.databaseClient<BookReadingRawEntity>(bookReadingTable).where({ id }).first();
    } catch (error) {
      throw new RepositoryError({
        entity: 'BookReading',
        operation: 'find',
        originalError: error,
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.bookReadingMapper.mapToDomain(rawEntity);
  }

  public async findBookReadings(payload: FindBookReadingsPayload): Promise<BookReading[]> {
    const { userBookId, page, pageSize, sortDate } = payload;

    let rawEntities: BookReadingRawEntity[];

    try {
      const query = this.databaseClient<BookReadingRawEntity>(bookReadingTable)
        .where({ userBookId })
        .limit(pageSize)
        .offset(pageSize * (page - 1));

      if (sortDate) {
        query.orderBy('startedAt', sortDate);
      }

      rawEntities = await query;
    } catch (error) {
      throw new RepositoryError({
        entity: 'BookReading',
        operation: 'find',
        originalError: error,
      });
    }

    return rawEntities.map((rawEntity) => this.bookReadingMapper.mapToDomain(rawEntity));
  }

  private async create(entity: CreateBookReadingPayload): Promise<BookReading> {
    const { bookReading } = entity;

    let rawEntity: BookReadingRawEntity;

    try {
      const result = await this.databaseClient<BookReadingRawEntity>(bookReadingTable).insert(
        {
          id: this.uuidService.generateUuid(),
          userBookId: bookReading.userBookId,
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
        originalError: error,
      });
    }

    return this.bookReadingMapper.mapToDomain(rawEntity);
  }

  private async update(payload: UpdateBookReadingPayload): Promise<BookReading> {
    const { bookReading } = payload;

    let rawEntity: BookReadingRawEntity;

    try {
      const result = await this.databaseClient<BookReadingRawEntity>(bookReadingTable)
        .where({ id: bookReading.getId() })
        .update(bookReading.getState(), '*');

      rawEntity = result[0] as BookReadingRawEntity;
    } catch (error) {
      throw new RepositoryError({
        entity: 'BookReading',
        operation: 'update',
        originalError: error,
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
      await this.databaseClient<BookReadingRawEntity>(bookReadingTable).where({ id }).delete();
    } catch (error) {
      throw new RepositoryError({
        entity: 'BookReading',
        operation: 'delete',
        originalError: error,
      });
    }
  }

  public async countBookReadings(payload: FindBookReadingsPayload): Promise<number> {
    const { userBookId } = payload;

    try {
      const countResult = await this.databaseClient<BookReadingRawEntity>(bookReadingTable)
        .where({ userBookId })
        .count()
        .first();

      const count = countResult?.['count'];

      if (count === undefined) {
        throw new RepositoryError({
          entity: 'BookReading',
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
        entity: 'BookReading',
        operation: 'count',
        originalError: error,
      });
    }
  }
}
