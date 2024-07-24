import { type Quote } from './quote.js';
import { type Metadata } from '../metadata.js';
import { type SortingType } from '../sortingType.js';

export interface FindQuotesPathParams {
  readonly userBookId: string;
}

export interface FindQuotesQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortDate?: SortingType;
}

export interface FindQuotesResponseBody {
  readonly data: Quote[];
  readonly metadata: Metadata;
}
