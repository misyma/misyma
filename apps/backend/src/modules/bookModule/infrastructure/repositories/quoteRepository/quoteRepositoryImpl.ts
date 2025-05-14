import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type UuidService } from '../../../../../libs/uuid/uuidService.js';
import { authorsTable } from '../../../../databaseModule/infrastructure/tables/authorsTable/authorsTable.js';
import { booksAuthorsTable } from '../../../../databaseModule/infrastructure/tables/booksAuthorsTable/booksAuthorsTable.js';
import { bookshelvesTable } from '../../../../databaseModule/infrastructure/tables/bookshelvesTable/bookshelvesTable.js';
import { booksTable } from '../../../../databaseModule/infrastructure/tables/booksTable/booksTable.js';
import { type QuoteRawEntity } from '../../../../databaseModule/infrastructure/tables/quotesTable/quoteRawEntity.js';
import { quotesTable } from '../../../../databaseModule/infrastructure/tables/quotesTable/quotesTable.js';
import { type QuoteWithJoinsRawEntity } from '../../../../databaseModule/infrastructure/tables/quotesTable/quoteWithJoinsRawEntity.js';
import { usersBooksTable } from '../../../../databaseModule/infrastructure/tables/usersBooksTable/usersBooksTable.js';
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
      rawEntity = await this.databaseClient<QuoteRawEntity>(quotesTable.name).where({ id }).first();
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
      const query = this.databaseClient<QuoteWithJoinsRawEntity>(quotesTable.name)
        .select([
          quotesTable.allColumns,
          this.databaseClient.raw(`array_agg(DISTINCT ${authorsTable.columns.name}) as "authors"`),
          `${booksTable.columns.title} as book_title`,
        ])
        .leftJoin(usersBooksTable.name, usersBooksTable.columns.id, quotesTable.columns.user_book_id)
        .leftJoin(booksAuthorsTable.name, booksAuthorsTable.columns.book_id, usersBooksTable.columns.book_id)
        .leftJoin(authorsTable.name, authorsTable.columns.id, booksAuthorsTable.columns.author_id)
        .leftJoin(booksTable.name, booksTable.columns.id, usersBooksTable.columns.book_id)
        .leftJoin(bookshelvesTable.name, bookshelvesTable.columns.id, usersBooksTable.columns.bookshelf_id);

      if (authorId) {
        query.where(authorsTable.columns.id, authorId);
      }

      query.where(bookshelvesTable.columns.user_id, userId);

      if (userBookId) {
        query.where(quotesTable.columns.user_book_id, userBookId);
      }

      if (isFavorite !== undefined) {
        query.where(quotesTable.columns.is_favorite, isFavorite);
      }

      query.groupBy([quotesTable.columns.id, booksTable.columns.id]);

      query.orderBy(quotesTable.columns.id, sortDate ?? 'desc');

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
      const result = await this.databaseClient<QuoteRawEntity>(quotesTable.name).insert(
        {
          id: this.uuidService.generateUuid(),
          user_book_id: quote.userBookId,
          content: quote.content,
          created_at: quote.createdAt,
          is_favorite: quote.isFavorite,
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
      const { content, isFavorite, page } = quote.getState();
      const result = await this.databaseClient<QuoteRawEntity>(quotesTable.name)
        .where({ id: quote.getId() })
        .update({ content, is_favorite: isFavorite, page }, '*');

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
      await this.databaseClient<QuoteRawEntity>(quotesTable.name).where({ id }).delete();
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
      const query = this.databaseClient<QuoteRawEntity>(quotesTable.name)
        .leftJoin(usersBooksTable.name, usersBooksTable.columns.id, quotesTable.columns.user_book_id)
        .leftJoin(bookshelvesTable.name, bookshelvesTable.columns.id, usersBooksTable.columns.bookshelf_id);

      if (authorId) {
        query
          .leftJoin(booksAuthorsTable.name, booksAuthorsTable.columns.book_id, usersBooksTable.columns.book_id)
          .leftJoin(authorsTable.name, authorsTable.columns.id, booksAuthorsTable.columns.author_id)
          .where(authorsTable.columns.id, authorId);
      }

      query.where(bookshelvesTable.columns.user_id, userId);

      if (userBookId) {
        query.where(quotesTable.columns.user_book_id, userBookId);
      }

      if (isFavorite !== undefined) {
        query.where(quotesTable.columns.is_favorite, isFavorite);
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
