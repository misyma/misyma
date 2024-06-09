import { type QuoteMapper } from './quoteMapper/quoteMapper.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { Quote, type QuoteState } from '../../../domain/entities/quote/quote.js';
import {
  type QuoteRepository,
  type DeletePayload,
  type FindQuotePayload,
  type FindQuotesPayload,
  type SavePayload,
} from '../../../domain/repositories/quoteRepository/quoteRepository.js';
import { type QuoteRawEntity } from '../../databases/bookDatabase/tables/quoteTable/quoteRawEntity.js';
import { quoteTable } from '../../databases/bookDatabase/tables/quoteTable/quoteTable.js';

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
        error,
      });
    }

    if (!rawEntity) {
      return null;
    }

    return this.quoteMapper.mapToDomain(rawEntity);
  }

  public async findQuotes(payload: FindQuotesPayload): Promise<Quote[]> {
    const { userBookId, page, pageSize } = payload;

    let rawEntities: QuoteRawEntity[];

    try {
      rawEntities = await this.databaseClient<QuoteRawEntity>(quoteTable)
        .where({ userBookId })
        .limit(pageSize)
        .offset(pageSize * (page - 1));
    } catch (error) {
      throw new RepositoryError({
        entity: 'Quote',
        operation: 'find',
        error,
      });
    }

    return rawEntities.map((rawEntity) => this.quoteMapper.mapToDomain(rawEntity));
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
        error,
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
        error,
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
        error,
      });
    }
  }

  public async countQuotes(payload: FindQuotesPayload): Promise<number> {
    const { userBookId } = payload;

    try {
      const countResult = await this.databaseClient<QuoteRawEntity>(quoteTable).where({ userBookId }).count().first();

      const count = countResult?.['count(*)'];

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
        error,
      });
    }
  }
}
