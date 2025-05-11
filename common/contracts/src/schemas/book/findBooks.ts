import { type Metadata } from '../metadata.js';
import { type SortOrder } from '../sortOrder.js';

import { type Book } from './book.js';

export interface FindBooksQueryParams {
  readonly isbn?: string;
  readonly title?: string;
  readonly excludeOwned?: boolean;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortField?: 'releaseYear' | 'createdAt';
  readonly sortOrder?: SortOrder;
}

export interface FindBooksResponseBody {
  readonly data: Book[];
  readonly metadata: Metadata;
}
