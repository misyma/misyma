import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type UuidService } from '../../../../../libs/uuid/uuidService.js';
import { type BookChangeRequestRawEntity } from '../../../../databaseModule/infrastructure/tables/booksChangeRequestsTable/bookChangeRequestRawEntity.js';
import { type BookChangeRequestWithJoinsRawEntity } from '../../../../databaseModule/infrastructure/tables/booksChangeRequestsTable/bookChangeRequestWithJoinsRawEntity.js';
import { booksChangeRequestsTable } from '../../../../databaseModule/infrastructure/tables/booksChangeRequestsTable/booksChangeRequestsTable.js';
import { booksTable } from '../../../../databaseModule/infrastructure/tables/booksTable/booksTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type BookChangeRequest } from '../../../domain/entities/bookChangeRequest/bookChangeRequest.js';
import {
  type BookChangeRequestRepository,
  type SaveBookChangeRequestPayload,
  type DeleteBookChangeRequestPayload,
  type FindBookChangeRequestsPayload,
  type FindBookChangeRequestPayload,
} from '../../../domain/repositories/bookChangeRequestRepository/bookChangeRequestRepository.js';

import { type BookChangeRequestMapper } from './bookChangeRequestMapper/bookChangeRequestMapper.js';

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
        userEmail,
        createdAt,
        authorIds,
        changedFields,
      },
    } = payload;

    const id = this.uuidService.generateUuid();

    try {
      await this.databaseClient<BookChangeRequestRawEntity>(booksChangeRequestsTable.name).insert({
        id,
        title,
        isbn,
        publisher,
        release_year: releaseYear,
        language,
        translator,
        format,
        pages,
        image_url: imageUrl,
        book_id: bookId,
        user_email: userEmail,
        created_at: createdAt,
        author_ids: authorIds?.join(',') ?? undefined,
        changed_fields: changedFields.join(','),
      });
    } catch (error) {
      throw new RepositoryError({
        entity: 'BookChangeRequest',
        operation: 'create',
        originalError: error,
      });
    }

    return (await this.findBookChangeRequest({ id })) as BookChangeRequest;
  }

  public async findBookChangeRequest(payload: FindBookChangeRequestPayload): Promise<BookChangeRequest | null> {
    const { id } = payload;

    let rawEntities: BookChangeRequestWithJoinsRawEntity[];

    try {
      rawEntities = await this.databaseClient<BookChangeRequestRawEntity>(booksChangeRequestsTable.name)
        .select([booksChangeRequestsTable.allColumns, `${booksTable.columns.title} as book_title`])
        .leftJoin(booksTable.name, booksTable.columns.id, booksChangeRequestsTable.columns.book_id)
        .where(booksChangeRequestsTable.columns.id, id);
    } catch (error) {
      throw new RepositoryError({
        entity: 'BookChangeRequest',
        operation: 'find',
        originalError: error,
      });
    }

    const bookChangeRequest = this.bookChangeRequestMapper.mapRawWithJoinsToDomain(rawEntities)[0];

    if (!bookChangeRequest) {
      return null;
    }

    return bookChangeRequest;
  }

  public async findBookChangeRequests(payload: FindBookChangeRequestsPayload): Promise<BookChangeRequest[]> {
    const { userEmail, id, page, pageSize, sortDate } = payload;

    let rawEntities: BookChangeRequestWithJoinsRawEntity[];

    try {
      rawEntities = await this.databaseClient<BookChangeRequestRawEntity>(booksChangeRequestsTable.name)
        .select([booksChangeRequestsTable.allColumns, `${booksTable.columns.title} as book_title`])
        .leftJoin(booksTable.name, booksTable.columns.id, booksChangeRequestsTable.columns.book_id)
        .where((builder) => {
          if (id) {
            builder.where(booksChangeRequestsTable.columns.id, id);
          }

          if (userEmail) {
            builder.where(booksChangeRequestsTable.columns.user_email, userEmail);
          }
        })
        .orderBy(booksChangeRequestsTable.columns.id, sortDate ?? 'desc')
        .limit(pageSize)
        .offset(pageSize * (page - 1));
    } catch (error) {
      throw new RepositoryError({
        entity: 'BookChangeRequest',
        operation: 'find',
        originalError: error,
      });
    }

    return this.bookChangeRequestMapper.mapRawWithJoinsToDomain(rawEntities);
  }

  public async deleteBookChangeRequest(payload: DeleteBookChangeRequestPayload): Promise<void> {
    const { id } = payload;

    try {
      await this.databaseClient<BookChangeRequestRawEntity>(booksChangeRequestsTable.name).delete().where({ id });
    } catch (error) {
      throw new RepositoryError({
        entity: 'BookChangeRequest',
        operation: 'delete',
        originalError: error,
      });
    }
  }

  public async countBookChangeRequests(payload: FindBookChangeRequestsPayload): Promise<number> {
    const { userEmail } = payload;

    try {
      const query = this.databaseClient<BookChangeRequestRawEntity>(booksChangeRequestsTable.name).count().first();

      if (userEmail) {
        query.where(booksChangeRequestsTable.columns.user_email, userEmail);
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
        originalError: error,
      });
    }
  }
}
