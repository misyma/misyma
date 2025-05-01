import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type UuidService } from '../../../../../libs/uuid/uuidService.js';
import { authorsTable } from '../../../../databaseModule/infrastructure/tables/authorTable/authorTable.js';
import { booksAuthorsTable } from '../../../../databaseModule/infrastructure/tables/bookAuthorTable/bookAuthorTable.js';
import { bookshelvesTable } from '../../../../databaseModule/infrastructure/tables/bookshelfTable/bookshelfTable.js';
import { booksTable } from '../../../../databaseModule/infrastructure/tables/bookTable/bookTable.js';
import { type QuoteRawEntity } from '../../../../databaseModule/infrastructure/tables/quoteTable/quoteRawEntity.js';
import { quoteTable } from '../../../../databaseModule/infrastructure/tables/quoteTable/quoteTable.js';
import { type QuoteWithJoinsRawEntity } from '../../../../databaseModule/infrastructure/tables/quoteTable/quoteWithJoinsRawEntity.js';
import { userBookTable } from '../../../../databaseModule/infrastructure/tables/userBookTable/userBookTable.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { Quote, type QuoteState } from '../../../domain/entities/quote/quote.js';
import {
  type QuoteRepository,
  type DeletePayload,
  type FindQuotePayload,
  type FindQuotesPayload,
  type SavePayload,
  type CountQuotesPayload,
} from '../../../domain/repositories/quoteRepository/quoteRepository.js';

import { type QuoteMapper } from './quoteMapper/quoteMapper.js';

type CreateQuotePayload = { quote: QuoteState };

type UpdateQuotePayload = { quote: Quote };

export class QuoteRepositoryImpl implements QuoteRepository {
  public constructor(
    private readonly databaseClient: DatabaseClient,
    private readonly quoteMapper: QuoteMapper,
    private readonly uuidService: UuidService,
  ) {}

