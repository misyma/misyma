import { type BookChangeRequestMapper } from './bookChangeRequestMapper/bookChangeRequestMapper.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type BookChangeRequest } from '../../../domain/entities/bookChangeRequest/bookChangeRequest.js';
import {
  type BookChangeRequestRepository,
  type SaveBookChangeRequestPayload,
  type DeleteBookChangeRequestPayload,
  type FindBookChangeRequestsPayload,
  type FindBookChangeRequestPayload,
} from '../../../domain/repositories/bookChangeRequestRepository/bookChangeRequestRepository.js';
import { type BookChangeRequestRawEntity } from '../../databases/bookDatabase/tables/bookChangeRequestTable/bookChangeRequestRawEntity.js';
import { bookChangeRequestTable } from '../../databases/bookDatabase/tables/bookChangeRequestTable/bookChangeRequestTable.js';

export class BookChangeRequestRepositoryImpl implements BookChangeRequestRepository {
  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly bookChangeRequestMapper: BookChangeRequestMapper,
    private readonly uuidService: UuidService,
  ) {}

  public async saveBookChangeRequest(payload: SaveBookChangeRequestPayload): Promise<BookChangeRequest> {
    const {
      bookChangeRequest: {
        title,
        isbn,
        publisher,
        releaseYear,
        language,
        translator,
        format,
        pages,
        imageUrl,
        bookId,
        userId,
        createdAt,
        authorIds,
      },
    } = payload;

    let rawEntities: BookChangeRequestRawEntity[] = [];

    const id = this.uuidService.generateUuid();

    try {
      rawEntities = await this.databaseClient<BookChangeRequestRawEntity>(bookChangeRequestTable).insert(
        {
          id,
          title,
          isbn,
          publisher,
          releaseYear,
          language,
          translator,
          format,
          pages,
          imageUrl,
          bookId,
          userId,
          createdAt,
          authorIds: authorIds?.join(',') ?? undefined,
        },
        '*',
      );
    } catch (error) {
      throw new RepositoryError({
        entity: 'BookChangeRequest',
        operation: 'create',
        error,
      });
    }

    const rawEntity = rawEntities[0] as BookChangeRequestRawEntity;

    return this.bookChangeRequestMapper.mapToDomain(rawEntity);
  }

  public async findBookChangeRequest(payload: FindBookChangeRequestPayload): Promise<BookChangeRequest | null> {
    const { id } = payload;

    let rawEntity: BookChangeRequestRawEntity | undefined;

    try {
      rawEntity = await this.databaseClient<BookChangeRequestRawEntity>(bookChangeRequestTable).where({ id }).first();
    } catch (error) {
      throw new RepositoryError({
        entity: 'BookChangeRequest',
        operation: 'find',
        error,
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.bookChangeRequestMapper.mapToDomain(rawEntity);
  }

  public async findBookChangeRequests(payload: FindBookChangeRequestsPayload): Promise<BookChangeRequest[]> {
    const { page, pageSize, userId, id } = payload;

    let rawEntities: BookChangeRequestRawEntity[];

    try {
      const query = this.databaseClient<BookChangeRequestRawEntity>(bookChangeRequestTable)
        .limit(pageSize)
        .offset(pageSize * (page - 1));

      if (userId) {
        query.where({ userId });
      }

      if (id) {
        query.where({ id });
      }

      rawEntities = await query;
    } catch (error) {
      throw new RepositoryError({
        entity: 'BookChangeRequest',
        operation: 'find',
        error,
      });
    }

    return rawEntities.map((rawEntity) => this.bookChangeRequestMapper.mapToDomain(rawEntity));
  }

  public async deleteBookChangeRequest(payload: DeleteBookChangeRequestPayload): Promise<void> {
    const { id } = payload;

    try {
      await this.databaseClient<BookChangeRequestRawEntity>(bookChangeRequestTable).delete().where({ id });
    } catch (error) {
      throw new RepositoryError({
        entity: 'BookChangeRequest',
        operation: 'delete',
        error,
      });
    }
  }

  public async countBookChangeRequests(payload: FindBookChangeRequestsPayload): Promise<number> {
    const { userId } = payload;

    try {
      const query = this.databaseClient<BookChangeRequestRawEntity>(bookChangeRequestTable).count().first();

      if (userId) {
        query.where({ userId });
      }

      const countResult = await query;

      const count = countResult?.['count'];

      if (count === undefined) {
        throw new RepositoryError({
          entity: 'BookChangeRequest',
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
        entity: 'BookChangeRequest',
        operation: 'count',
        error,
      });
    }
  }
}
