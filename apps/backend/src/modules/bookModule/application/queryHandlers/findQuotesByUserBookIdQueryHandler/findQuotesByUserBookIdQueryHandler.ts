import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Quote } from '../../../domain/entities/quote/quote.js';

export interface FindQuotesByUserBookIdPayload {
  readonly userBookId: string;
  readonly page: number;
  readonly pageSize: number;
}

export interface FindQuotesByUserBookIdResult {
  readonly quotes: Quote[];
  readonly total: number;
}

export type FindQuotesByUserBookIdQueryHandler = QueryHandler<
  FindQuotesByUserBookIdPayload,
  FindQuotesByUserBookIdResult
>;
