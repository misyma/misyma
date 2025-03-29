import { type Metadata } from '../metadata.js';
import { type SortOrder } from '../sortOrder.js';

import { type BookReading } from './bookReading.js';

export interface FindBookReadingsPathParams {
  readonly userBookId: string;
}

export interface FindBookReadingsQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortDate?: SortOrder;
}

export interface FindBookReadingsResponseBody {
  readonly data: BookReading[];
  readonly metadata: Metadata;
}