  public async findQuote(payload: FindQuotePayload): Promise<Quote | null> {
    const { id } = payload;

    let rawEntity: QuoteRawEntity | undefined;

    try {
      rawEntity = await this.databaseClient<QuoteRawEntity>(quoteTable).where({ id }).first();
    } catch (error) {
      throw new RepositoryError({
        entity: 'Quote',
        operation: 'find',
        originalError: error,
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.quoteMapper.mapToDomain(rawEntity);
  }

  public async findQuotes(payload: FindQuotesPayload): Promise<Quote[]> {
    const { userId, userBookId, authorId, isFavorite, page, pageSize, sortDate } = payload;

    let rawEntities: QuoteWithJoinsRawEntity[];

    try {
      const query = this.databaseClient<QuoteWithJoinsRawEntity>(quoteTable)
        .select([
          `${quoteTable}.*`,
          this.databaseClient.raw(`array_agg(DISTINCT "${authorsTable}"."name") as "authors"`),
          `${booksTable}.title as bookTitle`,
        ])
        .leftJoin(userBookTable, (join) => {
          join.on(`${userBookTable}.id`, `=`, `${quoteTable}.userBookId`);
        })
        .leftJoin(booksAuthorsTable, (join) => {
          join.on(`${booksAuthorsTable}.bookId`, '=', `${userBookTable}.bookId`);
        })
        .leftJoin(authorsTable, (join) => {
          join.on(`${authorsTable}.id`, '=', `${booksAuthorsTable}.authorId`);
        })
        .leftJoin(booksTable, (join) => {
          join.on(`${booksTable}.id`, `=`, `${userBookTable}.bookId`);
        })
        .leftJoin(bookshelvesTable, (join) => {
          join.on(`${bookshelvesTable}.id`, `=`, `${userBookTable}.bookshelfId`);
        });

      if (authorId) {
        query.where(`${authorsTable}.id`, authorId);
      }

      query.where(`${bookshelvesTable}.userId`, userId);

      if (userBookId) {
        query.where(`${quoteTable}.userBookId`, userBookId);
      }

      if (isFavorite !== undefined) {
        query.where(`${quoteTable}.isFavorite`, isFavorite);
      }

      query.groupBy([`${quoteTable}.id`, `${booksTable}.id`]);

      query.orderBy('id', sortDate ?? 'desc');

      rawEntities = await query.limit(pageSize).offset(pageSize * (page - 1));
    } catch (error) {
      throw new RepositoryError({
        entity: 'Quote',
        operation: 'find',
        originalError: error,
      });
    }

    return rawEntities.map((rawEntity) => this.quoteMapper.mapRawEntityWithJoinsToDomain(rawEntity));
  }

  private async create(entity: CreateQuotePayload): Promise<Quote> {
    const { quote } = entity;

    let rawEntity: QuoteRawEntity;

    try {
      const result = await this.databaseClient<QuoteRawEntity>(quoteTable).insert(
        {
          id: this.uuidService.generateUuid(),
          userBookId: quote.userBookId,
          content: quote.content,
          createdAt: quote.createdAt,
          isFavorite: quote.isFavorite,
          page: quote.page,
        },
        '*',
      );

      rawEntity = result[0] as QuoteRawEntity;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Quote',
        operation: 'create',
        originalError: error,
      });
    }

    return this.quoteMapper.mapToDomain(rawEntity);
  }

  private async update(payload: UpdateQuotePayload): Promise<Quote> {
    const { quote } = payload;

    let rawEntity: QuoteRawEntity;

    try {
      const result = await this.databaseClient<QuoteRawEntity>(quoteTable)
        .where({ id: quote.getId() })
        .update(quote.getState(), '*');

      rawEntity = result[0] as QuoteRawEntity;
    } catch (error) {
      throw new RepositoryError({
        entity: 'Quote',
        operation: 'update',
        originalError: error,
      });
    }

    return this.quoteMapper.mapToDomain(rawEntity);
  }

  public async saveQuote(payload: SavePayload): Promise<Quote> {
    const { quote } = payload;

    if (quote instanceof Quote) {
      return this.update({ quote });
    }

    return this.create({ quote });
  }

  public async deleteQuote(payload: DeletePayload): Promise<void> {
    const { id } = payload;

    try {
      await this.databaseClient<QuoteRawEntity>(quoteTable).where({ id }).delete();
    } catch (error) {
      throw new RepositoryError({
        entity: 'Quote',
        operation: 'delete',
        originalError: error,
      });
    }
  }

  public async countQuotes(payload: CountQuotesPayload): Promise<number> {
    const { userId, userBookId, authorId, isFavorite } = payload;

    try {
      const query = this.databaseClient<QuoteRawEntity>(quoteTable)
        .leftJoin(userBookTable, (join) => {
          join.on(`${userBookTable}.id`, `=`, `${quoteTable}.userBookId`);
        })
        .leftJoin(bookshelvesTable, (join) => {
          join.on(`${bookshelvesTable}.id`, `=`, `${userBookTable}.bookshelfId`);
        });

      if (authorId) {
        query
          .leftJoin(booksAuthorsTable, (join) => {
            join.on(`${booksAuthorsTable}.bookId`, `=`, `${userBookTable}.bookId`);
          })
          .leftJoin(authorsTable, (join) => {
            join.on(`${authorsTable}.id`, `=`, `${booksAuthorsTable}.authorId`);
          })
          .where(`${authorsTable}.id`, authorId);
      }

      query.where(`${bookshelvesTable}.userId`, userId);

      if (userBookId) {
        query.where(`${quoteTable}.userBookId`, userBookId);
      }

      if (isFavorite !== undefined) {
        query.where(`${quoteTable}.isFavorite`, isFavorite);
      }

      const countResult = await query.count().first();

      const count = countResult?.['count'];

      if (count === undefined) {
        throw new RepositoryError({
          entity: 'Quote',
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
        entity: 'Quote',
        operation: 'count',
        originalError: error,
      });
    }
  }
}
