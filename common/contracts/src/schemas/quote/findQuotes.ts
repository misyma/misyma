import { type Metadata } from '../metadata.js';
import { type SortOrder } from '../sortOrder.js';

import { type Quote } from './quote.js';

export interface FindQuotesQueryParams {
  readonly authorId?: string;
  readonly userBookId?: string;
  readonly isFavorite?: boolean;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortDate?: SortOrder;
}

export interface FindQuotesResponseBody {
  readonly data: Quote[];
  readonly metadata: Metadata;
}
