import { type SortingType } from '@common/contracts';

import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Quote } from '../../../domain/entities/quote/quote.js';

export interface FindQuotesQueryHandlerPayload {
  readonly userBookId: string;
  readonly page: number;
  readonly pageSize: number;
  readonly sortDate?: SortingType | undefined;
}

export interface FindQuotesQueryHandlerResult {
  readonly quotes: Quote[];
  readonly total: number;
}

export type FindQuotesQueryHandler = QueryHandler<FindQuotesQueryHandlerPayload, FindQuotesQueryHandlerResult>;
