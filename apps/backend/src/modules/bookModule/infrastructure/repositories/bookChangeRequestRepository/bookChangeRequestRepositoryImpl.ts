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
import { authorTable } from '../../databases/bookDatabase/tables/authorTable/authorTable.js';
import { bookAuthorTable } from '../../databases/bookDatabase/tables/bookAuthorTable/bookAuthorTable.js';
import { type BookChangeRequestRawEntity } from '../../databases/bookDatabase/tables/bookChangeRequestTable/bookChangeRequestRawEntity.js';
import { bookChangeRequestTable } from '../../databases/bookDatabase/tables/bookChangeRequestTable/bookChangeRequestTable.js';
import { type BookChangeRequestWithJoinsRawEntity } from '../../databases/bookDatabase/tables/bookChangeRequestTable/bookChangeRequestWithJoinsRawEntity.js';
import { bookTable } from '../../databases/bookDatabase/tables/bookTable/bookTable.js';

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
      await this.databaseClient<BookChangeRequestRawEntity>(bookChangeRequestTable).insert(
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
          userEmail,
          createdAt,
          authorIds: authorIds?.join(',') ?? undefined,
          changedFields: changedFields.join(','),
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

    return (await this.findBookChangeRequest({ id })) as BookChangeRequest;
  }

  public async findBookChangeRequest(payload: FindBookChangeRequestPayload): Promise<BookChangeRequest | null> {
    const { id } = payload;

    let rawEntities: BookChangeRequestWithJoinsRawEntity[];

    try {
      rawEntities = await this.databaseClient<BookChangeRequestRawEntity>(bookChangeRequestTable)
        .select([
          `${bookChangeRequestTable}.id`,
          `${bookChangeRequestTable}.title`,
          `${bookChangeRequestTable}.isbn`,
          `${bookChangeRequestTable}.publisher`,
          `${bookChangeRequestTable}.releaseYear`,
          `${bookChangeRequestTable}.language`,
          `${bookChangeRequestTable}.translator`,
          `${bookChangeRequestTable}.format`,
          `${bookChangeRequestTable}.pages`,
          `${bookChangeRequestTable}.imageUrl`,
          `${bookChangeRequestTable}.authorIds`,
          `${bookChangeRequestTable}.bookId`,
          `${bookChangeRequestTable}.userEmail`,
          `${bookChangeRequestTable}.createdAt`,
          `${bookChangeRequestTable}.changedFields`,
          `${bookTable}.title as bookTitle`,
        ])
        .leftJoin(bookTable, (join) => {
          join.on(`${bookTable}.id`, `=`, `${bookChangeRequestTable}.bookId`);
        })
        .where((builder) => {
          builder.where(`${bookChangeRequestTable}.id`, id);
        });
    } catch (error) {
      throw new RepositoryError({
        entity: 'BookChangeRequest',
        operation: 'find',
        error,
      });
    }

    const bookChangeRequest = this.bookChangeRequestMapper.mapRawWithJoinsToDomain(rawEntities)[0] as BookChangeRequest;

    if (!bookChangeRequest) {
      return null;
    }

    return bookChangeRequest;
  }

  public async findBookChangeRequests(payload: FindBookChangeRequestsPayload): Promise<BookChangeRequest[]> {
    const { page, pageSize, userEmail, id } = payload;

    let rawEntities: BookChangeRequestWithJoinsRawEntity[];

    try {
      rawEntities = await this.databaseClient<BookChangeRequestRawEntity>(bookChangeRequestTable)
        .select([
          `${bookChangeRequestTable}.id`,
          `${bookChangeRequestTable}.title`,
          `${bookChangeRequestTable}.isbn`,
          `${bookChangeRequestTable}.publisher`,
          `${bookChangeRequestTable}.releaseYear`,
          `${bookChangeRequestTable}.language`,
          `${bookChangeRequestTable}.translator`,
          `${bookChangeRequestTable}.format`,
          `${bookChangeRequestTable}.pages`,
          `${bookChangeRequestTable}.imageUrl`,
          `${bookChangeRequestTable}.authorIds`,
          `${bookChangeRequestTable}.bookId`,
          `${bookChangeRequestTable}.userEmail`,
          `${bookChangeRequestTable}.createdAt`,
          `${bookChangeRequestTable}.changedFields`,
          `${bookTable}.title as bookTitle`,
        ])
        .leftJoin(bookAuthorTable, (join) => {
          join.on(`${bookAuthorTable}.bookId`, '=', `${bookChangeRequestTable}.bookId`);
        })
        .leftJoin(authorTable, (join) => {
          join.on(`${authorTable}.id`, '=', `${bookAuthorTable}.authorId`);
        })
        .leftJoin(bookTable, (join) => {
          join.on(`${bookTable}.id`, `=`, `${bookChangeRequestTable}.bookId`);
        })
        .where((builder) => {
          if (id) {
            builder.where(`${bookChangeRequestTable}.id`, id);
          }

          if (userEmail) {
            builder.where(`${bookChangeRequestTable}.userEmail`, userEmail);
          }
        })
        .limit(pageSize)
        .offset(pageSize * (page - 1));
    } catch (error) {
      throw new RepositoryError({
        entity: 'BookChangeRequest',
        operation: 'find',
        error,
      });
    }

    return this.bookChangeRequestMapper.mapRawWithJoinsToDomain(rawEntities);
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
    const { userEmail } = payload;

    try {
      const query = this.databaseClient<BookChangeRequestRawEntity>(bookChangeRequestTable).count().first();

      if (userEmail) {
        query.where({ userEmail });
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
