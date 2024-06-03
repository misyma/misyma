import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Quote } from '../../../domain/entities/quote/quote.js';

export interface FindQuotesPayload {
  readonly userBookId: string;
  readonly page: number;
  readonly pageSize: number;
}

export interface FindQuotesResult {
  readonly quotes: Quote[];
  readonly total: number;
}

export type FindQuotesQueryHandler = QueryHandler<FindQuotesPayload, FindQuotesResult>;
