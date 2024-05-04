import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Quote } from '../../../domain/entities/quote/quote.js';

export interface FindQuoteByIdPayload {
  readonly id: string;
}

export interface FindQuoteByIdResult {
  readonly quote: Quote;
}

export type FindQuoteByIdQueryHandler = QueryHandler<FindQuoteByIdPayload, FindQuoteByIdResult>;
